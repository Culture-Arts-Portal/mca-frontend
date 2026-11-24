import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getServiceBySlug } from "../../api/services";

export default function ServiceDetails() {
  const { slug } = useParams(); // the part of the address after /services/
  const [service, setService] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getServiceBySlug(slug)
      .then(setService)
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) {
    return (
      <section>
        <p><Link to="/services">← All services</Link></p>
        <div className="notice notice--error" role="alert">
          <strong>This service couldn’t load.</strong> {error}
        </div>
      </section>
    );
  }

  if (!service) return <p className="status">Loading service…</p>;

  // Read the steps and required documents straight from the service's form_schema.
  const schema = service.formSchema ?? service.form_schema ?? { steps: [] };
  const steps = schema.steps ?? [];
  const documents = steps
    .flatMap((step) => step.fields)
    .filter((field) => field.type === "file" && field.required);
  const fee = Number(service.fee);

  return (
    <section className="service-detail">
      <p><Link to="/services">← All services</Link></p>
      <h1>{service.name}</h1>
      <p className="lead">{service.description}</p>

      <dl className="facts">
        <div><dt>Fee</dt><dd>{fee > 0 ? `K${fee.toFixed(2)}` : "No fee"}</dd></div>
        <div><dt>Steps</dt><dd>{steps.length + 1}, including review</dd></div>
        <div><dt>Apply</dt><dd>Online, from your phone or computer</dd></div>
      </dl>

      {documents.length > 0 && (
        <>
          <h2>What you’ll need</h2>
          <ul className="detail-list">
            {documents.map((doc) => (
              <li key={doc.name}>
                {doc.label}
                {doc.showIf && <span className="field-hint"> (only if it applies to you)</span>}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>How it works</h2>
      <ol className="detail-list">
        {steps.map((step) => <li key={step.id}>{step.title}</li>)}
        <li>Review and {fee > 0 ? "pay" : "submit"}</li>
      </ol>

      <Link to={`/apply/${service.slug}`} className="btn">Start application</Link>
    </section>
  );
}