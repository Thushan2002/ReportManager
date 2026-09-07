import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiFileText, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client.js";
import { Loader } from "../../components/loader/Loader.jsx";
import { useAuth } from "../../context/useAuth.js";
import "./Reports.scss";

export const ReportHistoryPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    client
      .get("/reports")
      .then(({ data }) => setReports(data))
      .catch((error) =>
        toast.error(error.response?.data?.message || "Could not load history."),
      )
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="workspace-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Personal archive</span>
          <h1>Your weekly rhythm.</h1>
          <p>Every update, its status, and the next action in one place.</p>
        </div>
        {user?.role !== 10 && (
          <Link className="button" to="/reports/new">
            <FiPlus /> New report
          </Link>
        )}
      </header>
      {loading ? (
        <Loader label="Loading report history" />
      ) : (
        <section className="reports-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Report history</span>
              <h2>{reports.length} weekly updates</h2>
            </div>
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
                    {new Date(report.weekStart).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    - {report.owner?.name || "Your report"}
                  </span>
                </div>
                <span
                  className={`status-badge status-badge--${report.status.toLowerCase().replaceAll(" ", "-")}`}>
                  {report.status}
                </span>
                <FiArrowRight />
              </Link>
            ))}
            {!reports.length && (
              <div className="empty-inline">
                No weekly reports yet. Start with the next update.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
