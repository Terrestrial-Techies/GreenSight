const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, '.env') });

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Route Imports ---
const authRoutes = require("./src/routes/authRoutes");
const parkRoutes = require("./src/routes/parkRoutes");
const chatbotRoutes = require("./src/routes/chatbotRoutes");
const recommendationRoutes = require("./src/routes/recomendationRoutes");
const notificationsRoutes = require("./src/routes/notificationsRoutes");
const communityRoutes = require("./src/routes/communityRoutes");
const supportRoutes = require("./src/routes/supportRoutes");
const imageRoutes = require("./src/routes/imageRoutes");

// --- Route Definitions ---

// Auth & User
app.use("/auth", authRoutes);
app.use('/community', communityRoutes);
app.use("/parks", parkRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/recommendations", recommendationRoutes);
app.use('/notifications', notificationsRoutes);

app.use('/support', supportRoutes);
app.use("/parks", imageRoutes);

// Support
app.use('/support', supportRoutes);

// --- Server Startup ---
const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`-----------------------------------------`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Parks endpoint: http://localhost:${PORT}/parks/nearby`);
  console.log(`-----------------------------------------`);
});