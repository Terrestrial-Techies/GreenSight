const express = require("express");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

app.use("/auth", authRoutes);


const parkRoutes = require("./routes/parkRoutes");

const app = express();
app.use(express.json());

app.use("/parks", parkRoutes);

app.listen(5000, () => {
  console.log("Server running ");
});
const chatbotRoutes = require("./src/routes/chatbotRoutes");

app.use("/chatbot", chatbotRoutes);

const recommendationRoutes = require("./src/routes/recommendationRoutes");

app.use("/recommendations", recommendationRoutes);

