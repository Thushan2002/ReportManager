import { Loader } from "../loader/Loader.jsx";
import "./Button.scss";

export const Button = ({
  children,
  loading = false,
  variant = "primary",
  className = "",
  ...props
}) => (
  <button
    className={`button button--${variant} ${className}`}
    disabled={loading || props.disabled}
    {...props}>
    {loading ? <Loader label="Working" /> : children}
  </button>
);
