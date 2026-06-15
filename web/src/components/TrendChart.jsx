import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";

function TrendChart({ data }) {
  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "8px" }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 2 }}
            name="Historical"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#10b981"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 2 }}
            name="Forecast"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="upper"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            name="Upper Bound (95% CI)"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="lower"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            name="Lower Bound (95% CI)"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;