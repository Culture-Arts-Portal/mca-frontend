import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getServiceBySlug } from "../../api/services";
import DynamicForm from "../../components/form/DynamicForm";

// Files can't be shown as JSON, so describe them by name, size and type.
function toPreview(answers) {
  return JSON.stringify(
    answers,
    (key, value) => (value instanceof File ? { name: value.name, size: value.size, type: value.type } : value),
    2
  );
}

export default function Apply() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    getServiceBySlug(slug).then(setService).catch(setError);
  }, [slug]);

  if (error?.status === 404) {
    return (
      <section className="narrow">
        <h1>Service not found</h1>
        <p className="lead">There’s no service to apply for at this address.</p>
        <Link to="/services" className="btn">See all services</Link>
      </section>
    );
  }

  if (error) {
    return (
      <div className="notice notice--error" role="alert">
        <strong>This form couldn’t load.</strong> {error.message}
      </div>
    );
  }

  if (!service) return <p className="status">Loading form…</p>;

  if (!service.formSchema?.steps) {
    return (
      <section className="narrow">
        <h1>{service.name}</h1>
        <p className="lead">The online form for this service isn’t ready yet.</p>
      </section>
    );
  }

  // Temporary: until the backend can receive applications, show what would be sent.
  if (submitted) {
    return (
      <section>
        <h1>Form complete</h1>
        <p className="lead">
          Sending applications to the ministry arrives once the backend’s application endpoints are ready.
          This is exactly what would be sent as <code>form_data</code>:
        </p>
        <pre className="preview">{toPreview(submitted)}</pre>
        <button type="button" className="btn" onClick={() => setSubmitted(null)}>Back to the form</button>
      </section>
    );
  }

  return (
    <section>
      <p><Link to={`/services/${slug}`}>← {service.name}</Link></p>
      <DynamicForm
        key={service.slug}
        schema={service.formSchema}
        baseFee={service.fee}
        onSubmit={async (answers) => setSubmitted(answers)}
      />
    </section>
  );
}