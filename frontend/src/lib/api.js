const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}, token = "") {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  baseUrl: API_BASE,
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: (token) => request("/auth/me", {}, token),
  health: () => request("/health"),
  evaluate: (payload, token) =>
    request("/notifications/evaluate", { method: "POST", body: JSON.stringify(payload) }, token),
  metrics: (token) => request("/notifications/metrics", {}, token),
  auditLogs: (params, token) => {
    const query = new URLSearchParams(params || {}).toString();
    return request(`/notifications/audit-logs${query ? `?${query}` : ""}`, {}, token);
  },
  events: (token) => request("/notifications/events", {}, token),
  laterQueue: (token) => request("/notifications/later-queue", {}, token),
  retryQueue: (token) => request("/notifications/later-queue/retry", { method: "POST" }, token),
  rules: (token) => request("/rules", {}, token),
  createRule: (payload, token) => request("/rules", { method: "POST", body: JSON.stringify(payload) }, token),
  updateRule: (id, payload, token) =>
    request(`/rules/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteRule: (id, token) => request(`/rules/${id}`, { method: "DELETE" }, token),
  fatigueSettings: (token) => request("/settings/fatigue", {}, token),
  updateFatigueSettings: (payload, token) =>
    request("/settings/fatigue", { method: "PUT", body: JSON.stringify(payload) }, token)
};
