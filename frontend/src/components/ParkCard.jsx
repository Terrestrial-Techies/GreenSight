import React from 'react';
import { RiMapPinLine, RiTimeLine, RiInformationLine, RiNavigationFill } from 'react-icons/ri';
import './ParkCard.css';

const ParkCard = ({ park, isSelected, onClick }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Operational': return 'status-green';
      case 'Maintenance': return 'status-yellow';
      case 'Closed': return 'status-red';
      default: return 'status-gray';
    }
  };

  return (
    <div className={`park-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="park-header">
        <h3>{park.name}</h3>
        <span className={`access-badge ${park.access.toLowerCase()}`}>{park.access} {park.price && `• ${park.price}`}</span>
      </div>
      
      <div className="park-info">
        <p className="park-location">
          <RiMapPinLine size={16} /> {park.location}
        </p>
        <div className="park-meta">
          <span className="last-updated">
            <RiTimeLine size={14} /> {park.lastUpdated}
          </span>
        </div>
      </div>

      <div className="features-snapshot">
        {park.features.slice(0, 3).map((feature, idx) => (
          <div key={idx} className="feature-item">
            <span className="feature-name">{feature.name}</span>
            <span className={`status-dot ${getStatusClass(feature.status)}`}></span>
          </div>
        ))}
      </div>

      {isSelected && (
        <div className="park-actions">
          <button className="btn-primary mini">
            <RiNavigationFill /> Directions
          </button>
          <button className="btn-secondary mini">
            <RiInformationLine /> Details
          </button>
        </div>
      )}
      {isSelected && (
        <button className="btn-report">
          Report Current Conditions
        </button>
      )}
    </div>
  );
};

export default ParkCard;
