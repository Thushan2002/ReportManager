import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiFileText, FiPlus, FiSearch, FiEdit3, FiTrash2, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'
import client from '../../api/client.js'
import { Loader } from '../../components/loader/Loader.jsx'
import { Modal } from '../../components/modal/Modal.jsx'
import { Button } from '../../components/button/Button.jsx'
import { useAuth } from '../../context/useAuth.js'
import './Reports.scss'

export const ReportHistoryPage = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [search, setSearch] = useState('')

  // Delete draft modal state
  const [reportToDelete, setReportToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [repRes, projRes] = await Promise.all([
        client.get('/reports'),
        client.get('/projects').catch(() => ({ data: [] }))
      ])
      setReports(repRes.data)
      setProjects(projRes.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load report history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true)
      try {
        const [repRes, projRes] = await Promise.all([
          client.get('/reports'),
          client.get('/projects').catch(() => ({ data: [] }))
        ])
        if (!cancelled) {
          setReports(repRes.data)
          setProjects(projRes.data)
        }
      } catch (error) {
        if (!cancelled) toast.error(error.response?.data?.message || 'Could not load report history.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  const handleSubmitDraft = async (reportId) => {
    try {
      await client.post(`/reports/${reportId}/submit`)
      toast.success('Report submitted for manager review.')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit report')
    }
  }

  const handleDeleteDraft = async () => {
    if (!reportToDelete) return
    setDeleting(true)
    try {
      await client.delete(`/reports/${reportToDelete._id}`)
      toast.success('Draft report removed.')
      setReportToDelete(null)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete draft')
    } finally {
      setDeleting(false)
    }
  }

  const filteredReports = reports.filter((r) => {
    const matchesStatus = !statusFilter || r.status === statusFilter
    const matchesProject = !projectFilter || r.project === projectFilter
    const matchesSearch =
      !search ||
      r.project?.toLowerCase().includes(search.toLowerCase()) ||
      r.notes?.toLowerCase().includes(search.toLowerCase()) ||
      r.blockers?.toLowerCase().includes(search.toLowerCase()) ||
      r.achievements?.toLowerCase().includes(search.toLowerCase()) ||
      r.tasks?.some((t) => t.name?.toLowerCase().includes(search.toLowerCase()))
    return matchesStatus && matchesProject && matchesSearch
  })

  return (
    <div className="workspace-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Personal Archive & Status</span>
          <h1>Report History</h1>
          <p>A chronological record of every weekly submission, review feedback, and status.</p>
        </div>
        {user?.role !== 10 && (
          <Link className="button" to="/reports/new">
            <FiPlus /> New Weekly Report
          </Link>
        )}
      </header>

      {/* Toolbar / Filters */}
      <section className="reports-toolbar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search reports by keyword, task name, blockers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="dashboard-filters">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Needs Correction">Needs Correction</option>
            <option value="Approved">Approved</option>
          </select>

          <select
            className="filter-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <Loader label="Loading reports" />
      ) : (
        <section className="reports-section" style={{ marginTop: '24px' }}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Results</span>
              <h2>{filteredReports.length} Reports Found</h2>
            </div>
          </div>

          <div className="report-list">
            {filteredReports.map((report) => {
              const isEditable = ['Draft', 'Needs Correction'].includes(report.status)
              const isDraft = report.status === 'Draft'

              return (
                <div className="report-row" key={report._id}>
                  <span className="report-row__icon">
                    <FiFileText />
                  </span>

                  <div className="report-row__body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link to={`/reports/${report._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 style={{ display: 'inline-block' }}>{report.project}</h3>
                      </Link>
                      {report.keyBlocker && (
                        <span className="mini-badge mini-badge--blocker" title="Key blocker flagged">
                          ⚠️ Blocker
                        </span>
                      )}
                      {report.keyAchievement && (
                        <span className="mini-badge mini-badge--achievement" title="Key achievement flagged">
                          🌟 Highlight
                        </span>
                      )}
                    </div>
                    <span>
                      Week of{' '}
                      {new Date(report.weekStart).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}{' '}
                      – {new Date(report.weekEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      {report.tasks?.length ? ` • ${report.tasks.length} tasks` : ''}
                      {report.versions?.length > 1 ? ` • v${report.versions.length}` : ''}
                    </span>
                    {report.reviewComment && (
                      <div className="row-feedback-snippet">
                        <strong>Feedback:</strong> {report.reviewComment}
                      </div>
                    )}
                  </div>

                  <span
                    className={`status-badge status-badge--${report.status.toLowerCase().replaceAll(' ', '-')}`}
                  >
                    {report.status}
                  </span>

                  <div className="row-actions">
                    <Link to={`/reports/${report._id}`} className="icon-button" title="View details">
                      <FiArrowRight />
                    </Link>

                    {isEditable && (
                      <Link to={`/reports/${report._id}/edit`} className="icon-button" title="Edit report">
                        <FiEdit3 />
                      </Link>
                    )}

                    {isDraft && (
                      <>
                        <button
                          type="button"
                          className="icon-button"
                          title="Submit draft now"
                          onClick={() => handleSubmitDraft(report._id)}
                        >
                          <FiSend />
                        </button>
                        <button
                          type="button"
                          className="icon-button icon-button--danger"
                          title="Delete draft"
                          onClick={() => setReportToDelete(report)}
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
            {filteredReports.length === 0 && (
              <div className="empty-inline">
                No weekly reports match your filters.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Delete Draft Modal */}
      <Modal
        isOpen={Boolean(reportToDelete)}
        onClose={() => setReportToDelete(null)}
        title="Delete Draft"
      >
        <div className="modal-confirm">
          <p>
            Are you sure you want to delete this draft report for <strong>{reportToDelete?.project}</strong> (Week of{' '}
            {reportToDelete?.weekStart && new Date(reportToDelete.weekStart).toLocaleDateString()})?
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setReportToDelete(null)}>
              Cancel
            </Button>
            <Button className="button--danger" onClick={handleDeleteDraft} loading={deleting}>
              <FiTrash2 /> Delete Draft
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
