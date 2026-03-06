const express = require("express");
const router = express.Router();

const { chatWithGemini } = require("../controllers/chatbotControllers");  // ✅ Fixed path

// If you need authentication
// const verifyToken = require("../middleware/authmiddleware");
// router.post("/", verifyToken, chatWithGemini);

// If no authentication needed
router.post("/", chatWithGemini);

module.exports = router;
