import { useRef, useState } from "react";
import FieldInput from "./FieldInput";
import { initialValues, labelsOf, validateStep, visibleFields, visibleValues } from "./schemaUtils";

// How an answer appears on the review screen.
function displayAnswer(field, value) {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
    return "Not provided";
  }
  if (field.type === "choice" || field.type === "select") {
    return field.options.find((o) => o.value === value)?.label ?? value;
  }
  if (field.type === "file") return value.map((f) => f.name).join(", ");
  if (field.type === "repeater") return `${value.length} added`;
  if (field.type === "checkbox") return value ? "Yes" : "No";
  return String(value);
}

// The fee for this application. With feeRules, it depends on one of the answers.
// Returns a number, or null if the amount isn't confirmed yet.
function feeFor(schema, values, baseFee) {
  const rules = schema.feeRules;
  if (!rules) return Number(baseFee) || 0;
  const amount = rules.amounts?.[values[rules.field]];
  return amount == null ? null : Number(amount);
}

export default function DynamicForm({ schema, baseFee = 0, onSubmit }) {
  const steps = schema.steps ?? [];
  const labels = labelsOf(schema);
  const reviewIndex = steps.length; // the review screen comes after the last schema step

  const [values, setValues] = useState(() => initialValues(schema));
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [declared, setDeclared] = useState(false);
  const [declarationError, setDeclarationError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const summaryRef = useRef(null);

  const onReview = stepIndex === reviewIndex;
  const step = steps[stepIndex];
  const fee = feeFor(schema, values, baseFee);
  const paying = fee === null || fee > 0;
  const feeText = fee === null ? "To be confirmed by the ministry" : fee > 0 ? `K${fee.toFixed(2)}` : null;

  function goTo(index) {
    setStepIndex(index);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Save the new answer and clear its error (and its rows' errors, for repeaters).
  function handleChange(name, newValue) {
    setValues((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key === name || key.startsWith(`${name}.`)) delete next[key];
      }
      return next;
    });
  }

  // Show the problems, and move keyboard focus to the summary so everyone notices it.
  function showProblems(found) {
    setErrors(found);
    setTimeout(() => summaryRef.current?.focus(), 0);
  }

  function handleContinue() {
    const found = validateStep(step, values, labels);
    if (Object.keys(found).length > 0) return showProblems(found);
    goTo(stepIndex + 1);
  }

  async function handleSubmit() {
    // Check every step again: answers could have changed after going back with Edit.
    for (let i = 0; i < steps.length; i++) {
      const found = validateStep(steps[i], values, labels);
      if (Object.keys(found).length > 0) {
        setStepIndex(i);
        return showProblems(found);
      }
    }
    if (schema.declaration && !declared) {
      setDeclarationError("Tick the box to confirm before submitting.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit(visibleValues(schema, values)); // hidden answers are left out
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Turn { "members.0.nrc": "..." } into readable lines for the error summary.
  const problemList = Object.entries(errors).map(([key, message]) => {
    const [top, row] = key.split(".");
    const where = row !== undefined ? `${labels[top]}, row ${Number(row) + 1}` : labels[top];
    return message.includes(where) ? message : `${where}: ${message}`;
  });

  const title = onReview ? (paying ? "Review and pay" : "Review and submit") : step.title;

  return (
    <div className="dform">
      <p className="dform__step">Step {stepIndex + 1} of {steps.length + 1}</p>
      <h2 className="dform__title">{title}</h2>
      <div className="segments" aria-hidden="true">
        {Array.from({ length: steps.length + 1 }, (_, i) => (
          <span key={i} className={i < stepIndex ? "seg done" : i === stepIndex ? "seg cur" : "seg"} />
        ))}
      </div>

      {problemList.length > 0 && (
        <div className="notice notice--error" role="alert" tabIndex={-1} ref={summaryRef}>
          <strong>
            {problemList.length === 1 ? "There’s a problem on this step" : `There are ${problemList.length} problems on this step`}
          </strong>
          <ul>
            {problemList.map((text) => <li key={text}>{text}</li>)}
          </ul>
        </div>
      )}

      {!onReview && (
        <div className="form">
          {step.intro && <div className="notice">{step.intro}</div>}
          {visibleFields(step, values).map((field) => (
            <FieldInput
              key={field.name}
              field={field}
              value={values[field.name]}
              onChange={(v) => handleChange(field.name, v)}
              errors={errors}
            />
          ))}
        </div>
      )}

      {onReview && (
        <div className="review">
          {steps.map((s, i) => (
            <section className="review-card" key={s.id}>
              <div className="review-card__head">
                <h3>{s.title}</h3>
                <button type="button" className="link-btn" onClick={() => goTo(i)}>Edit</button>
              </div>
              <dl>
                {visibleFields(s, values).map((f) => (
                  <div className="review-row" key={f.name}>
                    <dt>{f.label}</dt>
                    <dd>{displayAnswer(f, values[f.name])}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          {feeText && (
            <div className="review-fee">
              <span>Fee</span>
              <strong>{feeText}</strong>
            </div>
          )}

          {schema.declaration && (
            <div className="field">
              <label className="check">
                <input
                  type="checkbox"
                  checked={declared}
                  onChange={(e) => {
                    setDeclared(e.target.checked);
                    setDeclarationError("");
                  }}
                />
                <span>{schema.declaration}</span>
              </label>
              {declarationError && <p className="field-error">{declarationError}</p>}
            </div>
          )}

          {submitError && (
            <div className="notice notice--error" role="alert">
              <strong>We couldn’t submit your application.</strong> {submitError}
            </div>
          )}
        </div>
      )}

      <div className="dform__actions">
        {stepIndex > 0 && (
          <button type="button" className="btn btn--ghost" onClick={() => goTo(stepIndex - 1)}>Back</button>
        )}
        {onReview ? (
          <button type="button" className="btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : fee > 0 ? `Pay K${fee.toFixed(2)} and submit` : "Submit application"}
          </button>
        ) : (
          <button type="button" className="btn" onClick={handleContinue}>Continue</button>
        )}
      </div>
    </div>
  );
}