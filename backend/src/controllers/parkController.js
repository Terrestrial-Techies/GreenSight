const supabase = require("../config/supabase");
const imageService = require("../services/imageService");

// Fetch all parks
const getAllParks = async (req, res) => {
  const { data, error } = await supabase
    .from("parks")
    .select("*");

  if (error) return res.status(400).json(error);

  res.json(data);
};

// Helper: calculate distance
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
  return R * c; // distance in km
}

// NEW: Get nearby parks
const getNearbyParks = async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);
    const limit = parseInt(req.query.limit) || 5;

    // Fetch parks
    const { data: parks, error } = await supabase
      .from("parks")
      .select("id, name, latitude, longitude");

    if (error) throw error;

    // Fetch reviews for parks
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select("park_id, review_text");

    if (reviewError) throw reviewError;

    // Calculate distance and attach number of reviews
    const parksWithDistance = parks.map(park => {
      const parkReviews = reviews.filter(r => r.park_id === park.id);
      return {
        ...park,
        distance: getDistance(userLat, userLng, park.latitude, park.longitude),
        reviews_count: parkReviews.length, // total reviews
        latest_review: parkReviews[parkReviews.length - 1]?.review_text || null
      };
    });

    // Sort by distance and return top N
    parksWithDistance.sort((a, b) => a.distance - b.distance);
    res.json(parksWithDistance.slice(0, limit));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch nearby parks" });
  }
};

// NEW: Enrich park with images and AI data
const enrichPark = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch park from DB
    const { data: park, error } = await supabase
      .from("parks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !park) {
      return res.status(404).json({ error: "Park not found" });
    }

    // 2. Fetch images
    let images = [];
    try {
      images = await imageService.getImagesForPark(id, park);
    } catch (imgErr) {
      console.error("Image service error:", imgErr);
    }

    // 3. Format result
    const enrichedPark = {
      ...park,
      image: park.image_url || park.image || (images[0] ? images[0].url : null),
      gallery: images.map(img => img.url),
      // Fallbacks for frontend expectations
      ai_summary: park.ai_summary || park.description || "A beautiful green space in the heart of the city, offering a peaceful retreat for nature lovers.",
      facilities: park.facilities || [
        { name: "Walking Paths", available: true },
        { name: "Seating", available: true },
        { name: "Greenery", available: true },
        { name: "Security", available: true }
      ],
      crowd_level: park.crowd_level || park.condition || "Moderate",
      cleanliness: park.cleanliness || "Excellent",
      safety_perception: park.safety_perception || "High",
      pricing: park.pricing || "Free Access",
      address: park.address || park.location || "Lagos, Nigeria"
    };

    res.json(enrichedPark);
  } catch (err) {
    console.error("Enrichment error:", err);
    res.status(500).json({ error: "Failed to enrich park data" });
  }
};

module.exports = { getAllParks, getNearbyParks, enrichPark };
