import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="narrow">
      <h1>Page not found</h1>
      <p className="lead">Check the address, or go back to the <Link to="/">home page</Link>.</p>
    </section>
  );
}