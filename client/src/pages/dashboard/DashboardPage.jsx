import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiEye,
} from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client.js";
import { Loader } from "../../components/loader/Loader.jsx";
import { useAuth } from "../../context/useAuth.js";
import {
  TrendLineChart,
  HorizontalBarChart,
  DonutTimeChart,
  ComplianceStatusBar,
} from "../../components/charts/Charts.jsx";
import { TeamPulseView } from "./TeamPulseView.jsx";
import "./Dashboard.scss";

export const DashboardPage = () => {
  const { user } = useAuth();
  const manager = user?.role === 10;

  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");

  // View mode tab for manager: 'overview' vs 'pulse'
  const [viewTab, setViewTab] = useState("overview");

  const fetchWorkspace = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
        ...(projectFilter && { project: projectFilter }),
        ...(ownerFilter && { owner: ownerFilter }),
        ...(fromFilter && { from: fromFilter }),
        ...(toFilter && { to: toFilter }),
      }).toString();

      const [repRes, projRes, membersRes] = await Promise.all([
        client.get(`/reports${query ? `?${query}` : ""}`),
        manager
          ? client.get("/projects").catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        manager
          ? client.get("/users").catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ]);

      setReports(repRes.data);
      if (manager) {
        setProjects(projRes.data);
        setTeamMembers(membersRes.data);
        const metricsRes = await client.get("/reports/metrics");
        setMetrics(metricsRes.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not load workspace data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [statusFilter, projectFilter, ownerFilter, fromFilter, toFilter, manager]);

  const resetFilters = () => {
    setStatusFilter("");
    setProjectFilter("");
    setOwnerFilter("");
    setFromFilter("");
    setToFilter("");
  };

  const hasActiveFilters = Boolean(
    statusFilter || projectFilter || ownerFilter || fromFilter || toFilter,
  );

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <span className="eyebrow">
            {manager ? "Executive & Team Workspace" : "Personal Workspace"}
          </span>
          <h1>
            {manager
              ? "See the team's work clearly."
              : "Keep your week in focus."}
          </h1>
          <p>
            {manager
              ? "Analyze team momentum, compliance, blockers, and review weekly reports."
              : "Record tasks delivered, plan ahead, and keep reviews in one shared place."}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={fetchWorkspace}
            aria-label="Refresh dashboard"
            title="Refresh dashboard">
            <FiRefreshCw />
          </button>
          {!manager && (
            <Link className="button" to="/reports/new">
              <FiPlus /> New Weekly Report
            </Link>
          )}
        </div>
      </header>

      {/* Tab Switcher for Manager (Overview vs Section Pulse) */}
      {manager && (
        <div className="dashboard-view-tabs">
          <button
            className={`dashboard-view-tab ${viewTab === "overview" ? "dashboard-view-tab--active" : ""}`}
            onClick={() => setViewTab("overview")}>
            <FiTrendingUp /> Overview & Insights
          </button>
          <button
            className={`dashboard-view-tab ${viewTab === "pulse" ? "dashboard-view-tab--active" : ""}`}
            onClick={() => setViewTab("pulse")}>
            <FiActivity /> Team Pulse (Side-by-Side Sections)
          </button>
        </div>
      )}

      {loading ? (
        <Loader label="Loading workspace data..." />
      ) : manager && viewTab === "pulse" ? (
        <TeamPulseView />
      ) : manager ? (
        <>
          {/* Summary Metric Cards */}
          <section className="stats dashboard-stats-grid">
            <Metric
              label="Submitted This Week"
              value={metrics?.submitted || 0}
              subtext={`${metrics?.total || 0} total updates created`}
              icon={<FiCheckCircle />}
            />
            <Metric
              label="Submission Compliance"
              value={`${metrics?.complianceRate || 0}%`}
              subtext={`${metrics?.notStartedCount || 0} members pending/late`}
              icon={<FiUsers />}
              accent={metrics?.complianceRate < 70}
            />
            <Metric
              label="Needs Correction"
              value={metrics?.correction || 0}
              subtext="Awaiting member updates"
              icon={<FiAlertCircle />}
              highlight={metrics?.correction > 0}
            />
            <Metric
              label="Open Blockers"
              value={metrics?.blockers || 0}
              subtext="Flagged risks across team"
              icon={<FiActivity />}
              highlight={metrics?.blockers > 0}
            />
          </section>

          {/* Visual Insights Grid */}
          <section className="insight-grid-v2">
            {/* Chart 1: Tasks Completion Trend */}
            <article className="insight-card-v2">
              <div className="insight-card__head">
                <div>
                  <span className="eyebrow">Momentum</span>
                  <h3>Tasks Completed Trend Over Time</h3>
                </div>
              </div>
              <TrendLineChart data={metrics?.tasksTrend || []} />
            </article>

            {/* Chart 2: Member Compliance Status */}
            <article className="insight-card-v2">
              <div className="insight-card__head">
                <div>
                  <span className="eyebrow">Team Compliance</span>
                  <h3>Submission Status by Member</h3>
                </div>
              </div>
              <ComplianceStatusBar members={metrics?.memberCompliance || []} />
            </article>

            {/* Chart 3: Workload by Project */}
            <article className="insight-card-v2">
              <div className="insight-card__head">
                <div>
                  <span className="eyebrow">Allocation</span>
                  <h3>Task Load by Project</h3>
                </div>
              </div>
              <HorizontalBarChart
                data={metrics?.byProject || {}}
                unit="tasks"
              />
            </article>

            {/* Chart 4: Time Spent by Task Type */}
            <article className="insight-card-v2">
              <div className="insight-card__head">
                <div>
                  <span className="eyebrow">Time Distribution</span>
                  <h3>Team Hours by Task Category</h3>
                </div>
              </div>
              <DonutTimeChart hours={metrics?.timeByType || {}} />
            </article>
          </section>

          {/* Recent Activity Feed */}
          {metrics?.recentActivity && metrics.recentActivity.length > 0 && (
            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Live Activity</span>
                  <h2>Recent Submission & Review Actions</h2>
                </div>
              </div>
              <div className="activity-feed">
                {metrics.recentActivity.map((act) => (
                  <div className="activity-item" key={act.id}>
                    <span
                      className={`activity-icon activity-icon--${act.type}`}>
                      {act.type === "approved" ? (
                        <FiCheckCircle />
                      ) : act.type === "submitted" ? (
                        <FiFileText />
                      ) : (
                        <FiAlertCircle />
                      )}
                    </span>
                    <div className="activity-content">
                      <div className="activity-title">
                        <strong>{act.title}</strong>
                      </div>
                      <p>{act.description}</p>
                    </div>
                    <small>{new Date(act.timestamp).toLocaleString()}</small>
                    <Link
                      to={`/reports/${act.reportId}`}
                      className="activity-link"
                      title="View report">
                      <FiEye />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        /* Team Member Personal Hero */
        <section className="personal-hero">
          <div>
            <span className="eyebrow">Weekly Rhythm</span>
            <h2>One honest update beats a dozen scattered notes.</h2>
            <p>
              Fill in your tasks, highlight blockers early, log category hours,
              and collaborate directly with your manager on review notes.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link className="button" to="/reports/new">
              <FiPlus /> Create This Week's Report
            </Link>
            <Link className="button button--secondary" to="/reports/history">
              <FiFileText /> View Past History
            </Link>
          </div>
        </section>
      )}

      {/* Reports Queue / History Table */}
      <section className="reports-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {manager ? "Team Report Queue" : "Your Recent Reports"}
            </span>
            <h2>
              {manager ? "All Team Submissions" : "Recent Weekly Updates"}
            </h2>
          </div>

          {/* Filter Bar */}
          {manager && (
            <div className="dashboard-filters">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Needs Correction">Needs Correction</option>
                <option value="Approved">Approved</option>
              </select>

              <select
                className="filter-select"
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}>
                <option value="">All Members</option>
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}>
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p._id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                className="date-filter"
                type="date"
                title="Filter from date"
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
              />
              <input
                className="date-filter"
                type="date"
                title="Filter to date"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
              />

              {hasActiveFilters && (
                <button
                  type="button"
                  className="text-button"
                  onClick={resetFilters}
                  style={{ alignSelf: "center", marginLeft: "4px" }}>
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        <div className="report-list">
          {reports.map((report) => (
            <div className="report-row" key={report._id}>
              <span className="report-row__icon">
                <FiFileText />
              </span>
              <div className="report-row__body">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link
                    to={`/reports/${report._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}>
                    <h3 style={{ display: "inline-block" }}>
                      {report.project}
                    </h3>
                  </Link>
                  {report.keyBlocker && (
                    <span className="mini-badge mini-badge--blocker">
                      ⚠️ Blocker
                    </span>
                  )}
                  {report.keyAchievement && (
                    <span className="mini-badge mini-badge--achievement">
                      🌟 Highlight
                    </span>
                  )}
                </div>
                <span>
                  {report.owner?.name || "You"} • Week of{" "}
                  {new Date(report.weekStart).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {report.tasks?.length
                    ? ` • ${report.tasks.length} tasks`
                    : ""}
                </span>
                {report.reviewComment && (
                  <div className="row-feedback-snippet">
                    <strong>Review Note:</strong> {report.reviewComment}
                  </div>
                )}
              </div>

              <span
                className={`status-badge status-badge--${report.status.toLowerCase().replaceAll(" ", "-")}`}>
                {report.status}
              </span>

              <div className="row-actions">
                <Link
                  className="button button--secondary"
                  to={`/reports/${report._id}`}
                  style={{ padding: "6px 12px", fontSize: "12px" }}>
                  View
                </Link>
                {manager && report.status === "Submitted" && (
                  <Link
                    className="button"
                    to={`/reports/${report._id}/review`}
                    style={{ padding: "6px 12px", fontSize: "12px" }}>
                    Review
                  </Link>
                )}
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="empty-inline">
              No reports match the selected filters.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const Metric = ({ label, value, subtext, icon, accent, highlight }) => (
  <div
    className={`stat ${accent ? "stat--accent" : ""} ${highlight ? "stat--highlight" : ""}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {subtext && <small className="stat-subtext">{subtext}</small>}
    {icon}
  </div>
);
