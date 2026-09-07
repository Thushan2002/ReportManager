import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiFileText, FiClock, FiFolder, FiMail } from 'react-icons/fi'
import toast from 'react-hot-toast'
import client from '../../api/client.js'
import { Loader } from '../../components/loader/Loader.jsx'
import './Team.scss'

export const TeamMemberProfilePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .get(`/users/${id}/stats`)
      .then((res) => setData(res.data))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not load member profile')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader fullScreen label="Loading member profile" />
  if (!data || !data.user) {
    return (
      <div className="workspace-page">
        <button className="back-link" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <div className="empty-inline">Team member not found.</div>
      </div>
    )
  }

  const { user, stats, projects, recentReports } = data

  return (
    <div className="workspace-page member-profile-page">
      <header className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back to team
          </button>
          <div className="profile-hero-info">
            <span className="profile-large-avatar">{user.name?.charAt(0).toUpperCase()}</span>
            <div>
              <span className="eyebrow">{user.role === 10 ? 'Manager / Admin' : 'Team Member'}</span>
              <h1>{user.name}</h1>
              <p className="profile-email">
                <FiMail /> {user.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Member Stats Grid */}
      <section className="stats member-stats-grid">
        <div className="stat">
          <span>Total Reports</span>
          <strong>{stats.totalReports}</strong>
          <FiFileText />
        </div>
        <div className="stat stat--accent">
          <span>Approval Rate</span>
          <strong>{stats.complianceRate}%</strong>
          <FiCheckCircle />
        </div>
        <div className="stat">
          <span>Task Completion</span>
          <strong>{stats.taskCompletionRate}%</strong>
          <FiCheckCircle />
        </div>
        <div className="stat">
          <span>Total Logged Hours</span>
          <strong>{stats.totalHours}h</strong>
          <FiClock />
        </div>
      </section>

      {/* Assigned Projects */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Project assignments</span>
            <h2>Assigned Categories ({projects?.length || 0})</h2>
          </div>
        </div>
        <div className="member-project-badges">
          {projects && projects.length > 0 ? (
            projects.map((p) => (
              <div className="member-project-chip" key={p._id}>
                <FiFolder />
                <div>
                  <strong>{p.name}</strong>
                  {p.description && <small>{p.description}</small>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No specific projects assigned yet.</p>
          )}
        </div>
      </section>

      {/* Report History */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Archive & status</span>
            <h2>Report History ({recentReports?.length || 0})</h2>
          </div>
        </div>
        <div className="report-list">
          {recentReports && recentReports.length > 0 ? (
            recentReports.map((report) => (
              <Link
                className="report-row report-row--link"
                to={`/reports/${report._id}`}
                key={report._id}
              >
                <span className="report-row__icon">
                  <FiFileText />
                </span>
                <div className="report-row__body">
                  <h3>{report.project}</h3>
                  <span>
                    Week of {new Date(report.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {report.tasks ? ` • ${report.tasks.length} tasks` : ''}
                    {report.blockers?.trim() ? ' • ⚠️ Blocker reported' : ''}
                  </span>
                </div>
                <span
                  className={`status-badge status-badge--${report.status.toLowerCase().replaceAll(' ', '-')}`}
                >
                  {report.status}
                </span>
              </Link>
            ))
          ) : (
            <div className="empty-inline">No reports recorded for this member yet.</div>
          )}
        </div>
      </section>
    </div>
  )
}
