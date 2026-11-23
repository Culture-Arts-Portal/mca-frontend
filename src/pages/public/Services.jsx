import { useEffect, useState } from "react";
import { getServices } from "../../api/services";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs once when the page opens: browser -> API -> database -> browser.
  useEffect(() => {
    getServices()
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1>Services</h1>
      <p className="lead">Choose a service to see what you need and how to apply.</p>

      {loading && <p className="status">Loading services…</p>}

      {error && (
        <div className="notice notice--error" role="alert">
          <strong>Services couldn’t load.</strong> {error}
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <p className="status">No services are published yet. Run the seed script to add the first three.</p>
      )}

      <ul className="service-list">
        {services.map((service) => (
          <li key={service.id} className="service">
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <p className="service__fee">
              {Number(service.fee) > 0 ? `Fee: K${Number(service.fee).toFixed(2)}` : "No fee"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}