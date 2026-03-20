const express = require("express");
const router = express.Router();
const { getAllParks, getNearbyParks, enrichPark } = require("../controllers/parkController");

router.get("/", getAllParks);
router.get("/nearby", getNearbyParks);
router.get("/:parkId/enrich", enrichPark);

module.exports = router;