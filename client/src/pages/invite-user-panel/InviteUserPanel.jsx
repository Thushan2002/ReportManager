import { useState } from "react";
import { FiSend, FiUserPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client.js";
import { Button } from "../../components/button/Button.jsx";
import { Field } from "../../components/field/Field.jsx";
import "./InviteUserPanel.scss";

export const InviteUserPanel = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "20",
    password: "",
  });
  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await client.post("/auth/invite", { ...form, role: Number(form.role) });
      setForm({ name: "", email: "", role: "20", password: "" });
      toast.success("Invitation account created.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not create the account.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="invite-panel">
      <div className="invite-panel__heading">
        <span className="invite-panel__icon">
          <FiUserPlus />
        </span>
        <div>
          <span className="eyebrow">Admin controls</span>
          <h2>Invite someone to the workspace</h2>
          <p>Create a ready-to-use account and assign its access level.</p>
        </div>
      </div>
      <form onSubmit={submit} className="invite-form">
        <Field
          label="Full name"
          value={form.name}
          onChange={update("name")}
          placeholder="Jordan Lee"
          required
        />
        <Field
          label="Work email"
          type="email"
          value={form.email}
          onChange={update("email")}
          placeholder="jordan@company.com"
          required
        />
        <label className="field">
          <span>Role</span>
          <select
            className="field__input"
            value={form.role}
            onChange={update("role")}>
            <option value="20">Team Member</option>
            <option value="10">Manager / Admin</option>
          </select>
        </label>
        <Field
          label="Temporary password"
          type="password"
          minLength="8"
          value={form.password}
          onChange={update("password")}
          placeholder="At least 8 characters"
          required
        />
        <Button type="submit" loading={isSaving}>
          Create account <FiSend />
        </Button>
      </form>
    </section>
  );
};
