import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiLock } from "react-icons/fi";
import { Button } from "../../components/button/Button.jsx";
import { Field } from "../../components/field/Field.jsx";
import { useAuth } from "../../context/useAuth.js";
import "./Auth.scss";

export const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const submit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      navigate("/");
    } catch {
      /* toast carries the error */
    }
  };
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Your reports, in focus."
      description="Return to the work that keeps your team moving."
      footer={
        <>
          New to ReportManager?{" "}
          <Link to="/register">
            Create an account <FiArrowRight />
          </Link>
        </>
      }>
      <form onSubmit={submit} className="auth-form">
        <Field
          label="Work email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="you@company.com"
          required
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm({ ...form, password: event.target.value })
          }
          placeholder="Enter your password"
          required
        />
        <Button type="submit" loading={isLoading}>
          Sign in <FiArrowRight />
        </Button>
      </form>
    </AuthLayout>
  );
};

export const AuthLayout = ({
  eyebrow,
  title,
  description,
  children,
  footer,
}) => (
  <main className="auth-page">
    <section className="auth-aside">
      <div className="auth-brand">
        <span className="auth-brand__mark">
          <FiLock />
        </span>
        <span>
          Report<span>Manager</span>
        </span>
      </div>
      <div className="auth-aside__copy">
        <span className="eyebrow">A calmer way to report</span>
        <h1>Make the important work easier to see.</h1>
        <p>
          Bring updates, decisions, and momentum into one focused workspace.
        </p>
      </div>
      <span className="auth-aside__detail">RM / 01</span>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
        <div className="auth-footer">{footer}</div>
      </div>
    </section>
  </main>
);
