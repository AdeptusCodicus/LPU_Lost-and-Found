import React from 'react';
import '../styles/ReportCard.css';
import '../styles/ItemCard.css'; // We can reuse some styling

interface ReportItem {
  id: number;
  name: string;
  description?: string | null;
  location: string;
  contact: string;
  date_reported: string;
  type: 'Lost' | 'Found' | 'lost' | 'found'; // From backend
  status: 'pending' | 'approved' | 'rejected';
  user_email?: string | null;
  reporterID?: number | null;
}

interface ReportCardProps extends ReportItem {
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  id,
  name,
  description,
  location,
  contact,
  date_reported,
  type,
  status,
  user_email,
  onApprove,
  onReject,
}) => {
  const cardTypeClass = type === 'Lost' || type === 'lost' ? 'item-card-lost' : 'item-card-found';
  const formattedDate = new Date(date_reported).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className={`item-card ${cardTypeClass}`}>
      <div className="item-card-header">
        <h3>{name}</h3>
        <span className={`item-status item-status-${status.toLowerCase()}`}>{status.toUpperCase()}</span>
      </div>
      <p className="item-type">Type: {type === 'lost' ? 'Lost Item Report' : 'Found Item Report'}</p>
      <p><strong>Date Reported:</strong> {formattedDate}</p>
      <p><strong>Location:</strong> {location}</p>
      {description && <p><strong>Description:</strong> {description}</p>}
      <p><strong>Contact Info:</strong> {contact}</p>
      {user_email && <p><strong>Reported by:</strong> {user_email}</p>}
      <div className="item-card-actions">
        {status === 'pending' && onApprove && (
          <button onClick={() => onApprove(id)} className="action-button approve-button">
            Approve
          </button>
        )}
        {status === 'pending' && onReject && (
          <button onClick={() => onReject(id)} className="action-button reject-button">
            Reject
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;