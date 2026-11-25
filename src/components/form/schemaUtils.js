// Pure logic for form_schema v1: no React, no screen. Every rule here comes from
// mca-infra-docs/form-schemas/README.md, so the frontend and backend agree.

const isEmpty = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

// Today's date as "YYYY-MM-DD" in local time (what date inputs use).
export function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Turn the special words "today" and "currentYear" into real values.
function resolveLimit(limit) {
  if (limit === "today") return todayString();
  if (limit === "currentYear") return new Date().getFullYear();
  return limit;
}

// showIf: only show a field when another answer matches.
export function isVisible(field, values) {
  if (!field.showIf) return true;
  return values[field.showIf.field] === field.showIf.equals;
}

export function visibleFields(step, values) {
  return step.fields.filter((field) => isVisible(field, values));
}

// Starting values for every field in every step.
export function initialValues(schema) {
  const values = {};
  for (const step of schema.steps ?? []) {
    for (const field of step.fields) {
      if (field.default !== undefined) values[field.name] = field.default;
      else if (field.type === "repeater" || field.type === "file") values[field.name] = [];
      else if (field.type === "checkbox") values[field.name] = false;
      else values[field.name] = "";
    }
  }
  return values;
}

// A lookup from field name to label, used in messages like "Can't be before the start date."
export function labelsOf(schema) {
  const labels = {};
  for (const step of schema.steps ?? []) {
    for (const field of step.fields) labels[field.name] = field.label;
  }
  return labels;
}

// Add up one number field across all rows of a repeater, e.g. "budgetItems.amount".
function sumOf(path, values) {
  const [repeater, sub] = path.split(".");
  return (values[repeater] ?? []).reduce((total, row) => total + (Number(row[sub]) || 0), 0);
}

// Does a file's type match an accept list like ["image/*", "application/pdf"]?
function typeAllowed(fileType, accept) {
  return accept.some((rule) => (rule.endsWith("/*") ? fileType.startsWith(rule.slice(0, -1)) : fileType === rule));
}

// Check one answer. Returns an error message, or null if it's fine.
export function validateField(field, value, values, labels = {}) {
  const missing = isEmpty(value) || (field.type === "checkbox" && value !== true);
  if (missing) return field.required ? `${field.label} is required.` : null;

  const rules = field.validation ?? {};

  if (["text", "textarea", "email", "tel", "url"].includes(field.type)) {
    const text = field.type === "tel" ? String(value).replace(/\s/g, "") : String(value).trim();
    if (rules.minLength && text.length < rules.minLength) return `Use at least ${rules.minLength} characters.`;
    if (rules.maxLength && text.length > rules.maxLength) return `Use ${rules.maxLength} characters or fewer.`;
    if (rules.maxWords) {
      const words = text.split(/\s+/).filter(Boolean).length;
      if (words > rules.maxWords) return `Use ${rules.maxWords} words or fewer (you have ${words}).`;
    }
    if (rules.pattern && !new RegExp(rules.pattern).test(text)) return rules.patternMessage ?? "Check the format.";
    if (field.type === "email" && !/^\S+@\S+\.\S+$/.test(text)) return "Enter a valid email address.";
  }

  if (field.type === "number") {
    const n = Number(value);
    if (Number.isNaN(n)) return "Enter a number.";
    const min = resolveLimit(rules.min);
    const max = resolveLimit(rules.max);
    if (min !== undefined && n < min) return `Must be at least ${min}.`;
    if (max !== undefined && n > max) return `Must be ${max} or less.`;
    if (rules.notMoreThanTotal && n > sumOf(rules.notMoreThanTotal, values)) {
      return "Can’t be more than the total of your budget items.";
    }
  }

  if (field.type === "date") {
    const min = resolveLimit(rules.min);
    const max = resolveLimit(rules.max);
    if (min && value < min) return min === todayString() ? "Can’t be in the past." : `Must be on or after ${min}.`;
    if (max && value > max) return max === todayString() ? "Can’t be in the future." : `Must be on or before ${max}.`;
    const other = values[rules.notBefore];
    if (other && value < other) return `Can’t be before the ${(labels[rules.notBefore] ?? "earlier date").toLowerCase()}.`;
  }

  if (rules.mustBe !== undefined && value !== rules.mustBe) return rules.mustBeMessage ?? "This answer stops you continuing.";

  if (field.type === "repeater") {
    if (rules.minItems && value.length < rules.minItems) return `Add at least ${rules.minItems}.`;
    if (rules.maxItems && value.length > rules.maxItems) return `Add no more than ${rules.maxItems}.`;
  }

  if (field.type === "file") {
    if (field.maxFiles && value.length > field.maxFiles) return `Add no more than ${field.maxFiles} file${field.maxFiles > 1 ? "s" : ""}.`;
    for (const file of value) {
      if (field.maxSizeMB && file.size > field.maxSizeMB * 1024 * 1024) return `“${file.name}” is bigger than ${field.maxSizeMB} MB.`;
      if (field.accept && !typeAllowed(file.type, field.accept)) return `“${file.name}” isn’t an allowed file type.`;
    }
  }

  return null;
}

// Check every visible field on one step, including each row of a repeater.
// Returns { fieldName: "message" }; an empty object means the step is fine.
export function validateStep(step, values, labels) {
  const errors = {};
  for (const field of visibleFields(step, values)) {
    const message = validateField(field, values[field.name], values, labels);
    if (message) errors[field.name] = message;

    if (field.type === "repeater") {
      (values[field.name] ?? []).forEach((row, i) => {
        for (const sub of field.fields) {
          const subMessage = validateField(sub, row[sub.name], row, labels);
          if (subMessage) errors[`${field.name}.${i}.${sub.name}`] = subMessage;
        }
      });
    }
  }
  return errors;
}

// Rule 1 from the README: answers to hidden fields are dropped before saving.
export function visibleValues(schema, values) {
  const result = {};
  for (const step of schema.steps ?? []) {
    for (const field of visibleFields(step, values)) result[field.name] = values[field.name];
  }
  return result;
}