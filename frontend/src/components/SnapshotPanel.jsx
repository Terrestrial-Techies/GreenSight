import React, { useState } from 'react';
import { RiCloseLine, RiShareLine, RiNavigationFill, RiTimeLine, RiInformationFill } from 'react-icons/ri';
import './SnapshotPanel.css';
import ReportModal from './ReportModal';

const SnapshotPanel = ({ park, onClose }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  if (!park) return null;

  const handleGetDirections = () => {
    setIsLocating(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: userLat, longitude: userLng } = position.coords;
          
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${park.lat},${park.lng}&travelmode=driving`;
          
          window.open(directionsUrl, '_blank');
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation Error:", error);
          setIsLocating(false);

          const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${park.lat},${park.lng}`;
          window.open(fallbackUrl, '_blank');
          alert("Unable to find your location. Opening the park's location instead.");
        },
        { enableHighAccuracy: true, timeout: 5000 } 
      );
    } else {
      setIsLocating(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

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
        <button onClick={onClose} className="close-btn" aria-label="Close panel">
          <RiCloseLine size={24} />
        </button>
        <div className="header-actions">
          <button className="icon-btn" title="Share this space"><RiShareLine /></button>
        </div>
      </div>

      <div className="snapshot-content">
        <div className="title-section">
          <span className={`access-tag ${park.access?.toLowerCase() || 'public'}`}>
            {park.access || 'Public'} {park.price && `• ${park.price}`}
          </span>
          <h1>{park.name}</h1>
          <p className="location-text">{park.location}</p>
        </div>

        <div className="ai-summary-box">
          <div className="summary-header">
            <RiInformationFill className="ai-icon" />
            <span>AI Snapshot Summary</span>
          </div>
          <p>
            {park.description} Currently, <strong>
              {(park.features || []).filter(f => f.status === 'Operational').length}/{(park.features || []).length}
            </strong> tracked infrastructures are operational. 
            Early mornings in Lagos are typically the quietest times for this space.
          </p>
        </div>

        <div className="infrastructure-section">
          <div className="section-header">
            <h3>Infrastructure Availability</h3>
            <span className="last-sync"><RiTimeLine /> {park.lastUpdated}</span>
          </div>
          
          <div className="feature-status-list">
            {(park.features || []).map((feature, idx) => {
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
          <button 
            className="btn-primary full-width" 
            onClick={handleGetDirections}
            disabled={isLocating}
          >
            <RiNavigationFill /> 
            {isLocating ? "Locating User..." : "Get Directions"}
          </button>
          
          <button 
            className="btn-secondary full-width"
            onClick={() => setShowReportModal(true)}
          >
            Report Current Condition
          </button>
        </div>
      </div>

      {showReportModal && (
        <ReportModal 
          park={park} 
          onClose={() => setShowReportModal(false)}
          onSubmit={(data) => {
            console.log("New User Report for Lagos Green Space:", data);
            alert(`Report logged: ${park.name} is currently flagged as ${data.safety}.`);
          }}
        />
      )}
    </div>
  );
};

export default SnapshotPanel;