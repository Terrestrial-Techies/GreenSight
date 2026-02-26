const express = require("express");
const router = express.Router();
const { getAllParks, getNearbyParks, getParkById } = require("../controllers/parkControllers");

router.get("/", getAllParks);
router.get("/nearby", getNearbyParks);
router.get("/:parkId/enrich", getParkById);

module.exports = router;
