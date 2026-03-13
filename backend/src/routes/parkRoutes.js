const express = require("express");
const router = express.Router();
const { 
  getAllParks, 
  getNearbyParks, 
  getParkById,
  enrichPark 
} = require("../controllers/parkController");
const verifyToken = require("../middleware/authmiddleware");

// 1. Fetch all parks
router.get("/", verifyToken, getAllParks);

// 2. Nearby Parks (GET and POST)
router.get("/nearby", verifyToken, getNearbyParks);
router.post("/nearby", verifyToken, getNearbyParks);

// 3. Enrich park data (specific endpoint - must come before /:id)
router.get("/:parkId/enrich", verifyToken, enrichPark);

// 4. Get park by ID (this MUST be last)
router.get("/:id", verifyToken, getParkById);

module.exports = router;
