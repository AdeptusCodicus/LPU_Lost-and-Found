import React from 'react';
import '../styles/ItemCard.css'; // Import the CSS file for styling

interface ItemCardProps {
  id: number;
  name: string;
  description?: string | null;
  location: string;
  contact: string;
  date_reported: string;
  itemType: 'Lost' | 'Found';
  status: string;
  user_email?: string;
  onMarkClaimed?: (id: number) => void;
  onMarkFound?: (id: number) => void;
  onMarkExpired?: (id: number) => void;
  onDelete?: (id: number, itemType: 'Lost' | 'Found') => void; // For delete action
  isDeleting?: boolean; // To show deleting state on the button
  isArchived?: boolean; // To indicate if the card is in an archive context
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  name,
  description,
  location,
  contact,
  date_reported,
  itemType,
  status,
  user_email,
  onMarkClaimed,
  onMarkFound,
  onMarkExpired,
  onDelete, // Consumed here
  isDeleting = false, // Consumed here
  isArchived = false, // Consumed here
}) => {
  // Determine which buttons to show based on context (archived or not)
  const canBeClaimed = itemType === 'Found' && status === 'available' && onMarkClaimed && !isArchived;
  const canBeMarkedFound = itemType === 'Lost' && status === 'missing' && onMarkFound && !isArchived;
  const canBeExpired = (status === 'available' || status === 'missing') && onMarkExpired && !isArchived;
  const canBeDeleted = onDelete && isArchived; // Delete button only if onDelete is provided and isArchived is true

  const formattedDate = new Date(date_reported).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Internal handler to call the onDelete prop
  const handleDeleteClick = () => {
    if (onDelete && !isDeleting) { // Check if onDelete prop exists and not already deleting
      onDelete(id, itemType); // Call the function passed from Archive.tsx
    }
  };

  return (
    <div className={`item-card item-type-${itemType.toLowerCase()} status-${status.toLowerCase().replace(/\s+/g, '-')} ${isArchived ? 'archived' : ''}`}>
      <div className="item-header">
        <div className="avatar" title={name}>{name.charAt(0).toUpperCase()}</div>
        <div className="item-header-details">
          <div className="item-name" title={name}>{name}</div>
          <div className="item-meta">
            <span className="item-type-label">Type: {itemType}</span>
            <span className="item-status-label">Status: {status}</span>
            <span className="item-date-label">Reported: {formattedDate}</span>
          </div>
        </div>
      </div>
      <div className="item-info">
        <div className="item-location">
          <strong>Location:</strong> <span>{location}</span>
        </div>
        <div className="item-contact">
          <strong>Contact:</strong> <span>{contact}</span>
        </div>
        {itemType === 'Lost' && user_email && (
          <div className="item-user-email">
            <strong>Owner Email:</strong> <span>{user_email}</span>
          </div>
        )}
        {description && (
          <div className="item-description">
            <strong>Description:</strong>
            <p>{description}</p>
          </div>
        )}
      </div>
      
      {/* Action buttons container: only shown if there's at least one action */}
      {(canBeClaimed || canBeMarkedFound || canBeExpired || canBeDeleted) && (
        <div className="item-actions">
          {canBeClaimed && (
            <button onClick={() => onMarkClaimed(id)} className="action-button mark-claimed-button">
              Mark as Claimed
            </button>
          )}
          {canBeMarkedFound && (
            <button onClick={() => onMarkFound(id)} className="action-button mark-found-button">
              Mark as Found
            </button>
          )}
          {canBeExpired && (
            <button onClick={() => onMarkExpired(id)} className="action-button mark-expired-button">
              Mark as Expired
            </button>
          )}
          {/* Delete button integrated into the card */}
          {canBeDeleted && (
            <button
              onClick={handleDeleteClick} // Calls the internal handler
              disabled={isDeleting}
              className="action-button delete-button" // Styled in ItemCard.css
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemCard;