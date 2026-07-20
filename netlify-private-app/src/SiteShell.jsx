import { NavLink, useNavigate } from "react-router-dom";

export default function SiteShell({ children }) {
  const navigate = useNavigate();
  async function logout() { await fetch("/api/logout", { method:"POST", credentials:"include" }); navigate("/login", { replace:true }); }
  return <div className="site-shell"><header><NavLink className="brand" to="/"><span>V</span><div><b>Value Time</b><small>Learn a Little, Grow Every Day</small></div></NavLink><nav><NavLink to="/">Home</NavLink><NavLink to="/news">News</NavLink><button onClick={logout}>로그아웃</button></nav></header>{children}</div>;
}
