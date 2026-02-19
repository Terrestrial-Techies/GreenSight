const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./src/routes/authRoutes");
const parkRoutes = require("./src/routes/parkRoutes");
const chatbotRoutes = require("./src/routes/chatbotRoutes");
const recommendationRoutes = require("./src/routes/recomendationRoutes");

app.use("/auth", authRoutes);
app.use("/parks", parkRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/recommendations", recommendationRoutes);

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
