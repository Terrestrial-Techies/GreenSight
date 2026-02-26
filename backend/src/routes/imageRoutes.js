const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const imageService = require("../services/imageService");

// Simple in-memory rate limiter for the refresh endpoint (per IP)
const refreshLimits = new Map();
const REFRESH_LIMIT = parseInt(process.env.IMAGE_REFRESH_LIMIT || "5", 10);
const REFRESH_WINDOW_SECONDS = parseInt(process.env.IMAGE_REFRESH_WINDOW_SECONDS || "3600", 10);

function checkRefreshAllowed(ip) {
  const now = Date.now();
  const entry = refreshLimits.get(ip) || { count: 0, firstSeen: now };
  if (now - entry.firstSeen > REFRESH_WINDOW_SECONDS * 1000) {
    // reset
    entry.count = 0;
    entry.firstSeen = now;
  }
  entry.count += 1;
  refreshLimits.set(ip, entry);
  return entry.count <= REFRESH_LIMIT;
}

// GET /parks/:parkId/images
router.get("/:parkId/images", async (req, res) => {
  const { parkId } = req.params;
  try {
    const { data: parkData, error } = await supabase.from("parks").select("*").eq("id", parkId).single();
    if (error && error.code !== "PGRST116") {
      // PGRST116 is Supabase "No rows" sentinel; we'll treat missing park as not found
    }

    const park = parkData || {};
    const images = await imageService.getImagesForPark(parkId, park);
    res.json(images);
  } catch (err) {
    console.error("Error fetching images for park", parkId, err);
    res.status(500).json({ error: "Failed to fetch images", details: err.message });
  }
});

// POST /parks/:parkId/images/refresh - force refresh from external providers
router.post("/:parkId/images/refresh", async (req, res) => {
  const { parkId } = req.params;
  const ip = req.headers["x-forwarded-for"] || req.ip;
  if (!checkRefreshAllowed(ip)) {
    return res.status(429).json({ error: "Rate limit exceeded for image refresh" });
  }
  try {
    const { data: parkData } = await supabase.from("parks").select("*").eq("id", parkId).single();
    const park = parkData || {};
    const images = await imageService.refreshImagesForPark(parkId, park);
    res.json({ refreshed: true, images });
  } catch (err) {
    console.error("Error refreshing images for park", parkId, err);
    res.status(500).json({ error: "Failed to refresh images", details: err.message });
  }
});

module.exports = router;
