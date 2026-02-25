const express = require("express");
const router = express.Router();
const { chatWithGemini } = require("../controllers/chatbotControllers");

router.post("/", chatWithGemini);

module.exports = router;