// src/controllers/parkController.js
const supabase = require("../config/supabase");

/**
 * Get all parks
 */
const getAllParks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("parks")
      .select("*");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching parks:", err);
    res.status(500).json({ error: "Failed to fetch parks" });
  }
};

/**
 * Get nearby parks based on user's latitude & longitude
 * Expects query params: lat, lng
 */
const getNearbyParks = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    // Fetch all parks first
    const { data: parks, error } = await supabase.from("parks").select("*");
    if (error) throw error;

    // Calculate distance using Haversine formula
    const toRad = (value) => (value * Math.PI) / 180;
    const distanceBetween = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of Earth in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    // Sort parks by distance
    const nearby = parks
      .map((park) => ({
        ...park,
        distance: distanceBetween(lat, lng, park.latitude, park.longitude),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // return top 10 closest parks

    res.json(nearby);
  } catch (err) {
    console.error("Error fetching nearby parks:", err);
    res.status(500).json({ error: "Failed to fetch nearby parks" });
  }
};

module.exports = { getAllParks, getNearbyParks };