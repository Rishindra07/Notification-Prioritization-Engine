import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext";

const initialState = {
  user_id: "user-1001",
  event_type: "message",
  title: "Payment due reminder",
  message: "Your card payment is due in 2 hours.",
  source: "billing-service",
  priority_hint: "high",
  channel: "push",
  dedupe_key: "",
  metadata: "{}"
};

export default function EventSimulatorPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const payload = { ...form, metadata: JSON.parse(form.metadata || "{}") };
      const data = await api.evaluate(payload, token);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Event Simulator</h2>
      <form onSubmit={onSubmit} className="grid">
        {Object.entries(form).map(([key, value]) => (
          <label key={key}>
            {key}
            <input value={value} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} />
          </label>
        ))}
        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? "Evaluating..." : "Submit Event"}
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {result ? (
        <pre className="result">{JSON.stringify(result, null, 2)}</pre>
      ) : null}
    </div>
  );
}
