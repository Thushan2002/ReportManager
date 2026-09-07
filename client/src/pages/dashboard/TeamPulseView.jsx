import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiAward, FiArrowRight, FiCalendar, FiFileText, FiCheckSquare } from 'react-icons/fi'
import client from '../../api/client.js'
import { Loader } from '../../components/loader/Loader.jsx'
import './Dashboard.scss'

export const TeamPulseView = ({ initialWeekStart }) => {
  const [weekDate, setWeekDate] = useState(
    initialWeekStart ? new Date(initialWeekStart).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  )
  const [section, setSection] = useState('blockers') // 'blockers', 'achievements', 'nextWeekTasks', 'tasks'
  const [pulseData, setPulseData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadPulse = async (date) => {
    setLoading(true)
    try {
      const { data } = await client.get(`/reports/pulse?weekStart=${date}`)
      setPulseData(data)
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPulse(weekDate)
  }, [weekDate])

  const reports = pulseData?.reports || []

  return (
    <div className="team-pulse-wrapper">
      <div className="pulse-header">
        <div className="pulse-tabs">
          <button
            className={`pulse-tab ${section === 'blockers' ? 'pulse-tab--active' : ''}`}
            onClick={() => setSection('blockers')}
          >
            <FiAlertTriangle /> Open Blockers & Issues
          </button>
          <button
            className={`pulse-tab ${section === 'achievements' ? 'pulse-tab--active' : ''}`}
            onClick={() => setSection('achievements')}
          >
            <FiAward /> Highlights & Achievements
          </button>
          <button
            className={`pulse-tab ${section === 'nextWeekTasks' ? 'pulse-tab--active' : ''}`}
            onClick={() => setSection('nextWeekTasks')}
          >
            <FiArrowRight /> Next Week Plans
          </button>
          <button
            className={`pulse-tab ${section === 'tasks' ? 'pulse-tab--active' : ''}`}
            onClick={() => setSection('tasks')}
          >
            <FiCheckSquare /> Tasks Delivered
          </button>
        </div>
        <div className="pulse-week-picker">
          <FiCalendar />
          <input
            type="date"
            className="date-filter"
            value={weekDate}
            onChange={(e) => setWeekDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader label="Loading team pulse" />
      ) : (
        <div className="pulse-card-grid">
          {reports.map((r) => {
            const hasKeyFlag =
              (section === 'blockers' && r.keyBlocker) ||
              (section === 'achievements' && r.keyAchievement)

            let content = null
            if (section === 'blockers') content = r.blockers
            else if (section === 'achievements') content = r.achievements
            else if (section === 'nextWeekTasks') content = r.nextWeekTasks
            else if (section === 'tasks') content = r.tasks

            const isEmpty =
              section === 'tasks'
                ? !content || content.length === 0
                : !content || !content.trim()

            return (
              <div
                className={`pulse-card ${hasKeyFlag ? 'pulse-card--flagged' : ''} ${isEmpty ? 'pulse-card--empty' : ''}`}
                key={r._id}
              >
                <div className="pulse-card__head">
                  <div className="pulse-card__user">
                    <span className="pulse-card__avatar">{r.owner?.name?.charAt(0).toUpperCase()}</span>
                    <div>
                      <strong>{r.owner?.name || 'Unknown Member'}</strong>
                      <small>{r.project}</small>
                    </div>
                  </div>
                  <div className="pulse-card__actions">
                    {hasKeyFlag && (
                      <span className="pulse-key-badge">
                        {section === 'blockers' ? 'Key Blocker' : 'Key Highlight'}
                      </span>
                    )}
                    <Link to={`/reports/${r._id}`} className="pulse-link" title="Open full report">
                      <FiFileText />
                    </Link>
                  </div>
                </div>

                <div className="pulse-card__body">
                  {section === 'tasks' ? (
                    content && content.length > 0 ? (
                      <div className="pulse-tasks-list">
                        {content.map((t, idx) => (
                          <div className="pulse-task-row" key={idx}>
                            <span className="pulse-task-name">{t.name}</span>
                            <span className={`pulse-task-status status-${t.status.toLowerCase().replace(' ', '-')}`}>
                              {t.status} ({t.actualPercent}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="pulse-placeholder">No tasks recorded.</p>
                    )
                  ) : isEmpty ? (
                    <p className="pulse-placeholder">None noted for this week.</p>
                  ) : (
                    <p className="pulse-text">{content}</p>
                  )}
                </div>
              </div>
            )
          })}
          {reports.length === 0 && (
            <div className="empty-inline" style={{ gridColumn: '1 / -1' }}>
              No reports submitted for the week of {new Date(weekDate).toLocaleDateString()}.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
