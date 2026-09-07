import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheck, FiSend, FiClock, FiLayers } from 'react-icons/fi'
import toast from 'react-hot-toast'
import client from '../../api/client.js'
import { Loader } from '../../components/loader/Loader.jsx'
import { Button } from '../../components/button/Button.jsx'
import { useAuth } from '../../context/useAuth.js'
import './Reports.scss'

export const ManagerReviewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [actionType, setActionType] = useState('approve')
  const [submitting, setSubmitting] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fetchReport = async () => {
      try {
        const { data } = await client.get(`/reports/${id}`)
        if (!cancelled) {
          setReport(data)
          setSelectedVersion(null)
        }
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || 'Could not load report')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchReport()
    return () => { cancelled = true }
  }, [id])

  if (loading) return <Loader fullScreen label="Loading report for review" />
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

  const handleReview = async (e) => {
    e.preventDefault()
    if (actionType === 'request_changes' && !comment.trim()) {
      toast.error('Please provide a correction comment explaining what needs to change.')
      return
    }

    setSubmitting(true)
    try {
      await client.post(`/reports/${id}/review`, {
        action: actionType,
        comment: actionType === 'approve' ? '' : comment
      })
      toast.success(actionType === 'approve' ? 'Report approved successfully.' : 'Changes requested.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not complete review')
    } finally {
      setSubmitting(false)
    }
  }

  // Active displayed content (either current report or historical version snapshot)
  const activeContent = selectedVersion ? selectedVersion.content : report
  const isViewingHistorical = Boolean(selectedVersion)

  return (
    <div className="workspace-page report-detail review-page">
      <header className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
          <span className="eyebrow">Manager Review Workspace</span>
          <h1>Review Weekly Report</h1>
          <p>
            {report.owner?.name} • {report.project} • Week of{' '}
            {new Date(report.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`status-badge status-badge--${report.status.toLowerCase().replaceAll(' ', '-')}`}>
            {report.status}
          </span>
        </div>
      </header>

      {/* Version History Selector Tabs */}
      {report.versions && report.versions.length > 0 && (
        <section className="version-tabs-section">
          <div className="version-tabs-header">
            <FiLayers />
            <span>Submission Versions ({report.versions.length}):</span>
          </div>
          <div className="version-pill-group">
            <button
              className={`version-pill ${!selectedVersion ? 'version-pill--active' : ''}`}
              onClick={() => setSelectedVersion(null)}
            >
              Latest Under Review (Current)
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
              <FiClock /> You are viewing a snapshot of <strong>Version {selectedVersion.version}</strong> submitted on{' '}
              {new Date(selectedVersion.submittedAt).toLocaleString()}.
              {selectedVersion.reviewComment && (
                <div className="version-past-comment">
                  <strong>Feedback given on this version:</strong> "{selectedVersion.reviewComment}"
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Latest Review Note Banner */}
      {report.reviewComment && !isViewingHistorical && (
        <div className="review-note">
          <strong>Previous Review Comment:</strong>
          <p>{report.reviewComment}</p>
        </div>
      )}

      {/* Tasks Table */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Tasks & Deliverables</span>
            <h2>Tasks Completed This Week ({activeContent.tasks?.length || 0})</h2>
          </div>
        </div>
        <div className="task-table">
          <div className="task-table__head" style={{ gridTemplateColumns: '1.5fr 0.85fr 0.6fr 0.6fr 1fr 0.65fr 0.65fr 1.2fr' }}>
            <span>Task</span>
            <span>Priority</span>
            <span>Plan %</span>
            <span>Actual %</span>
            <span>Status</span>
            <span>Plan hrs</span>
            <span>Spent hrs</span>
            <span>Deliverable</span>
          </div>
          {activeContent.tasks?.map((task, index) => (
            <div className="task-table__row" style={{ gridTemplateColumns: '1.5fr 0.85fr 0.6fr 0.6fr 1fr 0.65fr 0.65fr 1.2fr', padding: '12px 10px' }} key={task._id || index}>
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
            <div className="empty-inline">No tasks recorded in this version.</div>
          )}
        </div>
      </section>

      {/* Next Week & Signal Cards */}
      <section className="detail-grid">
        <article className="detail-card">
          <span className="eyebrow">Next Week</span>
          <h2>Tasks Planned for Next Week</h2>
          <p>{activeContent.nextWeekTasks || 'None specified.'}</p>
        </article>

        <article className={`detail-card ${activeContent.keyBlocker ? 'detail-card--highlighted' : ''}`}>
          <span className="eyebrow">Blockers & Challenges</span>
          <h2>
            {activeContent.keyBlocker ? '⚠️ Key Blocker Flagged' : 'Blockers'}
          </h2>
          <p>{activeContent.blockers || 'No blockers reported.'}</p>
        </article>

        <article className={`detail-card ${activeContent.keyAchievement ? 'detail-card--highlighted' : ''}`}>
          <span className="eyebrow">Highlights</span>
          <h2>
            {activeContent.keyAchievement ? '🌟 Key Achievement Flagged' : 'Achievements'}
          </h2>
          <p>{activeContent.achievements || 'No highlights reported.'}</p>
        </article>

        <article className="detail-card">
          <span className="eyebrow">Additional Context</span>
          <h2>Notes & Links</h2>
          <p>{activeContent.notes || 'No additional notes provided.'}</p>
        </article>
      </section>

      {/* Hours Worked */}
      {activeContent.hours && (
        <section className="form-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Time allocation</span>
              <h2>Hours Breakdown</h2>
            </div>
          </div>
          <div className="form-grid form-grid--five">
            {Object.entries(activeContent.hours).map(([cat, val]) => (
              <div className="stat" key={cat} style={{ minHeight: '90px', padding: '14px' }}>
                <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                <strong style={{ fontSize: '22px', marginTop: '8px' }}>{val || 0}h</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Manager Review Action Box */}
      {user?.role === 10 && report.status === 'Submitted' && (
        <section className="review-box-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Review Decision</span>
              <h2>Take Review Action</h2>
              <p>Approve this report or request corrections with one clear comment.</p>
            </div>
          </div>

          <form onSubmit={handleReview} className="review-decision-form">
            <div className="decision-radio-group">
              <label className={`decision-radio ${actionType === 'approve' ? 'decision-radio--selected' : ''}`}>
                <input
                  type="radio"
                  name="reviewAction"
                  value="approve"
                  checked={actionType === 'approve'}
                  onChange={() => setActionType('approve')}
                />
                <div>
                  <strong>Approve Report</strong>
                  <small>The report is complete and accurate. Moves to Approved status.</small>
                </div>
              </label>

              <label className={`decision-radio ${actionType === 'request_changes' ? 'decision-radio--selected' : ''}`}>
                <input
                  type="radio"
                  name="reviewAction"
                  value="request_changes"
                  checked={actionType === 'request_changes'}
                  onChange={() => setActionType('request_changes')}
                />
                <div>
                  <strong>Request Changes (Needs Correction)</strong>
                  <small>Send back with specific feedback. The report becomes editable by the member.</small>
                </div>
              </label>
            </div>

            {actionType === 'request_changes' && (
              <div className="correction-comment-field">
                <label className="field">
                  <span>Correction Comment <strong style={{ color: 'var(--color-error)' }}>*</strong></span>
                  <textarea
                    className="field__input field__textarea"
                    placeholder="Describe what needs to be adjusted, clarified, or added..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </label>
              </div>
            )}

            <div className="review-submit-actions">
              <Button type="submit" loading={submitting}>
                {actionType === 'approve' ? <><FiCheck /> Approve Report</> : <><FiSend /> Send Correction Request</>}
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}
