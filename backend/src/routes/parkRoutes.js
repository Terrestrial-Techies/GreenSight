const express = require("express");
const router = express.Router();
const { getAllParks, getNearbyParks, getParkById } = require("../controllers/parkController");

router.get("/", getAllParks);
router.get("/nearby", getNearbyParks);
router.get("/:parkId/enrich", getParkById);

// 1. Fetch all parks
router.get("/", verifyToken, getAllParks);

// 2. Nearby Parks (GET and POST)
router.get("/nearby", verifyToken, getNearbyParks);
router.post("/nearby", verifyToken, getNearbyParks); 

// 3. Specific park details
// This MUST be last so it doesn't intercept "/nearby"
router.get("/:id", verifyToken, enrichPark);

module.exports = router;
