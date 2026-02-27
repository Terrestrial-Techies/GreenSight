const express = require("express");
const router = express.Router();
const { getAllParks, getNearbyParks, enrichPark } = require("../controllers/parkController");

// Fetch all parks: GET /parks
router.get("/", getAllParks);

// FIX: Change .get to .post to match the frontend fetch request
// This handles: POST /parks/nearby
router.post("/nearby", getNearbyParks); 

// Fetch specific park details: GET /parks/:id
router.get("/:id", enrichPark);

module.exports = router;