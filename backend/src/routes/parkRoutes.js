const express = require("express");
const router = express.Router();
const { getAllParks } = require("../controllers/parkController.js");
const verifyToken = require("../middleware/authmiddleware");

router.get("/", verifyToken, getAllParks);

module.exports = router;
