const express = require("express");
const cors = require("cors");
const axios = require("axios"); // <-- add this

const app = express();

app.use(cors());
app.use(express.json());

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
      python: "unreachable",
      error: error.message
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});