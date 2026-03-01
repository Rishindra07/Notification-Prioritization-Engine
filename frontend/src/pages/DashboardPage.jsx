import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext";

export default function DashboardPage() {
  const { token } = useAuth();
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [h, m] = await Promise.all([api.health(), api.metrics(token)]);
      if (mounted) {
        setHealth(h);
        setMetrics(m);
      }
    }
    load().catch(() => {});
    const timer = setInterval(() => load().catch(() => {}), 10000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [token]);

  useEffect(() => {
    const stream = new EventSource(`${api.baseUrl}/notifications/stream?token=${encodeURIComponent(token)}`);
    stream.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setFeed((prev) => [data, ...prev].slice(0, 20));
      } catch {
        // no-op
      }
    };
    return () => stream.close();
  }, [token]);

  const totals = useMemo(() => metrics?.totals || {}, [metrics]);

  return (
    <div className="stack-page">
      <section className="card">
        <h2>Live Dashboard</h2>
        <div className="kpi-row">
          <div className="kpi">
            <span>Total</span>
            <strong>{totals.totalEvents || 0}</strong>
          </div>
          <div className="kpi">
            <span>NOW</span>
            <strong>{totals.nowCount || 0}</strong>
          </div>
          <div className="kpi">
            <span>LATER</span>
            <strong>{totals.laterCount || 0}</strong>
          </div>
          <div className="kpi">
            <span>NEVER</span>
            <strong>{totals.neverCount || 0}</strong>
          </div>
          <div className="kpi">
            <span>AI Fallbacks</span>
            <strong>{totals.aiFallbackCount || 0}</strong>
          </div>
        </div>
      </section>
      <section className="card">
        <h3>Health</h3>
        <pre className="result">{JSON.stringify(health, null, 2)}</pre>
      </section>
      <section className="card">
        <h3>Realtime Feed</h3>
        <div className="feed-list">
          {feed.map((item, idx) => (
            <div key={`${item.timestamp}-${idx}`} className="feed-item">
              <strong>{item.event}</strong>
              <span>{item.timestamp}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
