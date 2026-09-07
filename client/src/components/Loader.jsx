export const Loader = ({ label = 'Loading', fullScreen = false }) => (
  <div className={`loader-wrap${fullScreen ? ' loader-wrap--screen' : ''}`} role="status">
    <span className="loader" />
    <span>{label}</span>
  </div>
)