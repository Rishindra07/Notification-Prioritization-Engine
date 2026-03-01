import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext";

const demoCreds = [
  { role: "Admin", email: "admin@demo.com", password: "Admin@123" },
  { role: "Operator", email: "operator@demo.com", password: "Operator@123" }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ email: demoCreds[0].email, password: demoCreds[0].password });
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api.login(form);
      setAuth({ token: data.token, user: data.user });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="centered">
      <div className="card login-card">
        <h1>Login</h1>
        <p className="muted">Use one of these demo credentials directly:</p>
        <div className="credential-list">
          {demoCreds.map((cred) => (
            <button
              type="button"
              key={cred.email}
              className="credential"
              onClick={() => setForm({ email: cred.email, password: cred.password })}
            >
              <strong>{cred.role}</strong>: {cred.email} / {cred.password}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="stack">
          <label>
            Email
            <input
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn-primary" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
