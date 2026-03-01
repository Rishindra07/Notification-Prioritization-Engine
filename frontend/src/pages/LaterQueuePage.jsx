import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext";

export default function LaterQueuePage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.laterQueue(token);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  async function processNow() {
    await api.retryQueue(token);
    await load();
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <div className="card">
      <div className="split">
        <h2>LATER Queue</h2>
        <button className="btn-primary" onClick={() => processNow().catch(() => {})}>
          Trigger Reprocess
        </button>
      </div>
      {loading ? <p>Loading...</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Message</th>
              <th>Attempts</th>
              <th>Next Retry</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.user_id}</td>
                <td>{item.message}</td>
                <td>{item.queue_attempts}</td>
                <td>{item.queue_next_retry_at ? new Date(item.queue_next_retry_at).toLocaleString() : "-"}</td>
                <td>{item.decision_reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
