import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  if (authenticated) return <Navigate to={location.state?.from || "/"} replace />;
  async function submit(event) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/login", { method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include", body:JSON.stringify({ password }) });
      if (!response.ok) { const data = await response.json().catch(()=>({})); throw new Error(data.message || "비밀번호를 확인해주세요."); }
      setAuthenticated(true); navigate(location.state?.from || "/", { replace:true });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  return <main className="login-page"><section className="login-card"><div className="brand-mark">V</div><p className="eyebrow">PRIVATE FAMILY SPACE</p><h1>Value Time</h1><h2>Learn a Little,<br />Grow Every Day</h2><p className="intro">가족만 사용하는 따뜻한 영어 학습 공간입니다.</p><form onSubmit={submit}><label>가족 비밀번호<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" autoFocus required /></label>{error && <p className="error" role="alert">{error}</p>}<button disabled={loading}>{loading ? "확인 중..." : "Start Today"}</button></form><small>비밀번호는 브라우저 코드에 저장되지 않습니다.</small></section></main>;
}
