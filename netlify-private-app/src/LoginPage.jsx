import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/.netlify/functions/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.authenticated) {
        throw new Error(result.message || "비밀번호를 확인해주세요.");
      }

      navigate(location.state?.from || "/", { replace: true });
    } catch (caught) {
      setError(caught.message || "로그인 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">V</div>
        <p className="eyebrow">PRIVATE FAMILY SPACE</p>
        <h1>Value Time</h1>
        <h2>Small Steps,<br />Change the Future</h2>
        <p className="intro">가족만 사용하는 따뜻한 영어 학습 공간입니다.</p>

        <form onSubmit={submit}>
          <label>
            가족 비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "확인 중…" : "Start Today"}
          </button>
        </form>

        <small>비밀번호는 브라우저 코드에 저장되지 않습니다.</small>
      </section>
    </main>
  );
}
