import { FiFileText } from "react-icons/fi";
import "./EmptyState.scss";

export const EmptyState = ({ onCreate }) => (
  <div className="empty-state">
    <span className="empty-state__icon">
      <FiFileText />
    </span>
    <h3>Your report library is quiet</h3>
    <p>
      Create your first report and give your team one clear place to work from.
    </p>
    <button className="empty-state__button" onClick={onCreate}>
      Create a report
    </button>
  </div>
);
