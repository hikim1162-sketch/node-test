import { NavLink, useNavigate } from "react-router-dom";

export default function SiteShell({ children }) {
  const navigate = useNavigate();

  async function logout() {
    try {
      await fetch("/.netlify/functions/logout", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="site-shell">
      <header>
        <NavLink className="brand" to="/">
          <span>V</span>
          <div>
            <b>Value Time</b>
            <small>Small Steps, Change the Future</small>
          </div>
        </NavLink>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/news">News</NavLink>
          <button type="button" onClick={logout}>로그아웃</button>
        </nav>
      </header>
      {children}
    </div>
  );
}
