import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext";

export default function AuditLogPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState({ user_id: "", decision: "", q: "" });
  const [logs, setLogs] = useState([]);

  async function load() {
    const data = await api.auditLogs(query, token);
    setLogs(data);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <div className="card">
      <h2>Audit Log</h2>
      <div className="inline-form">
        <input
          placeholder="user_id"
          value={query.user_id}
          onChange={(e) => setQuery((s) => ({ ...s, user_id: e.target.value }))}
        />
        <select value={query.decision} onChange={(e) => setQuery((s) => ({ ...s, decision: e.target.value }))}>
          <option value="">All decisions</option>
          <option value="NOW">NOW</option>
          <option value="LATER">LATER</option>
          <option value="NEVER">NEVER</option>
        </select>
        <input placeholder="reason search" value={query.q} onChange={(e) => setQuery((s) => ({ ...s, q: e.target.value }))} />
        <button className="btn-secondary" onClick={() => load().catch(() => {})}>
          Search
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Event Type</th>
              <th>Decision</th>
              <th>Source</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.user_id}</td>
                <td>{log.event_type}</td>
                <td>{log.decision}</td>
                <td>{log.decision_source}</td>
                <td>{log.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
