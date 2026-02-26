const express = require("express");
const router = express.Router();
<<<<<<< HEAD
<<<<<<< HEAD

const { getAllParks } = require("../controllers/parkController.js");
const verifyToken = require("../middleware/authmiddleware");

router.get("/", verifyToken, getAllParks);

module.exports = router;

const { getAllParks, getNearbyParks } = require("../controllers/parkController");

router.get("/", getAllParks);
router.get("/nearby", getNearbyParks);

module.exports = router;

=======
const { getAllParks, getNearbyParks } = require("../controllers/parkControllers");
=======
const { getAllParks, getNearbyParks } = require("../controllers/parkController");
>>>>>>> c7bc01c (update)

router.get("/", getAllParks);
router.get("/nearby", getNearbyParks);

module.exports = router;
>>>>>>> 5e539e2 (try this)
