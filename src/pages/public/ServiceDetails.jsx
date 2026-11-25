import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getServiceBySlug } from "../../api/services";

// Work out what to show for the fee.
// Services with feeRules (like the event permit) charge different amounts depending on an answer.
function describeFee(service, schema) {
  const rules = schema.feeRules;
  if (rules) {
    const amounts = Object.values(rules.amounts ?? {}).filter((n) => n != null).map(Number);
    if (amounts.length === 0) return "Depends on expected attendance";
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    return min === max ? `K${min.toFixed(2)}` : `K${min.toFixed(2)} to K${max.toFixed(2)}, depending on attendance`;
  }
  const fee = Number(service.fee);
  return fee > 0 ? `K${fee.toFixed(2)}` : "No fee";
}

export default function ServiceDetails() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getServiceBySlug(slug)
      .then(setService)
      .catch(setError);
  }, [slug]);

  // The server answered "this service doesn't exist".
  if (error?.status === 404) {
    return (
      <section className="narrow">
        <h1>Service not found</h1>
        <p className="lead">
          We couldn’t find a service at this address. It may have been renamed or removed.
        </p>
        <Link to="/services" className="btn">See all services</Link>
      </section>
    );
  }

  // Any other problem, like the server being unreachable.
  if (error) {
    return (
      <section>
        <p><Link to="/services">← All services</Link></p>
        <div className="notice notice--error" role="alert">
          <strong>This service couldn’t load.</strong> {error.message}
        </div>
      </section>
    );
  }

  if (!service) return <p className="status">Loading service…</p>;

  const schema = service.formSchema ?? { steps: [] };
  const steps = schema.steps ?? [];
  const documents = steps
    .flatMap((step) => step.fields)
    .filter((field) => field.type === "file" && field.required);
  const afterSteps = [...(service.workflowSteps ?? [])].sort((a, b) => a.stepOrder - b.stepOrder);
  const hasPayment = Number(service.fee) > 0 || Boolean(schema.feeRules);

  return (
    <section className="service-detail">
      <p><Link to="/services">← All services</Link></p>
      <h1>{service.name}</h1>
      <p className="lead">{service.description}</p>

      <dl className="facts">
        <div><dt>Fee</dt><dd>{describeFee(service, schema)}</dd></div>
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

      <h2>How to apply</h2>
      <ol className="detail-list">
        {steps.map((step) => <li key={step.id}>{step.title}</li>)}
        <li>Review and {hasPayment ? "pay" : "submit"}</li>
      </ol>

      {afterSteps.length > 0 && (
        <>
          <h2>What happens after you apply</h2>
          <ol className="detail-list">
            {afterSteps.map((step) => <li key={step.id}>{step.name}</li>)}
          </ol>
        </>
      )}

      <Link to={`/apply/${service.slug}`} className="btn">Start application</Link>
    </section>
  );
}