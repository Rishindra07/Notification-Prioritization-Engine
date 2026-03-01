import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext";

const blankRule = {
  name: "",
  description: "",
  decision: "LATER",
  reason_template: "",
  priority: 100,
  conditions: {
    event_type: "ANY",
    source: "ANY",
    channel: "ANY",
    priority_hint: "ANY",
    keyword_contains: ""
  }
};

export default function RulesManagerPage() {
  const { token, user } = useAuth();
  const [rules, setRules] = useState([]);
  const [rule, setRule] = useState(blankRule);
  const [settings, setSettings] = useState({ limit_10min: 8, limit_24h: 50, min_gap_seconds: 20 });

  async function load() {
    const [r, s] = await Promise.all([api.rules(token), api.fatigueSettings(token)]);
    setRules(r);
    setSettings(s);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function createRule(e) {
    e.preventDefault();
    await api.createRule(rule, token);
    setRule(blankRule);
    await load();
  }

  async function deleteRule(id) {
    await api.deleteRule(id, token);
    await load();
  }

  async function updateSettings(e) {
    e.preventDefault();
    await api.updateFatigueSettings(settings, token);
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="stack-page">
      <section className="card">
        <h2>Rules Manager</h2>
        {!isAdmin ? <p className="error">Only admin can edit rules.</p> : null}
        <form className="grid" onSubmit={createRule}>
          <input placeholder="Rule Name" value={rule.name} onChange={(e) => setRule((s) => ({ ...s, name: e.target.value }))} />
          <input
            placeholder="Reason Template"
            value={rule.reason_template}
            onChange={(e) => setRule((s) => ({ ...s, reason_template: e.target.value }))}
          />
          <input
            placeholder="Keyword"
            value={rule.conditions.keyword_contains}
            onChange={(e) =>
              setRule((s) => ({
                ...s,
                conditions: { ...s.conditions, keyword_contains: e.target.value }
              }))
            }
          />
          <select value={rule.decision} onChange={(e) => setRule((s) => ({ ...s, decision: e.target.value }))}>
            <option value="NOW">NOW</option>
            <option value="LATER">LATER</option>
            <option value="NEVER">NEVER</option>
          </select>
          <button className="btn-primary" disabled={!isAdmin} type="submit">
            Add Rule
          </button>
        </form>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Decision</th>
                <th>Keyword</th>
                <th>Priority</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rules.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.decision}</td>
                  <td>{item.conditions?.keyword_contains}</td>
                  <td>{item.priority}</td>
                  <td>
                    <button className="btn-danger" disabled={!isAdmin} onClick={() => deleteRule(item._id).catch(() => {})}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h3>Fatigue Thresholds</h3>
        <form className="inline-form" onSubmit={updateSettings}>
          <label>
            10-min limit
            <input
              type="number"
              value={settings.limit_10min}
              onChange={(e) => setSettings((s) => ({ ...s, limit_10min: Number(e.target.value) }))}
            />
          </label>
          <label>
            24-hour limit
            <input
              type="number"
              value={settings.limit_24h}
              onChange={(e) => setSettings((s) => ({ ...s, limit_24h: Number(e.target.value) }))}
            />
          </label>
          <label>
            Min gap seconds
            <input
              type="number"
              value={settings.min_gap_seconds}
              onChange={(e) => setSettings((s) => ({ ...s, min_gap_seconds: Number(e.target.value) }))}
            />
          </label>
          <button className="btn-secondary" disabled={!isAdmin} type="submit">
            Save
          </button>
        </form>
      </section>
    </div>
  );
}
