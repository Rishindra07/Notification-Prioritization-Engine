import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const links = [
  { to: "/simulator", label: "Event Simulator" },
  { to: "/dashboard", label: "Live Dashboard" },
  { to: "/audit", label: "Audit Log" },
  { to: "/later-queue", label: "LATER Queue" },
  { to: "/rules", label: "Rules Manager" },
  { to: "/metrics", label: "Metrics" }
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/dashboard" className="brand">
          Notification Engine
        </Link>
        <div className="topbar-right">
          <span className="pill">{user?.role || "guest"}</span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <nav className="tabs">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="container">{children}</main>
    </div>
  );
}
