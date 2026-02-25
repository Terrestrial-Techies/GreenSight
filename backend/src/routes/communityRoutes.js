const express = require("express");
const router = express.Router();
const { getAllReviews, submitReview } = require("../controllers/communityController");

// Get all reviews for community page
router.get("/", getAllReviews);

// Submit a new review
router.post("/", submitReview);

module.exports = router;
