const express = require("express");
const router = express.Router();
const { getAllParks, getNearbyParks } = require("../controllers/parkControllers");

router.get("/", getAllParks);
router.get("/nearby", getNearbyParks);

module.exports = router;
