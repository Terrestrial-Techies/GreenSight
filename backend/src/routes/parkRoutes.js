const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Made this PUBLIC so the map works immediately
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("parks")
      .select("*");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Failed to fetch parks", details: err.message });
  }
});

module.exports = router;
