import { useEffect, useState } from "react";
import { FiEdit3, FiFolder, FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client.js";
import { Button } from "../../components/button/Button.jsx";
import { Field } from "../../components/field/Field.jsx";
import { useAuth } from "../../context/useAuth.js";
import "../reports/Reports.scss";

export const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = () =>
    client
      .get("/projects")
      .then(({ data }) => setProjects(data))
      .catch((error) =>
        toast.error(
          error.response?.data?.message || "Could not load projects.",
        ),
      );
  useEffect(() => {
    load();
  }, []);
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) await client.patch(`/projects/${editing._id}`, { name });
      else await client.post("/projects", { name });
      setName("");
      setEditing(null);
      await load();
      toast.success("Project saved.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save project.");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id) => {
    try {
      await client.delete(`/projects/${id}`);
      setProjects(projects.filter((project) => project._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove project.");
    }
  };
  return (
    <div className="workspace-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Workspace taxonomy</span>
          <h1>Projects with a pulse.</h1>
          <p>Keep report categories clear, shared, and easy to filter.</p>
        </div>
      </header>
      <section className="form-section">
        <form className="inline-form" onSubmit={save}>
          <Field
            label={editing ? "Rename project" : "New project / category"}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Internal tooling"
            required
          />
          <Button loading={saving}>
            <FiPlus /> {editing ? "Save name" : "Add project"}
          </Button>
          {editing && (
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setEditing(null);
                setName("");
              }}>
              Cancel
            </button>
          )}
        </form>
      </section>
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Managed categories</span>
            <h2>{projects.length} projects</h2>
          </div>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project._id}>
              <span className="report-row__icon">
                <FiFolder />
              </span>
              <div>
                <h3>{project.name}</h3>
                <span>{project.members?.length || 0} assigned members</span>
              </div>
              {user?.role === 10 && (
                <div className="project-card__actions">
                  <button
                    className="icon-button icon-button--light"
                    onClick={() => {
                      setEditing(project);
                      setName(project.name);
                    }}
                    aria-label="Edit project">
                    <FiEdit3 />
                  </button>
                  <button
                    className="icon-button icon-button--light"
                    onClick={() => remove(project._id)}
                    aria-label="Delete project">
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
