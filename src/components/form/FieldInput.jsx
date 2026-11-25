// Draws ONE field from form_schema v1, whatever its type.
// It doesn't decide anything itself: it shows the value it's given,
// and reports every change upwards through onChange(newValue).

const INPUT_TYPES = { text: "text", email: "email", tel: "tel", url: "url", number: "number", date: "date", time: "time" };

const FRIENDLY_TYPES = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/*": "images",
  "audio/*": "audio",
  "video/*": "video",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
};

function describeFiles(field) {
  const types = (field.accept ?? []).map((t) => FRIENDLY_TYPES[t] ?? t).join(", ");
  const size = field.maxSizeMB ? `, up to ${field.maxSizeMB} MB` : "";
  return `${types}${size}`;
}

function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

export default function FieldInput({ field, value, onChange, errors = {}, path = field.name }) {
  const id = `field-${path}`;
  const error = errors[path];
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [field.hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  const label = (
    <>
      {field.label}
      {!field.required && <span className="optional"> (optional)</span>}
    </>
  );
  const hint = field.hint && <p className="field-hint" id={hintId}>{field.hint}</p>;
  const errorText = error && <p className="field-error" id={errorId}>{error}</p>;

  // Buttons or chips: pick one option.
  if (field.type === "choice") {
    return (
      <fieldset className="field" aria-describedby={describedBy}>
        <legend>{label}</legend>
        {hint}
        <div className={field.style === "chips" ? "choices choices--chips" : "choices"}>
          {field.options.map((option) => (
            <label key={option.value} className={value === option.value ? "choice is-on" : "choice"}>
              <input
                type="radio"
                name={id}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {errorText}
      </fieldset>
    );
  }

  // Dropdown.
  if (field.type === "select") {
    return (
      <div className="field">
        <label htmlFor={id}>{label}</label>
        {hint}
        <select
          className="input"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        >
          <option value="">Choose…</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {errorText}
      </div>
    );
  }

  // Multi-line text, with a live counter when there's a limit.
  if (field.type === "textarea") {
    const rules = field.validation ?? {};
    const words = value.trim().split(/\s+/).filter(Boolean).length;
    const counter = rules.maxWords
      ? `${words} / ${rules.maxWords} words`
      : rules.maxLength && `${value.length} / ${rules.maxLength} characters`;
    return (
      <div className="field">
        <label htmlFor={id}>{label}</label>
        {hint}
        <textarea
          className="input input--area"
          id={id}
          rows={4}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        {counter && <p className="field-hint counter">{counter}</p>}
        {errorText}
      </div>
    );
  }

  // A single tick box.
  if (field.type === "checkbox") {
    return (
      <div className="field">
        <label className="check">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            aria-describedby={describedBy}
          />
          <span>{field.label}</span>
        </label>
        {hint}
        {errorText}
      </div>
    );
  }

  // File picker. Files are kept in the browser for now; uploading comes with the backend endpoints.
  if (field.type === "file") {
    const maxFiles = field.maxFiles ?? 1;
    return (
      <div className="field">
        <span className="field-label">{label}</span>
        {hint}
        {value.map((file, i) => (
          <div className="file-row" key={`${file.name}-${i}`}>
            <span className="file-row__name">{file.name}</span>
            <span className="field-hint">{formatSize(file.size)}</span>
            <button type="button" className="link-btn" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
        ))}
        {value.length < maxFiles && (
          <label className="upload">
            <input
              type="file"
              accept={field.accept?.join(",")}
              multiple={maxFiles > 1}
              onChange={(e) => {
                onChange([...value, ...e.target.files]);
                e.target.value = ""; // allow picking the same file again after removing it
              }}
              aria-describedby={describedBy}
            />
            <span className="upload__title">{value.length ? "Add another file" : "Choose a file"}</span>
            <span className="field-hint">{describeFiles(field)}</span>
          </label>
        )}
        {errorText}
      </div>
    );
  }

  // A list the user adds rows to, like group members or budget items.
  if (field.type === "repeater") {
    const emptyRow = Object.fromEntries(field.fields.map((sub) => [sub.name, ""]));
    return (
      <fieldset className="field repeater" aria-describedby={describedBy}>
        <legend>{label}</legend>
        {hint}
        {value.map((row, i) => (
          <div className="repeater-row" key={i}>
            <div className="repeater-row__head">
              <strong>{i + 1}</strong>
              <button type="button" className="link-btn" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
            {field.fields.map((sub) => (
              <FieldInput
                key={sub.name}
                field={sub}
                value={row[sub.name] ?? ""}
                onChange={(v) => onChange(value.map((r, j) => (j === i ? { ...r, [sub.name]: v } : r)))}
                errors={errors}
                path={`${path}.${i}.${sub.name}`}
              />
            ))}
          </div>
        ))}
        <button type="button" className="btn btn--ghost btn--small" onClick={() => onChange([...value, emptyRow])}>
          {field.addLabel ?? "Add"}
        </button>
        {errorText}
      </fieldset>
    );
  }

  // Everything else: text, email, tel, url, number, date, time.
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint}
      <input
        className="input"
        id={id}
        type={INPUT_TYPES[field.type] ?? "text"}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
      {errorText}
    </div>
  );
}