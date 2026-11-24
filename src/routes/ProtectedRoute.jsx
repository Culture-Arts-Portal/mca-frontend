import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap pages that need a logged-in user. Optionally limit them to certain roles,
// e.g. <ProtectedRoute roles={["OFFICER", "ADMIN"]} /> for staff-only pages later.
export default function ProtectedRoute({ roles }) {
  const { user, isLoggedIn, checking } = useAuth();
  const location = useLocation();

  // Still asking the backend whether the saved token is valid: wait.
  if (checking) return <p className="status">Checking your account…</p>;

  // Not logged in: go to Log in, remembering where they were heading.
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location }} />;

  // Logged in, but not allowed (e.g. a citizen opening an officer page).
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}