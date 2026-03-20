const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { getAllParks, getNearbyParks, enrichPark } = require("../controllers/parkController");

router.get("/", getAllParks);
router.get("/nearby", getNearbyParks);
router.get("/:parkId/enrich", enrichPark);
=======
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
>>>>>>> ae0958d016279d0c5708eab0d3f91cde54dc553f

// 4. Get park by ID (this MUST be last)
router.get("/:id", verifyToken, getParkById);

module.exports = router;
