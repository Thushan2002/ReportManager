import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiEdit3, FiClock, FiLayers, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import client from '../../api/client.js'
import { Loader } from '../../components/loader/Loader.jsx'
import { useAuth } from '../../context/useAuth.js'
import './Reports.scss'

export const ReportDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fetchReport = async () => {
      try {
        const { data } = await client.get(`/reports/${id}`)
        if (!cancelled) setReport(data)
      } catch (error) {
        if (!cancelled) toast.error(error.response?.data?.message || 'Could not load report.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchReport()
    return () => { cancelled = true }
  }, [id])

  if (loading) return <Loader fullScreen label="Loading report" />
  if (!report) {
    return (
      <div className="workspace-page">
        <button className="back-link" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <div className="empty-inline">Report not found.</div>
      </div>
    )
  }

  const isOwner = String(report.owner?._id || report.owner) === String(user?.id)
  const isManager = user?.role === 10
  const canEdit = isOwner && ['Draft', 'Needs Correction'].includes(report.status)
  const canReview = isManager && report.status === 'Submitted'

  const activeContent = selectedVersion ? selectedVersion.content : report
  const isViewingHistorical = Boolean(selectedVersion)

  return (
    <div className="workspace-page report-detail">
      <header className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
          <span className="eyebrow">
            {report.owner?.name || 'Your report'} / {report.project}
          </span>
          <h1>
            Week of{' '}
            {new Date(report.weekStart).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h1>
          <p>
            {new Date(report.weekStart).toLocaleDateString()} – {new Date(report.weekEnd).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            className={`status-badge status-badge--${report.status.toLowerCase().replaceAll(' ', '-')}`}
          >
            {report.status}
          </span>
          {canEdit && (
            <Link className="button" to={`/reports/${id}/edit`}>
              <FiEdit3 /> Edit Report
            </Link>
          )}
          {canReview && (
            <Link className="button button--accent" to={`/reports/${id}/review`}>
              <FiCheckCircle /> Review Submission
            </Link>
          )}
        </div>
      </header>

      {/* Version History Selector */}
      {report.versions && report.versions.length > 0 && (
        <section className="version-tabs-section">
          <div className="version-tabs-header">
            <FiLayers />
            <span>Submission Version History ({report.versions.length}):</span>
          </div>
          <div className="version-pill-group">
            <button
              className={`version-pill ${!selectedVersion ? 'version-pill--active' : ''}`}
              onClick={() => setSelectedVersion(null)}
            >
              Current Version
            </button>
            {report.versions.map((v) => (
              <button
                key={v.version}
                className={`version-pill ${selectedVersion?.version === v.version ? 'version-pill--active' : ''}`}
                onClick={() => setSelectedVersion(v)}
              >
                Version {v.version} ({new Date(v.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
              </button>
            ))}
          </div>

          {isViewingHistorical && (
            <div className="version-historical-notice">
              <FiClock /> Viewing snapshot of <strong>Version {selectedVersion.version}</strong> submitted on{' '}
              {new Date(selectedVersion.submittedAt).toLocaleString()}.
              {selectedVersion.reviewComment && (
                <div className="version-past-comment">
                  <strong>Manager Feedback:</strong> "{selectedVersion.reviewComment}"
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Latest Review Feedback Note */}
      {report.reviewComment && !isViewingHistorical && (
        <div className="review-note">
          <strong>Manager Feedback Note:</strong>
          <p>{report.reviewComment}</p>
        </div>
      )}

      {/* Task Level Table */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Task-level table</span>
            <h2>Tasks Delivered ({activeContent.tasks?.length || 0})</h2>
          </div>
        </div>
        <div className="task-table">
          <div className="task-table__head" style={{ gridTemplateColumns: '1.5fr 0.85fr 0.6fr 0.6fr 1fr 0.65fr 0.65fr 1.2fr' }}>
            <span>Task Name</span>
            <span>Priority</span>
            <span>Planned %</span>
            <span>Actual %</span>
            <span>Status</span>
            <span>Plan hrs</span>
            <span>Spent hrs</span>
            <span>Deliverable Output</span>
          </div>
          {activeContent.tasks?.map((task, idx) => (
            <div className="task-table__row" style={{ gridTemplateColumns: '1.5fr 0.85fr 0.6fr 0.6fr 1fr 0.65fr 0.65fr 1.2fr', padding: '12px 10px' }} key={task._id || idx}>
              <strong style={{ fontSize: '13px' }}>{task.name}</strong>
              <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
              <span>{task.plannedPercent}%</span>
              <b style={{ color: 'var(--color-green)' }}>{task.actualPercent}%</b>
              <span>{task.status}</span>
              <span>{task.plannedHours}h</span>
              <span>{task.spentHours}h</span>
              <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>{task.deliverable || '—'}</span>
            </div>
          ))}
          {(!activeContent.tasks || activeContent.tasks.length === 0) && (
            <div className="empty-inline">No tasks recorded.</div>
          )}
        </div>
      </section>

      {/* Grid: Next Week, Blockers, Achievements, Notes */}
      <section className="detail-grid">
        <article className="detail-card">
          <span className="eyebrow">Planned Work</span>
          <h2>Tasks Planned for Next Week</h2>
          <p>{activeContent.nextWeekTasks || 'No next week tasks noted.'}</p>
        </article>

        <article className={`detail-card ${activeContent.keyBlocker ? 'detail-card--highlighted' : ''}`}>
          <span className="eyebrow">Blockers & Challenges</span>
          <h2>
            {activeContent.keyBlocker ? '⚠️ Key Blocker Flagged' : 'Blockers'}
          </h2>
          <p>{activeContent.blockers || 'No blockers reported this week.'}</p>
        </article>

        <article className={`detail-card ${activeContent.keyAchievement ? 'detail-card--highlighted' : ''}`}>
          <span className="eyebrow">Achievements & Highlights</span>
          <h2>
            {activeContent.keyAchievement ? '🌟 Key Highlight Flagged' : 'Achievements'}
          </h2>
          <p>{activeContent.achievements || 'No achievements highlighted.'}</p>
        </article>

        <article className="detail-card">
          <span className="eyebrow">Notes & Links</span>
          <h2>Optional Notes</h2>
          <p>{activeContent.notes || 'No additional notes or links.'}</p>
        </article>
      </section>

      {/* Hours Breakdown */}
      {activeContent.hours && (
        <section className="form-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Time allocation</span>
              <h2>Hours by Task Type</h2>
            </div>
          </div>
          <div className="form-grid form-grid--five">
            {Object.entries(activeContent.hours).map(([cat, val]) => (
              <div className="stat" key={cat} style={{ minHeight: '85px', padding: '12px' }}>
                <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                <strong style={{ fontSize: '20px', marginTop: '6px' }}>{val || 0}h</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
