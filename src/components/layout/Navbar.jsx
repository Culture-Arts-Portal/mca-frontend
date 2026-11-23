import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
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
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/register" className="btn btn--small">Create account</NavLink>
        </nav>
      </div>
      <div className="pattern-band" aria-hidden="true" />
    </header>
  );
}