import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
    const firstName = user?.name?.split(" ")[0];

  function handleLogout() {
    logout();
    navigate("/"); // back to the home page after logging out
  }

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden="true" />
          <span>
            <strong>Culture and Arts</strong>
            <small>Republic of Zambia eServices</small>
          </span>
        </Link>
        <nav className="navbar__links" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/services">Services</NavLink>
          {isLoggedIn ? (
            <>
              <NavLink to="/my-applications">My applications</NavLink>
              <span className="navbar__user">Hi, {firstName}</span>
              <button type="button" className="btn btn--small btn--ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn btn--small">Create account</NavLink>
            </>
          )}
        </nav>
      </div>
      <div className="pattern-band" aria-hidden="true" />
    </header>
  );
}