const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const statsRoutes =
require("./routes/stats");
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Try again later."
});


app.use(cors());

app.use(express.json());
app.use(limiter);

app.use(morgan("dev"));
app.use(
  "/api/stats",
  statsRoutes
);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error");
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);

app.get("/health", async (req, res) => {
  try {

    const py = await axios.get(
      "http://localhost:8000/health"
    );

    res.json({
      node: "ok",
      python: py.data
    });

  } catch (error) {

    res.status(500).json({
      node: "ok",
      python: "unreachable"
    });

  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});