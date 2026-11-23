import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="hero">
      <h1>Register your art, get event permits and apply for grants online.</h1>
      <p className="lead">
        Apply to the Ministry of Culture and Arts from your phone or computer,
        then track your application until your certificate is ready.
      </p>
      <div className="hero__actions">
        <Link to="/services" className="btn">See all services</Link>
        <Link to="/register" className="btn btn--ghost">Create an account</Link>
      </div>
    </section>
  );
}