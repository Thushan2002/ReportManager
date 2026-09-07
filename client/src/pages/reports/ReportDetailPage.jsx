import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiEdit3, FiSend } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client.js";
import { Button } from "../../components/button/Button.jsx";
import { Field } from "../../components/field/Field.jsx";
import { Loader } from "../../components/loader/Loader.jsx";
import { useAuth } from "../../context/useAuth.js";
import "./Reports.scss";

export const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [comment, setComment] = useState("");
  const [working, setWorking] = useState(false);
  useEffect(() => {
    client
      .get(`/reports/${id}`)
      .then(({ data }) => setReport(data))
      .catch((error) =>
        toast.error(error.response?.data?.message || "Could not load report."),
      )
      .finally(() => {});
  }, [id]);
  if (!report) return <Loader fullScreen label="Loading report" />;
  const review = async (action) => {
    setWorking(true);
    try {
      await client.post(`/reports/${id}/review`, { action, comment });
      toast.success(
        action === "approve" ? "Report approved." : "Changes requested.",
      );
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update review.");
    } finally {
      setWorking(false);
    }
  };
  return (
    <div className="workspace-page report-detail">
      <header className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
          <span className="eyebrow">
            {report.owner?.name || "Your report"} / {report.project}
          </span>
          <h1>
            Week of{" "}
            {new Date(report.weekStart).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
          </h1>
          <p>
            {new Date(report.weekStart).toLocaleDateString()} -{" "}
            {new Date(report.weekEnd).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`status-badge status-badge--${report.status.toLowerCase().replaceAll(" ", "-")}`}>
          {report.status}
        </span>
      </header>
      {report.reviewComment && (
        <div className="review-note">
          <strong>Latest review note</strong>
          <p>{report.reviewComment}</p>
        </div>
      )}
      <section className="detail-grid">
        <article className="detail-card detail-card--wide">
          <span className="eyebrow">Completed tasks</span>
          <h2>Work delivered</h2>
          <div className="detail-tasks">
            {report.tasks.map((task) => (
              <div className="detail-task" key={task._id || task.name}>
                <div>
                  <strong>{task.name}</strong>
                  <span>{task.deliverable || "No deliverable noted"}</span>
                </div>
                <span>{task.status}</span>
                <b>{task.actualPercent}%</b>
              </div>
            ))}
          </div>
        </article>
        <article className="detail-card">
          <span className="eyebrow">Next week</span>
          <h2>Planned work</h2>
          <p>{report.nextWeekTasks || "No next-week plan recorded."}</p>
        </article>
        <article className="detail-card">
          <span className="eyebrow">Signal</span>
          <h2>
            {report.keyBlocker
              ? "Key blocker"
              : report.keyAchievement
                ? "Key achievement"
                : "Team context"}
          </h2>
          <p>
            {report.keyBlocker
              ? report.blockers
              : report.keyAchievement
                ? report.achievements
                : report.notes || "No highlighted context."}
          </p>
        </article>
      </section>
      {user?.role === 10 && report.status === "Submitted" && (
        <section className="review-panel">
          <div>
            <span className="eyebrow">Manager review</span>
            <h2>Close the loop</h2>
            <p>
              Approve this report or send it back with one clear correction
              note.
            </p>
          </div>
          <Field
            label="Correction comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What should be clarified?"
          />
          <div className="review-actions">
            <Button
              variant="secondary"
              onClick={() => review("approve")}
              loading={working}>
              <FiCheck /> Approve
            </Button>
            <Button onClick={() => review("request_changes")} loading={working}>
              <FiSend /> Request changes
            </Button>
          </div>
        </section>
      )}
      {user?.role !== 10 &&
        ["Draft", "Needs Correction"].includes(report.status) && (
          <div className="editor-actions">
            <Link className="button" to={`/reports/${id}/edit`}>
              <FiEdit3 /> Edit report
            </Link>
          </div>
        )}
      {report.versions?.length > 0 && (
        <section className="form-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Version history</span>
              <h2>Previous submissions</h2>
            </div>
          </div>
          {report.versions.map((version) => (
            <div className="version-row" key={version.version}>
              <strong>Version {version.version}</strong>
              <span>{new Date(version.submittedAt).toLocaleString()}</span>
              <p>{version.reviewComment || "Submitted for review"}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
