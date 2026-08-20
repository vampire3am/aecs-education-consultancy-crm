import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--bg-app)",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              border: "3px solid var(--border-subtle)",
              borderTopColor: "var(--accent-blue)",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <span style={{ fontSize: "12px", fontWeight: 600 }}>Verifying AECS Staff Authorization…</span>
        </div>
      </div>
    );
  }

  // Strict check: No session -> Must redirect to Login page
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
