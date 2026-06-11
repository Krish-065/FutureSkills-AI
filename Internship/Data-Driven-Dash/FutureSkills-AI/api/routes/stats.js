const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");

const auth = require("../middleware/auth");

const router = express.Router();

const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120
});


// =========================
// SUMMARY
// =========================

router.get("/summary", auth, async (req, res) => {

  try {

    const cachedData =
      cache.get("summary");

    if (cachedData) {

      return res.json({
        source: "cache",
        data: cachedData
      });

    }

    console.log(
      "Fetching Summary From Python Service"
    );

    const response =
      await axios.get(
        "http://localhost:8000/stats/summary"
      );

    cache.set(
      "summary",
      response.data
    );

    res.json({
      source: "database",
      data: response.data
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// =========================
// TREND
// =========================

router.get("/trend", auth, async (req, res) => {

  try {

    const cachedData =
      cache.get("trend");

    if (cachedData) {

      return res.json({
        source: "cache",
        data: cachedData
      });

    }

    console.log(
      "Fetching Trend From Python Service"
    );

    const response =
      await axios.get(
        "http://localhost:8000/stats/trend"
      );

    cache.set(
      "trend",
      response.data
    );

    res.json({
      source: "database",
      data: response.data
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// =========================
// TOP
// =========================

router.get("/top", auth, async (req, res) => {

  try {

    const cachedData =
      cache.get("top");

    if (cachedData) {

      return res.json({
        source: "cache",
        data: cachedData
      });

    }

    console.log(
      "Fetching Top Stats From Python Service"
    );

    const response =
      await axios.get(
        "http://localhost:8000/stats/top"
      );

    cache.set(
      "top",
      response.data
    );

    res.json({
      source: "database",
      data: response.data
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// =========================
// CACHE CLEAR
// =========================

router.delete("/cache", auth, (req, res) => {

  cache.flushAll();

  res.json({
    message: "Cache Cleared Successfully"
  });

});


module.exports = router;