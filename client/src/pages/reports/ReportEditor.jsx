import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiSave, FiSend, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client.js";
import { Button } from "../../components/button/Button.jsx";
import { Field } from "../../components/field/Field.jsx";
import { Loader } from "../../components/loader/Loader.jsx";
import "./Reports.scss";

const emptyTask = () => ({
  name: "",
  priority: "Medium",
  plannedPercent: 0,
  actualPercent: 0,
  status: "Not started",
  plannedHours: 0,
  spentHours: 0,
  deliverable: "",
});
const blankReport = () => ({
  weekStart: new Date().toISOString().slice(0, 10),
  weekEnd: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
  project: "",
  tasks: [emptyTask()],
  nextWeekTasks: "",
  blockers: "",
  keyBlocker: false,
  achievements: "",
  keyAchievement: false,
  hours: {
    development: 0,
    testing: 0,
    meetings: 0,
    documentation: 0,
    other: 0,
  },
  notes: "",
});

export const ReportEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(blankReport);
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("Draft");
  const [reviewComment, setReviewComment] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client
      .get("/projects")
      .then(({ data }) => setProjects(data))
      .catch(() => {});
    if (!id) return;
    client
      .get(`/reports/${id}`)
      .then(({ data }) => {
        setReport({
          ...blankReport(),
          ...data,
          weekStart: data.weekStart.slice(0, 10),
          weekEnd: data.weekEnd.slice(0, 10),
        });
        setStatus(data.status);
        setReviewComment(data.reviewComment || "");
      })
      .catch((error) =>
        toast.error(error.response?.data?.message || "Could not load report."),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const update = (key, value) =>
    setReport((current) => ({ ...current, [key]: value }));
  const updateTask = (index, key, value) =>
    update(
      "tasks",
      report.tasks.map((task, taskIndex) =>
        taskIndex === index
          ? {
              ...task,
              [key]: [
                "plannedPercent",
                "actualPercent",
                "plannedHours",
                "spentHours",
              ].includes(key)
                ? Number(value)
                : value,
            }
          : task,
      ),
    );
  const save = async (submit = false) => {
    setSaving(true);
    try {
      const { data } = id
        ? await client.patch(`/reports/${id}`, report)
        : await client.post("/reports", report);
      if (submit) await client.post(`/reports/${data._id}/submit`);
      toast.success(submit ? "Report submitted for review." : "Draft saved.");
      navigate("/reports/history");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save report.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen label="Loading report" />;
  const editable = status === "Draft" || status === "Needs Correction";
  return (
    <div className="workspace-page report-editor">
      <header className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
          <span className="eyebrow">Weekly report / {status}</span>
          <h1>{id ? "Shape the update." : "Write this week clearly."}</h1>
          <p>Every report follows the same team-wide structure.</p>
        </div>
        <span
          className={`status-badge status-badge--${status.toLowerCase().replaceAll(" ", "-")}`}>
          {status}
        </span>
      </header>
      {status === "Needs Correction" && (
        <div className="review-note">
          <strong>Manager feedback</strong>
          <p>{reviewComment}</p>
        </div>
      )}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / Context</span>
            <h2>Set the reporting window</h2>
          </div>
        </div>
        <div className="form-grid form-grid--three">
          <Field
            label="Week starts"
            type="date"
            value={report.weekStart}
            disabled={!editable}
            onChange={(event) => update("weekStart", event.target.value)}
            required
          />
          <Field
            label="Week ends"
            type="date"
            value={report.weekEnd}
            disabled={!editable}
            onChange={(event) => update("weekEnd", event.target.value)}
            required
          />
          <label className="field">
            <span>Project / category</span>
            <select
              className="field__input"
              value={report.project}
              disabled={!editable}
              onChange={(event) => update("project", event.target.value)}
              required>
              <option value="">Choose a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project.name}>
                  {project.name}
                </option>
              ))}
              {!projects.length && (
                <option value="Team operations">Team operations</option>
              )}
            </select>
          </label>
        </div>
      </section>
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / Completed work</span>
            <h2>Task-level detail</h2>
          </div>
          {editable && (
            <button
              className="text-button"
              onClick={() => update("tasks", [...report.tasks, emptyTask()])}>
              <FiPlus /> Add task
            </button>
          )}
        </div>
        <div className="task-table">
          <div className="task-table__head">
            <span>Task</span>
            <span>Priority</span>
            <span>Plan %</span>
            <span>Actual %</span>
            <span>Status</span>
            <span>Plan hrs</span>
            <span>Spent hrs</span>
            <span>Output</span>
            <span />
          </div>
          {report.tasks.map((task, index) => (
            <div className="task-table__row" key={index}>
              <input
                disabled={!editable}
                value={task.name}
                placeholder="Task name"
                onChange={(event) =>
                  updateTask(index, "name", event.target.value)
                }
              />
              <select
                disabled={!editable}
                value={task.priority}
                onChange={(event) =>
                  updateTask(index, "priority", event.target.value)
                }>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
              <input
                disabled={!editable}
                type="number"
                min="0"
                max="100"
                value={task.plannedPercent}
                onChange={(event) =>
                  updateTask(index, "plannedPercent", event.target.value)
                }
              />
              <input
                disabled={!editable}
                type="number"
                min="0"
                max="100"
                value={task.actualPercent}
                onChange={(event) =>
                  updateTask(index, "actualPercent", event.target.value)
                }
              />
              <select
                disabled={!editable}
                value={task.status}
                onChange={(event) =>
                  updateTask(index, "status", event.target.value)
                }>
                <option>Not started</option>
                <option>In progress</option>
                <option>Complete</option>
                <option>Blocked</option>
              </select>
              <input
                disabled={!editable}
                type="number"
                min="0"
                value={task.plannedHours}
                onChange={(event) =>
                  updateTask(index, "plannedHours", event.target.value)
                }
              />
              <input
                disabled={!editable}
                type="number"
                min="0"
                value={task.spentHours}
                onChange={(event) =>
                  updateTask(index, "spentHours", event.target.value)
                }
              />
              <input
                disabled={!editable}
                value={task.deliverable}
                placeholder="Link or result"
                onChange={(event) =>
                  updateTask(index, "deliverable", event.target.value)
                }
              />
              {editable && (
                <button
                  className="icon-button icon-button--light"
                  onClick={() =>
                    update(
                      "tasks",
                      report.tasks.filter(
                        (_, taskIndex) => taskIndex !== index,
                      ),
                    )
                  }
                  aria-label="Remove task">
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="form-section form-grid form-grid--two">
        <label className="field">
          <span>Tasks planned for next week</span>
          <textarea
            className="field__input field__textarea"
            disabled={!editable}
            value={report.nextWeekTasks}
            onChange={(event) => update("nextWeekTasks", event.target.value)}
          />
        </label>
        <label className="field">
          <span>Optional notes or links</span>
          <textarea
            className="field__input field__textarea"
            disabled={!editable}
            value={report.notes}
            onChange={(event) => update("notes", event.target.value)}
          />
        </label>
        <label className="field">
          <span>Blockers / challenges</span>
          <textarea
            className="field__input field__textarea"
            disabled={!editable}
            value={report.blockers}
            onChange={(event) => update("blockers", event.target.value)}
          />
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            disabled={!editable}
            checked={report.keyBlocker}
            onChange={(event) => update("keyBlocker", event.target.checked)}
          />{" "}
          Flag as key issue
        </label>
        <label className="field">
          <span>Achievements / highlights</span>
          <textarea
            className="field__input field__textarea"
            disabled={!editable}
            value={report.achievements}
            onChange={(event) => update("achievements", event.target.value)}
          />
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            disabled={!editable}
            checked={report.keyAchievement}
            onChange={(event) => update("keyAchievement", event.target.checked)}
          />{" "}
          Flag as key achievement
        </label>
      </section>
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / Time</span>
            <h2>Hours by task type</h2>
          </div>
        </div>
        <div className="form-grid form-grid--five">
          {Object.keys(report.hours).map((key) => (
            <Field
              key={key}
              label={key[0].toUpperCase() + key.slice(1)}
              type="number"
              min="0"
              value={report.hours[key]}
              disabled={!editable}
              onChange={(event) =>
                update("hours", {
                  ...report.hours,
                  [key]: Number(event.target.value),
                })
              }
            />
          ))}
        </div>
      </section>
      {editable && (
        <div className="editor-actions">
          <Button
            className="button--secondary"
            onClick={() => save(false)}
            loading={saving}>
            <FiSave /> Save draft
          </Button>
          <Button onClick={() => save(true)} loading={saving}>
            <FiSend /> Save and submit
          </Button>
        </div>
      )}
    </div>
  );
};
