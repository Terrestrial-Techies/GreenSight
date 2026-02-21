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
const notificationsRoutes = require("./src/routes/notificationsRoutes");
const communityRoutes = require("./src/routes/communityRoutes");
const supportRoutes = require("./src/routes/supportRoutes");

app.use("/auth", authRoutes);
app.use("/parks", parkRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/recommendations", recommendationRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/community', communityRoutes);
app.use('/support', supportRoutes);

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
