const express = require("express");
const router = express.Router();
const { createPost, getAllPosts, upload } = require("../controllers/communityController");

router.get("/", getAllPosts);
router.post("/", upload.single("image"), createPost);

module.exports = router;