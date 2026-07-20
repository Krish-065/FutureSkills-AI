import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";

import KPI from "../components/KPI";
import TrendChart from "../components/TrendChart";
import SkillChart from "../components/SkillChart";

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL Search Params
  const filterSearch = searchParams.get("search") || "";
  const filterCountry = searchParams.get("country") || "";
  const filterExp = searchParams.get("exp") || "";

  // Data states
  const [summary, setSummary] = useState(null);
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState("");

  // Sorting state for table
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      loadData();
    }
  }, [navigate]);

  const loadData = async () => {
    try {
      setError("");
      const summaryRes = await API.get("/stats/summary");
      const skillsRes = await API.get("/stats/top");
      const forecastRes = await API.get("/stats/forecast?metric=jobs&horizon=14");
      const jobsRes = await API.get("/stats/jobs");

      setSummary(summaryRes.data.data);
      setSkills(skillsRes.data.data);
      setForecastData(forecastRes.data.data);
      setJobs(jobsRes.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard statistics. Please verify the backend services are running and try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleFilterChange = (key, val) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
    setCurrentPage(1); // Reset pagination on filter
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", gap: "20px" }}>
        <h2 style={{ color: "#ef4444", margin: 0 }}>Connection Error</h2>
        <p style={{ color: "#64748b", margin: 0, textAlign: "center", maxWidth: "400px" }}>{error}</p>
        <div>
          <button onClick={loadData} className="logout-btn" style={{ background: "#2563eb", marginRight: "10px" }}>
            Retry
          </button>
          <button onClick={logout} className="logout-btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!summary || !forecastData) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2>Loading FutureSkills-AI Dashboard...</h2>
      </div>
    );
  }

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.job_title?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      job.country?.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesCountry = filterCountry ? job.country === filterCountry : true;
    const matchesExp = filterExp ? job.experience_level === filterExp : true;
    return matchesSearch && matchesCountry && matchesExp;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (!sortField) return 0;
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  });

  // Paginate jobs
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = sortedJobs.slice(indexOfFirstItem, indexOfLastItem);

  // Prep chart data
  const { historical, forecast, forecast_rf, metadata, metadata_rf } = forecastData;
  const combinedTrendData = [
    ...historical.map((h) => ({ date: h.date, value: h.value })),
    {
      date: historical[historical.length - 1]?.date,
      value: historical[historical.length - 1]?.value,
      forecast: historical[historical.length - 1]?.value,
      forecast_rf: historical[historical.length - 1]?.value,
      lower: historical[historical.length - 1]?.value,
      upper: historical[historical.length - 1]?.value,
      lower_rf: historical[historical.length - 1]?.value,
      upper_rf: historical[historical.length - 1]?.value,
    },
    ...forecast.map((f, i) => {
      const rf_point = forecast_rf ? forecast_rf[i] : null;
      return {
        date: f.date,
        forecast: f.value,
        lower: f.lower,
        upper: f.upper,
        forecast_rf: rf_point ? rf_point.value : null,
        lower_rf: rf_point ? rf_point.lower : null,
        upper_rf: rf_point ? rf_point.upper : null,
      };
    }),
  ];

  // Unique lists for filters
  const countries = [...new Set(jobs.map((job) => job.country))].sort();
  const experienceLevels = [...new Set(jobs.map((job) => job.experience_level))].sort();

  return (
    <div className="dashboard">
      <div className="navbar">
        <h2>AI Job Market Intelligence</h2>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="kpi-grid">
        <KPI title="Total Jobs Ingested" value={summary.total_jobs.toLocaleString()} />
        <KPI title="Average Market Salary" value={`$${Math.round(summary.avg_salary).toLocaleString()}`} />
        <KPI title="Top Hiring Country" value={summary.top_country} />
        <KPI title="Most Posted Job Title" value={summary.top_role} />
      </div>

      {metadata && (
        <div className="forecast-meta-card" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#1e1b4b" }}>🤖 Linear Regression Model</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13.5px", lineHeight: "1.6" }}>
              <li><strong>Validation RMSE:</strong> {metadata.rmse}</li>
              <li><strong>Validation MAPE:</strong> {metadata.mape}</li>
            </ul>
          </div>
          {metadata_rf && (
            <div style={{ flex: 1, minWidth: "240px", borderLeft: "1px solid #e2e8f0", paddingLeft: "20px" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#1e1b4b" }}>🌲 Random Forest Regressor</h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13.5px", lineHeight: "1.6" }}>
                <li><strong>Validation RMSE:</strong> {metadata_rf.rmse}</li>
                <li><strong>Validation MAPE:</strong> {metadata_rf.mape}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Filters Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Search Job/Country</label>
          <input
            type="text"
            placeholder="Type search query..."
            value={filterSearch}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Filter by Country</label>
          <select
            value={filterCountry}
            onChange={(e) => handleFilterChange("country", e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Experience Level</label>
          <select
            value={filterExp}
            onChange={(e) => handleFilterChange("exp", e.target.value)}
          >
            <option value="">All Levels</option>
            {experienceLevels.map((el) => (
              <option key={el} value={el}>{el}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <h2>Hiring Trend Analysis & Next 14-Month ML Forecast</h2>
        <TrendChart data={combinedTrendData} />
      </div>

      <div className="chart-section">
        <h2>Most Demanded Skills Distribution</h2>
        <SkillChart data={skills} />
      </div>

      {/* Data Table Section */}
      <div className="table-section">
        <h2>Ingested Jobs Database</h2>
        <div className="jobs-table-container">
          <table className="jobs-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("job_title")}>
                  Job Title {sortField === "job_title" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th>Industry</th>
                <th>Country</th>
                <th>Experience Level</th>
                <th onClick={() => handleSort("salary")}>
                  Salary {sortField === "salary" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("job_openings")}>
                  Openings {sortField === "job_openings" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th>Posting Date</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.map((job, idx) => (
                <tr key={idx}>
                  <td><strong>{job.job_title}</strong></td>
                  <td>{job.company_industry}</td>
                  <td>{job.country}</td>
                  <td>{job.experience_level}</td>
                  <td>${job.salary?.toLocaleString()}</td>
                  <td>{job.job_openings}</td>
                  <td>{job.posting_date}</td>
                </tr>
              ))}
              {currentJobs.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#64748b" }}>
                    No jobs match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({filteredJobs.length} total items)
          </span>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;