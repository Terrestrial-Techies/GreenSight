const express = require("express");
const router = express.Router();
const { getAllParks, getNearbyParks, enrichPark } = require("../controllers/parkController");
const verifyToken = require("../middleware/authmiddleware");

// Debugging: This will show in your terminal exactly which function is failing to import
console.log("Import check:", { 
  getAllParks: typeof getAllParks, 
  getNearbyParks: typeof getNearbyParks, 
  enrichPark: typeof enrichPark 
});

// 1. Fetch all parks
router.get("/", verifyToken, getAllParks);

// 2. Nearby Parks (GET and POST)
router.get("/nearby", verifyToken, getNearbyParks);
router.post("/nearby", verifyToken, getNearbyParks); 

// 3. Specific park details
// This MUST be last so it doesn't intercept "/nearby"
router.get("/:id", verifyToken, enrichPark);

module.exports = router;