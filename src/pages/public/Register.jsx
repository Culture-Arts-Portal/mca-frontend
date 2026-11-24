import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Field from "../../components/FormField";

const EMPTY = { fullName: "", nrc: "", phone: "", email: "", password: "", confirmPassword: "" };

// Check the answers in the browser first, so people get instant feedback.
// The backend checks them again, because the browser can't be trusted alone.
function validate(v) {
  const errors = {};
  if (v.fullName.trim().length < 3) errors.fullName = "Enter your full name as it appears on your NRC.";
  if (!/^\d{6}\/\d{2}\/\d$/.test(v.nrc.trim())) errors.nrc = "Use the format 123456/10/1.";
  if (!/^(\+260|0)\d{9}$/.test(v.phone.replace(/\s/g, ""))) errors.phone = "Use the format 0971234567 or +260971234567.";
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

  // Runs on every keystroke: saves what was typed and clears that field's error.
  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser reloading the page
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      await register({
        fullName: values.fullName.trim(),
        nrc: values.nrc.trim(),
        phone: values.phone.replace(/\s/g, ""),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      navigate("/services"); // logged in: go and pick a service
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
        <Field label="Full name" autoComplete="name" {...fieldProps("fullName")} />
        <Field label="NRC number" placeholder="123456/10/1" hint="As printed on your National Registration Card." {...fieldProps("nrc")} />
        <div className="grid-2">
          <Field label="Phone" type="tel" placeholder="0971234567" autoComplete="tel" {...fieldProps("phone")} />
          <Field label="Email" type="email" autoComplete="email" {...fieldProps("email")} />
        </div>
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