// One labelled input with its hint and error message, shared by all forms.
export default function FormField({ label, name, type = "text", hint, placeholder, autoComplete, value, error, onChange }) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        className="input"
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
      {error ? (
        <p className="field-error" id={`${name}-error`}>{error}</p>
      ) : (
        hint && <p className="field-hint" id={`${name}-hint`}>{hint}</p>
      )}
    </div>
  );
}