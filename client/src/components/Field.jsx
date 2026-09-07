export const Field = ({ label, error, ...props }) => (
  <label className="field">
    <span>{label}</span>
    <input className={error ? 'field__input field__input--error' : 'field__input'} {...props} />
    {error && <small className="field__error">{error}</small>}
  </label>
)