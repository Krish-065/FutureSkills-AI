const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");

const auth = require("../middleware/auth");

const router = express.Router();
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

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
        `${PYTHON_SERVICE_URL}/stats/summary`
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
        `${PYTHON_SERVICE_URL}/stats/trend`
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
        `${PYTHON_SERVICE_URL}/stats/top`
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
// FORECAST
// =========================

router.get("/forecast", auth, async (req, res) => {
  try {
    const { metric = "jobs", horizon = 14 } = req.query;
    const cacheKey = `forecast_${metric}_${horizon}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json({
        source: "cache",
        data: cachedData
      });
    }

    const response = await axios.get(
      `${PYTHON_SERVICE_URL}/stats/forecast?metric=${metric}&horizon=${horizon}`
    );

    cache.set(cacheKey, response.data);

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
// JOBS
// =========================

router.get("/jobs", auth, async (req, res) => {
  try {
    const cachedData = cache.get("jobs_list");

    if (cachedData) {
      return res.json({
        source: "cache",
        data: cachedData
      });
    }

    const response = await axios.get(
      `${PYTHON_SERVICE_URL}/stats/jobs`
    );

    cache.set("jobs_list", response.data);

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