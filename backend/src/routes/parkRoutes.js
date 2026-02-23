const express = require("express");
const router = express.Router();
const { getAllParks } = require("../controllers/parkController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, getAllParks);

module.exports = router;
