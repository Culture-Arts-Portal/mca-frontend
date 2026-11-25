import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Field from "../../components/FormField";

const EMPTY = { name: "", phone: "", email: "", password: "", confirmPassword: "" };

// Rules from the auth contract in mca-infra-docs/API.md.
function validate(v) {
  const errors = {};
  const name = v.name.trim();
  if (name.length < 2 || name.length > 100) errors.name = "Enter your full name (2 to 100 characters).";
  const phone = v.phone.replace(/\s/g, "");
  if (phone && !/^(\+260|0)\d{9}$/.test(phone)) errors.phone = "Use the format 0971234567 or +260971234567.";
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = "Enter a valid email address.";
  if (v.password.length < 8) errors.password = "Use at least 8 characters.";
  if (v.confirmPassword !== v.password) errors.confirmPassword = "The passwords don’t match.";
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    const phone = values.phone.replace(/\s/g, "");
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        ...(phone && { phone }), // only send phone if it was filled in
      });
      navigate("/services");
    } catch (err) {
      setServerError(err.message); // e.g. "That email is already registered"
    } finally {
      setSubmitting(false);
    }
  }

  const fieldProps = (name) => ({ name, value: values[name], error: errors[name], onChange: handleChange });

  return (
    <section className="auth-card">
      <h1>Create an account</h1>
      <p className="lead">You’ll use it to apply for services and track your applications.</p>

      {serverError && (
        <div className="notice notice--error" role="alert">
          <strong>We couldn’t create your account.</strong> {serverError}
        </div>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Full name" autoComplete="name" {...fieldProps("name")} />
        <Field label="Email" type="email" autoComplete="email" {...fieldProps("email")} />
        <Field
          label="Phone (optional)"
          type="tel"
          placeholder="0971234567"
          autoComplete="tel"
          hint="We’ll text you when your application’s status changes."
          {...fieldProps("phone")}
        />
        <Field label="Password" type="password" hint="At least 8 characters." autoComplete="new-password" {...fieldProps("password")} />
        <Field label="Confirm password" type="password" autoComplete="new-password" {...fieldProps("confirmPassword")} />
        <button className="btn btn--block" type="submit" disabled={submitting}>
          {submitting ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}