const express = require("express");
const router = express.Router();
const { getAllReviews, submitReview, upload } = require("../controllers/communityController");

router.get("/", getAllReviews);
router.post("/", upload.single("image"), submitReview);

module.exports = router;
