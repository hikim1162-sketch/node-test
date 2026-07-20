import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState("checking");
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();

    async function checkAuth() {
      setAuthState("checking");

      try {
        const response = await fetch("/.netlify/functions/check-auth", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({ authenticated: false }));

        setAuthState(response.ok && result.authenticated ? "authenticated" : "guest");
      } catch (error) {
        if (error.name !== "AbortError") setAuthState("guest");
      }
    }

    checkAuth();
    return () => controller.abort();
  }, [location.pathname]);

  if (authState === "checking") {
    return (
      <main className="loading" aria-live="polite" aria-busy="true">
        <span aria-hidden="true" />
        <p>가족 학습 공간 접근 권한을 확인하고 있어요.</p>
      </main>
    );
  }

  if (authState === "guest") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
