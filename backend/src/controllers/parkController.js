const supabase = require("../config/supabase");
const imageService = require("../services/imageService");
const axios = require("axios");

// Fetch all parks
const getAllParks = async (req, res) => {
  const { data, error } = await supabase
    .from("parks")
    .select("*");

  if (error) return res.status(400).json(error);
  res.json(data);
};

// Helper: calculate distance (Haversine Formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

const getNearbyParks = async (req, res) => {
  try {
    const { latitude, longitude, city } = req.body;
    const limit = parseInt(req.body.limit) || 10;
    
    let cityName = city || "Lagos";
    let parksToProcess = [];

    // 1. Fetch ALL parks first to have data to work with
    const { data: parks, error: parkError } = await supabase
      .from("parks")
      .select("*");

    if (parkError) throw parkError;

    // 2. Process based on Input Type
    if (latitude && longitude) {
      // --- GPS FLOW ---
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);

      // Attempt to get city name for the UI
      try {
        const geoRes = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}`,
          { headers: { 'User-Agent': 'GreenSight-App' }, timeout: 5000 }
        );
        cityName = geoRes.data.address.city || geoRes.data.address.town || geoRes.data.address.state || "Lagos";
      } catch (e) {
        console.error("Geocoding service timed out, using default city name.");
      }

      // Calculate distances and filter by radius
      parksToProcess = parks.map(park => {
        const distance = getDistance(userLat, userLng, park.latitude, park.longitude);
        return { ...park, distance: parseFloat(distance.toFixed(2)) };
      }).filter(park => park.distance < 50); // 50km radius
      
      parksToProcess.sort((a, b) => a.distance - b.distance);

    } else if (city) {
      // --- MANUAL CITY FLOW ---
      cityName = city;
      // Filter parks where the location name matches the input string
      parksToProcess = parks.filter(park => 
        park.location?.toLowerCase().includes(city.toLowerCase()) ||
        park.address?.toLowerCase().includes(city.toLowerCase())
      );
    } else {
      return res.status(400).json({ error: "Please provide either coordinates or a city name." });
    }

    // 3. Attach reviews (Social Proof)
    const { data: reviews } = await supabase.from("reviews").select("park_id, review_text");
    
    const finalParks = parksToProcess.map(park => {
      const parkReviews = reviews?.filter(r => r.park_id === park.id) || [];
      return {
        ...park,
        reviews_count: parkReviews.length,
        latest_review: parkReviews[parkReviews.length - 1]?.review_text || null
      };
    });

    res.json({
      city: cityName,
      results_count: finalParks.length,
      parks: finalParks.slice(0, limit)
    });

  } catch (err) {
    console.error("Nearby Parks Error:", err);
    res.status(500).json({ error: "Internal Server Error. Check backend console for details." });
  }
};

const enrichPark = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: park, error } = await supabase
      .from("parks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !park) return res.status(404).json({ error: "Park not found" });

    let images = [];
    try {
      images = await imageService.getImagesForPark(id, park);
    } catch (imgErr) {
      console.error("Image service error:", imgErr);
    }

    res.json({
      ...park,
      image: park.image_url || park.image || (images[0] ? images[0].url : null),
      gallery: images.map(img => img.url),
      ai_summary: park.ai_summary || park.description || "A beautiful green space.",
      facilities: park.facilities || [
        { name: "Walking Paths", available: true },
        { name: "Seating", available: true }
      ],
      crowd_level: park.crowd_level || "Moderate",
      cleanliness: park.cleanliness || "Excellent",
      safety_perception: park.safety_perception || "High",
      pricing: park.pricing || "Free Access",
      address: park.address || park.location || "Lagos, Nigeria"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to enrich park data" });
  }
};

module.exports = { getAllParks, getNearbyParks, enrichPark };