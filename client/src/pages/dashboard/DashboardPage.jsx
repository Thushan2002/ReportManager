import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client.js";
import { Loader } from "../../components/loader/Loader.jsx";
import { useAuth } from "../../context/useAuth.js";
import "./Dashboard.scss";

export const DashboardPage = () => {
  const { user } = useAuth();
  const manager = user?.role === 10;
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const query = new URLSearchParams({
    ...(statusFilter && { status: statusFilter }),
    ...(projectFilter && { project: projectFilter }),
    ...(ownerFilter && { owner: ownerFilter }),
    ...(fromFilter && { from: fromFilter }),
    ...(toFilter && { to: toFilter }),
  }).toString();
  const load = async () => {
    setLoading(true);
    try {
      const reportResponse = await client.get(
        `/reports${query ? `?${query}` : ""}`,
      );
      setReports(reportResponse.data);
      if (manager) setMetrics((await client.get("/reports/metrics")).data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not load the workspace.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchWorkspace = async () => {
      setLoading(true);
      try {
        const reportResponse = await client.get(
          `/reports${statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : ""}`,
        );
        setReports(reportResponse.data);
        if (manager) setMetrics((await client.get("/reports/metrics")).data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Could not load the workspace.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [statusFilter, projectFilter, ownerFilter, fromFilter, toFilter, manager]);
  useEffect(() => {
    if (manager)
      client
        .get("/projects")
        .then(({ data }) => setProjects(data))
        .catch(() => {});
  }, [manager]);
  const owners = reports.reduce(
    (list, report) =>
      report.owner && !list.some((owner) => owner._id === report.owner._id)
        ? [...list, report.owner]
        : list,
    [],
  );
  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <span className="eyebrow">
            {manager ? "Manager workspace" : "Your workspace"}
          </span>
          <h1>
            {manager ? "See the work clearly." : "Keep your week visible."}
          </h1>
          <p>
            {manager
              ? "Review momentum, blockers, and the reports waiting for your attention."
              : "A focused home for the work you have done and what comes next."}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={load}
            aria-label="Refresh dashboard"
            title="Refresh dashboard">
            <FiRefreshCw />
          </button>
          {!manager && (
            <Link className="button" to="/reports/new">
              <FiPlus /> New report
            </Link>
          )}
        </div>
      </header>
      {loading ? (
        <Loader label="Loading workspace" />
      ) : manager ? (
        <>
          <section className="stats">
            <Metric
              label="Submitted this week"
              value={metrics?.submitted || 0}
              icon={<FiCheckCircle />}
            />
            <Metric
              label="Needs correction"
              value={metrics?.correction || 0}
              icon={<FiAlertCircle />}
              accent
            />
            <Metric
              label="Open blockers"
              value={metrics?.blockers || 0}
              icon={<FiActivity />}
            />
          </section>
          <section className="insight-grid">
            <Insight title="Status mix" values={metrics?.byStatus} />
            <Insight title="Task load by project" values={metrics?.byProject} />
            <Insight title="Time by task type" values={metrics?.timeByType} />
          </section>
        </>
      ) : (
        <section className="personal-hero">
          <div>
            <span className="eyebrow">This week</span>
            <h2>One honest update beats a dozen scattered notes.</h2>
            <p>
              Start a draft, send it when it is ready, and keep the review
              conversation attached to the report.
            </p>
          </div>
          <Link className="button" to="/reports/history">
            <FiFileText /> View report history
          </Link>
        </section>
      )}
      <section className="reports-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {manager ? "Team queue" : "Recent reports"}
            </span>
            <h2>
              {manager ? "Reports across the team" : "Your report history"}
            </h2>
          </div>
          {manager && (
            <div className="dashboard-filters">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All statuses</option>
                <option>Draft</option>
                <option>Submitted</option>
                <option>Needs Correction</option>
                <option>Approved</option>
              </select>
              <select
                className="filter-select"
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}>
                <option value="">All members</option>
                {owners.map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {owner.name}
                  </option>
                ))}
              </select>
              <select
                className="filter-select"
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}>
                <option value="">All projects</option>
                {projects.map((project) => (
                  <option key={project._id} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </select>
              <input
                className="date-filter"
                type="date"
                value={fromFilter}
                onChange={(event) => setFromFilter(event.target.value)}
              />
              <input
                className="date-filter"
                type="date"
                value={toFilter}
                onChange={(event) => setToFilter(event.target.value)}
              />
            </div>
          )}
        </div>
        <div className="report-list">
          {reports.map((report) => (
            <Link
              className="report-row report-row--link"
              to={`/reports/${report._id}`}
              key={report._id}>
              <span className="report-row__icon">
                <FiFileText />
              </span>
              <div className="report-row__body">
                <h3>{report.project}</h3>
                <span>
                  {report.owner?.name || "You"} /{" "}
                  {new Date(report.weekStart).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <span
                className={`status-badge status-badge--${report.status.toLowerCase().replaceAll(" ", "-")}`}>
                {report.status}
              </span>
            </Link>
          ))}
          {!reports.length && (
            <div className="empty-inline">Nothing matches this view yet.</div>
          )}
        </div>
      </section>
    </div>
  );
};

const Metric = ({ label, value, icon, accent }) => (
  <div className={`stat ${accent ? "stat--accent" : ""}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {icon}
  </div>
);
const Insight = ({ title, values }) => (
  <article className="insight-card">
    <span className="eyebrow">Visual insight</span>
    <h3>{title}</h3>
    {Object.entries(values || {}).map(([key, value]) => (
      <div className="bar-row" key={key}>
        <span>{key}</span>
        <div>
          <i style={{ width: `${Math.min(100, value * 12 + 8)}%` }} />
        </div>
        <b>{value}</b>
      </div>
    ))}
  </article>
);
