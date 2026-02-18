const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { handleChatMessage } = require("../services/chatbotService");

router.post("/", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userId = req.user.sub;

    const reply = await handleChatMessage(userId, message);

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
