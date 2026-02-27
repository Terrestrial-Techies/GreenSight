const express = require("express");
const router = express.Router();
const { getAllParks, getNearbyParks } = require("../controllers/parkController");
const verifyToken = require("../middleware/authmiddleware");

// Parks routes
router.get("/", verifyToken, getAllParks);
router.get("/nearby", verifyToken, getNearbyParks);

module.exports = router;
