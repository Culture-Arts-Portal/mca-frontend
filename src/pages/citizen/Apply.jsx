import { Link, useParams } from "react-router-dom";

export default function Apply() {
  const { slug } = useParams();

  return (
    <section className="narrow">
      <p><Link to={`/services/${slug}`}>← Back to the service</Link></p>
      <h1>Apply</h1>
      <p className="lead">
        The application form arrives in Week 4. It will be drawn by DynamicForm
        from this service’s form_schema.
      </p>
    </section>
  );
}