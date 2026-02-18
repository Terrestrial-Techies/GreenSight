import React from 'react';
import { RiCloseLine, RiShareLine, RiNavigationFill, RiTimeLine, RiInformationFill } from 'react-icons/ri';
import './SnapshotPanel.css';

const SnapshotPanel = ({ park, onClose }) => {
  if (!park) return null;

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Operational': return { text: 'Operational', class: 'status-green' };
      case 'Maintenance': return { text: 'Under Maintenance', class: 'status-yellow' };
      case 'Closed': return { text: 'Temporarily Closed', class: 'status-red' };
      default: return { text: 'Status Unknown', class: 'status-gray' };
    }
  };

  return (
    <div className="snapshot-panel glass-morphism">
      <div className="snapshot-header">
        <button onClick={onClose} className="close-btn"><RiCloseLine size={24} /></button>
        <div className="header-actions">
          <button className="icon-btn"><RiShareLine /></button>
        </div>
      </div>

      <div className="snapshot-content">
        <div className="title-section">
          <span className={`access-tag ${park.access.toLowerCase()}`}>{park.access} {park.price && `• ${park.price}`}</span>
          <h1>{park.name}</h1>
          <p className="location-text">{park.location}</p>
        </div>

        <div className="ai-summary-box">
          <div className="summary-header">
            <RiInformationFill className="ai-icon" />
            <span>AI Snapshot Summary</span>
          </div>
          <p>
            {park.description} The park is currently <strong>{park.features.filter(f => f.status === 'Operational').length}/{park.features.length}</strong> features operational. 
            Best time to visit for a quiet experience is usually early mornings.
          </p>
        </div>

        <div className="infrastructure-section">
          <div className="section-header">
            <h3>Infrastructure Availability</h3>
            <span className="last-sync"><RiTimeLine /> {park.lastUpdated}</span>
          </div>
          
          <div className="feature-status-list">
            {park.features.map((feature, idx) => {
              const status = getStatusLabel(feature.status);
              return (
                <div key={idx} className="status-row">
                  <span className="feature-name">{feature.name}</span>
                  <div className="status-indicator">
                    <span className={`status-text ${status.class}`}>{status.text}</span>
                    <span className={`status-pill ${status.class}`}></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="action-footer">
          <button className="btn-primary full-width">
            <RiNavigationFill /> Get Directions
          </button>
          <button className="btn-secondary full-width">
            Report Current Condition
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnapshotPanel;
