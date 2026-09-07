import './Charts.scss'

export const TrendLineChart = ({ data = [], height = 180 }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No trend data available</div>
  }

  const maxTasks = Math.max(...data.map(d => Math.max(d.totalTasks || 0, d.completedTasks || 0, 5)), 10)
  const padding = 35
  const width = 500
  const chartHeight = height - 40
  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1)

  const getX = (index) => padding + index * stepX
  const getY = (val) => chartHeight - (val / maxTasks) * (chartHeight - 30) + 15

  const totalPoints = data.map((d, i) => `${getX(i)},${getY(d.totalTasks || 0)}`).join(' ')
  const completedPoints = data.map((d, i) => `${getX(i)},${getY(d.completedTasks || 0)}`).join(' ')

  return (
    <div className="chart-container">
      <div className="chart-legend">
        <span className="legend-item"><i className="legend-dot legend-dot--total" /> Total Planned Tasks</span>
        <span className="legend-item"><i className="legend-dot legend-dot--completed" /> Completed Tasks</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = chartHeight - ratio * (chartHeight - 30) + 15
          return (
            <g key={i} className="chart-grid-line">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
              <text x={padding - 8} y={y + 4} textAnchor="end" className="chart-axis-text">
                {Math.round(ratio * maxTasks)}
              </text>
            </g>
          )
        })}

        {/* Total line */}
        <polyline fill="none" stroke="#ef9b52" strokeWidth="2.5" points={totalPoints} />
        {data.map((d, i) => (
          <circle key={`t-${i}`} cx={getX(i)} cy={getY(d.totalTasks || 0)} r="4" fill="#ef9b52" />
        ))}

        {/* Completed line */}
        <polyline fill="none" stroke="#1b6b52" strokeWidth="3" points={completedPoints} />
        {data.map((d, i) => (
          <circle key={`c-${i}`} cx={getX(i)} cy={getY(d.completedTasks || 0)} r="4.5" fill="#1b6b52" stroke="#fff" strokeWidth="1.5" />
        ))}

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text key={`l-${i}`} x={getX(i)} y={height - 8} textAnchor="middle" className="chart-axis-text">
            {d.weekLabel}
          </text>
        ))}
      </svg>
    </div>
  )
}

export const HorizontalBarChart = ({ data = {}, color = '#1b6b52', unit = '' }) => {
  const entries = Object.entries(data)
  if (entries.length === 0) return <div className="chart-empty">No distribution data</div>

  const maxVal = Math.max(...entries.map(([, v]) => Number(v) || 0), 1)

  return (
    <div className="horizontal-bar-chart">
      {entries.map(([label, val]) => {
        const num = Number(val) || 0
        const pct = Math.max(4, Math.round((num / maxVal) * 100))
        return (
          <div className="hbar-row" key={label}>
            <div className="hbar-label" title={label}>{label}</div>
            <div className="hbar-track">
              <div
                className="hbar-fill"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <div className="hbar-value">{num}{unit ? ` ${unit}` : ''}</div>
          </div>
        )
      })}
    </div>
  )
}

export const DonutTimeChart = ({ hours = {} }) => {
  const colors = {
    development: '#1b6b52',
    testing: '#2a9d8f',
    meetings: '#ef9b52',
    documentation: '#e76f51',
    other: '#8fc4a4'
  }

  const entries = Object.entries(hours).filter(([, val]) => Number(val) > 0)
  const totalHours = entries.reduce((sum, [, val]) => sum + (Number(val) || 0), 0)

  if (totalHours === 0) {
    return <div className="chart-empty">No hours logged for this period</div>
  }

  return (
    <div className="donut-chart-wrapper">
      <div className="donut-chart-legend">
        {entries.map(([key, val]) => {
          const num = Number(val) || 0
          const pct = Math.round((num / totalHours) * 100)
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1)
          return (
            <div className="donut-legend-row" key={key}>
              <span className="donut-dot" style={{ backgroundColor: colors[key] || '#7b817b' }} />
              <span className="donut-name">{formattedKey}</span>
              <span className="donut-hours">{num}h ({pct}%)</span>
            </div>
          )
        })}
      </div>
      <div className="donut-total-badge">
        <strong>{totalHours}</strong>
        <span>Total Hours</span>
      </div>
    </div>
  )
}

export const ComplianceStatusBar = ({ members = [] }) => {
  if (members.length === 0) return <div className="chart-empty">No team members found</div>

  const statusColors = {
    'Approved': '#1b6b52',
    'Submitted': '#ef9b52',
    'Needs Correction': '#bd6257',
    'Draft': '#9ca3af',
    'Not started': '#d1d5db'
  }

  return (
    <div className="compliance-member-list">
      {members.map(m => (
        <div className="member-compliance-row" key={m.userId || m.name}>
          <div className="member-info">
            <span className="member-avatar">{m.name?.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{m.name}</strong>
              <small>{m.email}</small>
            </div>
          </div>
          <span
            className="member-status-pill"
            style={{
              backgroundColor: `${statusColors[m.status] || '#9ca3af'}20`,
              color: statusColors[m.status] || '#4b5563',
              borderColor: statusColors[m.status] || '#9ca3af'
            }}
          >
            {m.status}
          </span>
        </div>
      ))}
    </div>
  )
}
