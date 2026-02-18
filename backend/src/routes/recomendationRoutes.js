const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const supabase = require("../config/supabaseClient");
const { getRecommendations } = require("../services/recommendationService");


router.post("/", verifyToken, async (req, res) => {
  try {
    const { preference } = req.body;

    if (!preference) {
      return res.status(400).json({ error: "Preference is required" });
    }

    // Fetch parks
    const { data: parks, error } = await supabase
      .from("parks")
      .select("*");

    if (error) throw error;

    // Simple filtering logic
    let filteredParks = parks;

    if (preference === "quiet") {
      filteredParks = parks.filter(p =>
        p.access_type === "Public" && p.confidence_score > 60
      );
    }

    if (preference === "family") {
      filteredParks = parks.filter(p =>
        p.confidence_score > 50
      );
    }

    // Sort by confidence score descending
    filteredParks.sort((a, b) => b.confidence_score - a.confidence_score);

    // Return top 5
    const recommendations = filteredParks.slice(0, 5);

    res.json({ recommendations });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

module.exports = router;
