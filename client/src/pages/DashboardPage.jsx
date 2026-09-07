import { useEffect, useState } from 'react'
import { FiArrowUpRight, FiClock, FiFilePlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import client from '../api/client.js'
import { Button } from '../components/Button.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { Field } from '../components/Field.jsx'
import { Loader } from '../components/Loader.jsx'

export const DashboardPage = () => {
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')

  const loadReports = async () => { setIsLoading(true); try { const { data } = await client.get('/reports'); setReports(data) } catch (error) { toast.error(error.response?.data?.message || 'Could not load reports.') } finally { setIsLoading(false) } }
  useEffect(() => {
    client.get('/reports').then(({ data }) => setReports(data)).catch((error) => toast.error(error.response?.data?.message || 'Could not load reports.')).finally(() => setIsLoading(false))
  }, [])
  const createReport = async (event) => { event.preventDefault(); setIsSaving(true); try { const { data } = await client.post('/reports', { title }); setReports([data, ...reports]); setTitle(''); setShowForm(false); toast.success('Report created.') } catch (error) { toast.error(error.response?.data?.message || 'Could not create report.') } finally { setIsSaving(false) } }
  const deleteReport = async (id) => { try { await client.delete(`/reports/${id}`); setReports(reports.filter((report) => report._id !== id)); toast.success('Report removed.') } catch (error) { toast.error(error.response?.data?.message || 'Could not remove report.') } }

  return <div className="dashboard"><header className="page-header"><div><span className="eyebrow">Workspace overview</span><h1>Reports</h1><p>A clear view of the work in motion.</p></div><div className="header-actions"><button className="icon-button icon-button--light" onClick={loadReports} aria-label="Refresh reports" title="Refresh reports"><FiRefreshCw /></button><Button onClick={() => setShowForm(!showForm)}><FiFilePlus /> New report</Button></div></header>{showForm && <form className="create-panel" onSubmit={createReport}><div><span className="eyebrow">New report</span><h2>What are you working on?</h2></div><Field label="Report title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Q4 launch summary" autoFocus required /><div className="create-panel__actions"><button type="button" className="button button--ghost" onClick={() => setShowForm(false)}>Cancel</button><Button type="submit" loading={isSaving}>Create report</Button></div></form>}<section className="stats"><div className="stat"><span>Total reports</span><strong>{reports.length}</strong><FiFilePlus /></div><div className="stat"><span>Latest activity</span><strong>{reports.length ? 'Today' : '—'}</strong><FiClock /></div><div className="stat stat--accent"><span>Workspace health</span><strong>Good</strong><FiArrowUpRight /></div></section><section className="reports-section"><div className="section-heading"><div><h2>Recent reports</h2><span>{reports.length} {reports.length === 1 ? 'report' : 'reports'} in your workspace</span></div></div>{isLoading ? <Loader label="Loading reports" /> : reports.length === 0 ? <EmptyState onCreate={() => setShowForm(true)} /> : <div className="report-list">{reports.map((report) => <article className="report-row" key={report._id}><span className="report-row__icon"><FiFilePlus /></span><div className="report-row__body"><h3>{report.title}</h3><span>Updated {new Date(report.updatedAt || report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div><span className="status-pill"><i /> Draft</span><button className="icon-button icon-button--danger" onClick={() => deleteReport(report._id)} aria-label={`Delete ${report.title}`} title="Delete report"><FiTrash2 /></button></article>)}</div>}</section></div>
}