import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiSave, FiSend, FiTrash2, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import client from '../../api/client.js'
import { Button } from '../../components/button/Button.jsx'
import { Field } from '../../components/field/Field.jsx'
import { Loader } from '../../components/loader/Loader.jsx'
import './Reports.scss'

const getWeekMonday = (d = new Date()) => {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

const emptyTask = () => ({
  name: '',
  priority: 'Medium',
  plannedPercent: 0,
  actualPercent: 0,
  status: 'Not started',
  plannedHours: 0,
  spentHours: 0,
  deliverable: ''
})

const blankReport = () => {
  const mon = getWeekMonday()
  const sun = new Date(mon)
  sun.setDate(sun.getDate() + 6)
  return {
    weekStart: mon.toISOString().slice(0, 10),
    weekEnd: sun.toISOString().slice(0, 10),
    project: '',
    tasks: [emptyTask()],
    nextWeekTasks: '',
    blockers: '',
    keyBlocker: false,
    achievements: '',
    keyAchievement: false,
    hours: {
      development: 0,
      testing: 0,
      meetings: 0,
      documentation: 0,
      other: 0
    },
    notes: ''
  }
}

export const ReportEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(blankReport)
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('Draft')
  const [reviewComment, setReviewComment] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    client
      .get('/projects')
      .then(({ data }) => setProjects(data))
      .catch(() => {})

    if (!id) return

    client
      .get(`/reports/${id}`)
      .then(({ data }) => {
        setReport({
          ...blankReport(),
          ...data,
          weekStart: data.weekStart ? data.weekStart.slice(0, 10) : '',
          weekEnd: data.weekEnd ? data.weekEnd.slice(0, 10) : ''
        })
        setStatus(data.status)
        setReviewComment(data.reviewComment || '')
      })
      .catch((error) =>
        toast.error(error.response?.data?.message || 'Could not load report.')
      )
      .finally(() => setLoading(false))
  }, [id])

  const setPresetWeek = (offsetWeeks = 0) => {
    const target = new Date()
    target.setDate(target.getDate() + offsetWeeks * 7)
    const mon = getWeekMonday(target)
    const sun = new Date(mon)
    sun.setDate(sun.getDate() + 6)
    setReport((prev) => ({
      ...prev,
      weekStart: mon.toISOString().slice(0, 10),
      weekEnd: sun.toISOString().slice(0, 10)
    }))
  }

  const update = (key, value) =>
    setReport((current) => ({ ...current, [key]: value }))

  const updateTask = (index, key, value) => {
    update(
      'tasks',
      report.tasks.map((task, taskIndex) =>
        taskIndex === index
          ? {
              ...task,
              [key]: ['plannedPercent', 'actualPercent', 'plannedHours', 'spentHours'].includes(key)
                ? Number(value) || 0
                : value
            }
          : task
      )
    )
  }

  const save = async (submit = false) => {
    if (!report.project) {
      toast.error('Please select a project or category tag.')
      return
    }
    if (!report.tasks || report.tasks.length === 0 || !report.tasks[0].name.trim()) {
      toast.error('Please add at least one task with a name.')
      return
    }

    setSaving(true)
    try {
      let reportId = id
      if (id) {
        await client.patch(`/reports/${id}`, report)
      } else {
        const { data } = await client.post('/reports', report)
        reportId = data._id
      }

      if (submit) {
        await client.post(`/reports/${reportId}/submit`)
        toast.success('Report submitted for manager review.')
      } else {
        toast.success('Draft saved successfully.')
      }

      navigate('/reports/history')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save report.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader fullScreen label="Loading report" />

  const editable = status === 'Draft' || status === 'Needs Correction'

  // Summary computations
  const totalPlannedHours = report.tasks?.reduce((sum, t) => sum + (Number(t.plannedHours) || 0), 0) || 0
  const totalSpentHours = report.tasks?.reduce((sum, t) => sum + (Number(t.spentHours) || 0), 0) || 0
  const avgCompletion =
    report.tasks?.length > 0
      ? Math.round(
          report.tasks.reduce((sum, t) => sum + (Number(t.actualPercent) || 0), 0) / report.tasks.length
        )
      : 0

  return (
    <div className="workspace-page report-editor">
      <header className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
          <span className="eyebrow">Fixed Weekly Structure / {status}</span>
          <h1>{id ? 'Edit Weekly Report' : 'Create Weekly Report'}</h1>
          <p>Every report follows the identical, standardized team format for clear visibility.</p>
        </div>
        <span
          className={`status-badge status-badge--${status.toLowerCase().replaceAll(' ', '-')}`}
        >
          {status}
        </span>
      </header>

      {/* Manager Feedback Note */}
      {status === 'Needs Correction' && (
        <div className="review-note">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9b650d', marginBottom: '6px' }}>
            <FiAlertCircle /> <strong>Manager Feedback Requiring Correction:</strong>
          </div>
          <p>{reviewComment}</p>
        </div>
      )}

      {/* 01 Context: Week and Project */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / Context & Window</span>
            <h2>Reporting Period & Project Tag</h2>
          </div>
          {editable && (
            <div className="week-presets">
              <button type="button" className="preset-chip" onClick={() => setPresetWeek(-1)}>
                Prev Week
              </button>
              <button type="button" className="preset-chip preset-chip--active" onClick={() => setPresetWeek(0)}>
                This Week
              </button>
              <button type="button" className="preset-chip" onClick={() => setPresetWeek(1)}>
                Next Week
              </button>
            </div>
          )}
        </div>

        <div className="form-grid form-grid--three">
          <Field
            label="Week Starts (Monday)"
            type="date"
            value={report.weekStart}
            disabled={!editable}
            onChange={(event) => update('weekStart', event.target.value)}
            required
          />
          <Field
            label="Week Ends (Sunday)"
            type="date"
            value={report.weekEnd}
            disabled={!editable}
            onChange={(event) => update('weekEnd', event.target.value)}
            required
          />
          <label className="field">
            <span>Project / Category Tag <strong style={{ color: 'var(--color-error)' }}>*</strong></span>
            <select
              className="field__input"
              value={report.project}
              disabled={!editable}
              onChange={(event) => update('project', event.target.value)}
              required
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project._id} value={project.name}>
                  {project.name}
                </option>
              ))}
              {projects.length === 0 && (
                <option value="General Operations">General Operations</option>
              )}
            </select>
          </label>
        </div>
      </section>

      {/* 02 Tasks Completed Table */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / Tasks Completed</span>
            <h2>Task-Level Breakdown Table</h2>
          </div>
          {editable && (
            <button
              type="button"
              className="text-button"
              onClick={() => update('tasks', [...report.tasks, emptyTask()])}
            >
              <FiPlus /> Add Task Row
            </button>
          )}
        </div>

        <div className="task-table">
          <div className="task-table__head">
            <span>Task Name</span>
            <span>Priority</span>
            <span>Plan %</span>
            <span>Actual %</span>
            <span>Status</span>
            <span>Plan hrs</span>
            <span>Spent hrs</span>
            <span>Deliverable / Output</span>
            <span />
          </div>
          {report.tasks.map((task, index) => (
            <div className="task-table__row" key={index}>
              <input
                disabled={!editable}
                value={task.name}
                placeholder="e.g. Implement auth controller"
                onChange={(event) => updateTask(index, 'name', event.target.value)}
                required
              />
              <select
                disabled={!editable}
                value={task.priority}
                onChange={(event) => updateTask(index, 'priority', event.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <input
                disabled={!editable}
                type="number"
                min="0"
                max="100"
                value={task.plannedPercent}
                onChange={(event) => updateTask(index, 'plannedPercent', event.target.value)}
              />
              <input
                disabled={!editable}
                type="number"
                min="0"
                max="100"
                value={task.actualPercent}
                onChange={(event) => updateTask(index, 'actualPercent', event.target.value)}
              />
              <select
                disabled={!editable}
                value={task.status}
                onChange={(event) => updateTask(index, 'status', event.target.value)}
              >
                <option value="Not started">Not started</option>
                <option value="In progress">In progress</option>
                <option value="Complete">Complete</option>
                <option value="Blocked">Blocked</option>
              </select>
              <input
                disabled={!editable}
                type="number"
                min="0"
                step="0.5"
                value={task.plannedHours}
                onChange={(event) => updateTask(index, 'plannedHours', event.target.value)}
              />
              <input
                disabled={!editable}
                type="number"
                min="0"
                step="0.5"
                value={task.spentHours}
                onChange={(event) => updateTask(index, 'spentHours', event.target.value)}
              />
              <input
                disabled={!editable}
                value={task.deliverable}
                placeholder="URL or PR link or deliverable"
                onChange={(event) => updateTask(index, 'deliverable', event.target.value)}
              />
              {editable && (
                <button
                  type="button"
                  className="icon-button icon-button--light"
                  onClick={() =>
                    update(
                      'tasks',
                      report.tasks.filter((_, taskIndex) => taskIndex !== index)
                    )
                  }
                  title="Remove row"
                  disabled={report.tasks.length <= 1}
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Task Totals Summary Bar */}
        <div className="task-summary-bar">
          <div className="summary-item">
            <span>Planned Hours:</span>
            <strong>{totalPlannedHours}h</strong>
          </div>
          <div className="summary-item">
            <span>Spent Hours:</span>
            <strong>{totalSpentHours}h</strong>
          </div>
          <div className="summary-item">
            <span>Avg Completion:</span>
            <strong style={{ color: 'var(--color-green)' }}>{avgCompletion}%</strong>
          </div>
        </div>
      </section>

      {/* 03 Planned for Next Week & Challenges & Highlights */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / Signal & Planning</span>
            <h2>Next Week, Blockers & Highlights</h2>
          </div>
        </div>

        <div className="form-grid form-grid--two">
          <label className="field">
            <span>Tasks planned for next week</span>
            <textarea
              className="field__input field__textarea"
              disabled={!editable}
              placeholder="What are the key goals and deliverables for next week?"
              value={report.nextWeekTasks}
              onChange={(event) => update('nextWeekTasks', event.target.value)}
            />
          </label>

          <label className="field">
            <span>Optional notes or links</span>
            <textarea
              className="field__input field__textarea"
              disabled={!editable}
              placeholder="Any helpful documentation, references, or general context..."
              value={report.notes}
              onChange={(event) => update('notes', event.target.value)}
            />
          </label>

          <div>
            <label className="field">
              <span>Blockers / challenges</span>
              <textarea
                className="field__input field__textarea"
                disabled={!editable}
                placeholder="Any dependencies, roadblocks, or risks encountered..."
                value={report.blockers}
                onChange={(event) => update('blockers', event.target.value)}
              />
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                disabled={!editable}
                checked={report.keyBlocker}
                onChange={(event) => update('keyBlocker', event.target.checked)}
              />
              <span>⚠️ Flag as the <strong>Key Issue</strong> for this week</span>
            </label>
          </div>

          <div>
            <label className="field">
              <span>Achievements / highlights</span>
              <textarea
                className="field__input field__textarea"
                disabled={!editable}
                placeholder="Key wins, completed milestones, or notable contributions..."
                value={report.achievements}
                onChange={(event) => update('achievements', event.target.value)}
              />
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                disabled={!editable}
                checked={report.keyAchievement}
                onChange={(event) => update('keyAchievement', event.target.checked)}
              />
              <span>🌟 Flag as the <strong>Key Achievement</strong> for this week</span>
            </label>
          </div>
        </div>
      </section>

      {/* 04 Hours Worked by Task Type (Optional breakdown) */}
      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">04 / Time Breakdown (Hours)</span>
            <h2>Hours Worked by Task Category</h2>
          </div>
        </div>
        <div className="form-grid form-grid--five">
          {Object.keys(report.hours).map((key) => (
            <Field
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              type="number"
              min="0"
              step="0.5"
              value={report.hours[key]}
              disabled={!editable}
              onChange={(event) =>
                update('hours', {
                  ...report.hours,
                  [key]: Number(event.target.value) || 0
                })
              }
            />
          ))}
        </div>
      </section>

      {/* Editor Action Buttons */}
      {editable && (
        <div className="editor-actions">
          <Button
            type="button"
            className="button--secondary"
            onClick={() => save(false)}
            loading={saving}
          >
            <FiSave /> Save as Draft
          </Button>
          <Button type="button" onClick={() => save(true)} loading={saving}>
            <FiSend /> Save and Submit for Review
          </Button>
        </div>
      )}
    </div>
  )
}
