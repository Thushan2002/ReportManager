import "./Field.scss";

export const Field = ({ label, error, ...props }) => (
  <label className="field">
    <span>{label}</span>
    <input
      className={`field__input ${error ? "field__input--error" : ""}`}
      {...props}
    />
    {error && <small className="field__error">{error}</small>}
  </label>
);
