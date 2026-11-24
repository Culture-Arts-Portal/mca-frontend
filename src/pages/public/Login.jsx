import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Field from "../../components/FormField";

function validate(v) {
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = "Enter the email you registered with.";
  if (!v.password) errors.password = "Enter your password.";
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If someone was sent here from a protected page, take them back there after logging in.
  const goTo = location.state?.from?.pathname || "/services";

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      await login(values.email.trim().toLowerCase(), values.password);
      navigate(goTo, { replace: true });
    } catch (err) {
      setServerError(err.message); // e.g. "Wrong email or password"
    } finally {
      setSubmitting(false);
    }
  }

  const fieldProps = (name) => ({ name, value: values[name], error: errors[name], onChange: handleChange });

  return (
    <section className="auth-card">
      <h1>Log in</h1>
      <p className="lead">Welcome back. Log in to apply for services and track your applications.</p>

      {serverError && (
        <div className="notice notice--error" role="alert">
          <strong>We couldn’t log you in.</strong> {serverError}
        </div>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Email" type="email" autoComplete="email" {...fieldProps("email")} />
        <Field label="Password" type="password" autoComplete="current-password" {...fieldProps("password")} />
        <button className="btn btn--block" type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}