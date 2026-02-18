const express = require("express");
const router = express.Router();
const { getAllParks } = require("../controllers/parkController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("parks")
      .select("id, name, latitude, longitude, confidence_score");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch parks" });
  }
});

module.exports = router;

