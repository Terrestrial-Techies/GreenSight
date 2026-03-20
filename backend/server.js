const express = require("express");
const cors = require("cors");
const path = require("path");

if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config({ path: path.join(__dirname, '.env') });
  console.log('📝 Loaded .env file for development');
} else {
  console.log('🚀 Running in production, using Render environment variables');
}

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
app.use("/auth", authRoutes);
app.use('/community', communityRoutes);
app.use("/parks", parkRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/recommendations", recommendationRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/support', supportRoutes);
app.use("/parks", imageRoutes);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`-----------------------------------------`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Parks endpoint: http://localhost:${PORT}/parks`);
  console.log(`-----------------------------------------`);
});
