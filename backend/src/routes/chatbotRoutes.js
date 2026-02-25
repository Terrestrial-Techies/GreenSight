const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authmiddleware");
const { handleChatMessage } = require("../services/chatbotService");

const { chatWithGemini } = require("../controllers/chatController");


router.post("/", chatWithGemini);

module.exports = router;
