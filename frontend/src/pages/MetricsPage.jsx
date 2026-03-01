import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext";

export default function MetricsPage() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState({ totals: {}, trend: [] });

  async function load() {
    const data = await api.metrics(token);
    setMetrics(data);
  }

  useEffect(() => {
    load().catch(() => {});
    const timer = setInterval(() => load().catch(() => {}), 15000);
    return () => clearInterval(timer);
  }, [token]);

  const trendData = (metrics.trend || []).map((item) => ({
    hour: `${item._id.hour}:00`,
    total: item.total
  }));

  return (
    <div className="stack-page">
      <section className="card">
        <h2>Metrics</h2>
        <div className="kpi-row">
          {Object.entries(metrics.totals || {}).map(([key, value]) => (
            <div className="kpi" key={key}>
              <span>{key}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h3>24h Event Trend</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#1f7a8c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
