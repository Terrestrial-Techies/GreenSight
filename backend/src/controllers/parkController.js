const supabase = require("../config/supabase");
const { getImagesForPark, refreshImagesForPark } = require("../services/imageService");

// Fetch all parks
const getAllParks = async (req, res) => {
  const { data, error } = await supabase
    .from("parks")
    .select("*");

  if (error) return res.status(400).json(error);

  try {
    const parkIds = data.map(p => p.id);
    const { data: images } = await supabase
      .from("images")
      .select("*")
      .in("park_id", parkIds)
      .eq("is_primary", true);

    const GENERIC_URLS = [
      'https://images.unsplash.com/photo-1568480289356-5a75d0fd47fc?w=400',
      'https://images.unsplash.com/photo-1598908317378-87fb952c87d3?w=400',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400',
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=400',
      'https://images.unsplash.com/photo-1569516445849-ee4c69b5943f?w=400'
    ];

    const parksWithImages = data.map(park => {
      const primaryImage = images?.find(img => img.park_id === park.id);
      
      const isGeneric = park.image_url && GENERIC_URLS.some(g => park.image_url.startsWith(g));
      
      // BACKGROUND DISCOVERY: If no image exists OR it's a generic placeholder, trigger a discover task
      if ((!park.image_url && !primaryImage) || isGeneric) {
        // We use refresh to bypass cache and find a NEW legit one
        refreshImagesForPark(park.id, park).catch(() => {}); 
      }

      return {
        ...park,
        image_url: park.image_url || primaryImage?.url || null
      };
    });
    res.json(parksWithImages);
  } catch (err) {
    res.json(data);
  }
};

// NEW: Fetch specific park details (enrichPark)
const enrichPark = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("parks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Park not found" });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch park details" });
  }
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
  return R * c; 
}

// Get nearby parks
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

    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select("park_id, review_text");

    if (reviewError) throw reviewError;

    const parksWithDistance = parks.map(park => {
      const parkReviews = reviews.filter(r => r.park_id === park.id);
      return {
        ...park,
        distance: getDistance(userLat, userLng, park.latitude, park.longitude),
        reviews_count: parkReviews.length,
        latest_review: parkReviews[parkReviews.length - 1]?.review_text || null
      };
    });

    parksWithDistance.sort((a, b) => a.distance - b.distance);
    const topParks = parksWithDistance.slice(0, limit);

    // Fetch legit images for top parks (including external lookups if needed)
    const enrichedParks = await Promise.all(topParks.map(async (park) => {
      try {
        const images = await getImagesForPark(park.id, park);
        const primaryImage = images.find(img => img.is_primary) || images[0];
        return {
          ...park,
          image_url: park.image_url || primaryImage?.url || null
        };
      } catch (e) {
        return park;
      }
    }));

    res.json(enrichedParks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch nearby parks" });
  }
};

const getParkById = async (req, res) => {
  const { parkId } = req.params;
  try {
    const { data: park, error } = await supabase
      .from("parks")
      .select("*")
      .eq("id", parkId)
      .single();

    if (error) throw error;

    // Fetch legit images from our images table or external providers (Google/Unsplash)
    // The imageService handles the logic of checking the DB first, then external APIs
    const images = await getImagesForPark(parkId, park);
    const primaryImage = images.find(img => img.is_primary) || images[0];

    res.json({
      ...park,
      image_url: park.image_url || primaryImage?.url || null,
      gallery: images.map(img => img.url),
      images: images // providing full image objects if needed
    });
  } catch (err) {
    console.error("Enrichment error:", err);
    res.status(500).json({ error: "Failed to fetch park details" });
  }
};

module.exports = { getAllParks, getNearbyParks, getParkById, enrichPark };
