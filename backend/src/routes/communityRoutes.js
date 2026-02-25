const express = require("express");
const router = express.Router();

const { getAllReviews, submitReview, upload } = require("../controllers/communityController");

router.get("/", getAllReviews);

// Submit a new review 
// upload.single("image") parses the multipart/form-data from your ReviewModal
router.post("/", upload.single("image"), submitReview);

module.exports = router;