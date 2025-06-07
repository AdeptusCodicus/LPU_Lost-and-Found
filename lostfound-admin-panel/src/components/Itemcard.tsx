import React from 'react';
import '../styles/ItemCard.css'; // Import the CSS file for styling

interface ItemCardProps {
  name: string;
  date: string;
  location: string;
  description: string;
  Type: 'Lost' | 'Found'; // Type can be either "Lost" or "Found"
}

const ItemCard: React.FC<ItemCardProps> = ({ name, date, location, description, Type }) => (
  <div className={`item-card ${Type.toLowerCase()}`}>
    <div className="item-header">
      <div className="avatar">{name.charAt(0)}</div>
      <div className="item-header-details">
        <div className="item-name">{name}</div>
        <div className="item-meta">
          <span className="item-type">Type: {Type}</span>
          <span className="item-date">{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
    <div className="item-info">
      <div className="item-location">
        <strong>Location:</strong> <span>{location}</span>
      </div>
      <div className="item-description">
        <p>{description}</p>
      </div>
    </div>
  </div>
);

export default ItemCard;