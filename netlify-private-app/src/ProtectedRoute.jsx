import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking");
  const location = useLocation();
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/check-auth", { credentials: "include", signal: controller.signal })
      .then(response => setStatus(response.ok ? "authenticated" : "guest"))
      .catch(error => { if (error.name !== "AbortError") setStatus("guest"); });
    return () => controller.abort();
  }, [location.pathname]);
  if (status === "checking") return <main className="loading"><span /><p>가족 학습 공간을 확인하고 있어요.</p></main>;
  if (status === "guest") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
