const express = require("express");
const router = express.Router();

const { createPost, getAllPosts, upload } = require("../controllers/communityController");

// GET all posts
router.get("/", getAllPosts);

// POST new post with optional image
router.post("/", upload.single("image"), createPost);

module.exports = router;