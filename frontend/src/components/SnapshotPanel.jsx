import React, { useState } from 'react';
import { 
  RiCloseLine, 
  RiShareLine, 
  RiNavigationFill, 
  RiTimeLine, 
  RiInformationFill,
  RiDirectionLine, 
  RiBookmarkLine, 
  RiCheckLine,
  RiHeartLine,
  RiHeartFill,
  RiLeafLine
} from 'react-icons/ri';
import './SnapshotPanel.css';
import ReportModal from './ReportModal';

const SnapshotPanel = ({ park, onClose, onToggleFavorite, isFavorite, isLoading = false }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
    switch (status?.toLowerCase()) {
      case 'good':
      case 'operational': 
        return { text: 'Excellent', class: 'status-green' };
      case 'average':
      case 'maintenance': 
        return { text: 'Average', class: 'status-yellow' };
      case 'bad':
      case 'poor':
      case 'closed': 
        return { text: 'Poor', class: 'status-red' };
      default: 
        return { text: status || 'Unknown', class: 'status-gray' };
    }
  };

  const getConditionColor = (val) => {
    if (val?.toLowerCase() === 'average' || val?.toLowerCase() === 'maintenance') return '#F99D1B';
    if (val?.toLowerCase() === 'bad' || val?.toLowerCase() === 'poor' || val?.toLowerCase() === 'closed') return '#FF000C';
    return '#07B60A'; // good, operational, excellent
  };

  const status = getStatusLabel(park.condition);
  const conditionColor = getConditionColor(park.condition);
  const address = park.address || park.location || 'Lagos, Nigeria';
  const aiSummary = park.ai_summary || park.description || null;
  const features = park.key_features || park.features || [];
  const facilities = park.facilities || [
    { name: 'Seating', available: true },
    { name: 'Walking Paths', available: true },
    { name: 'Children\'s Play Area', available: false },
    { name: 'Security', available: true },
    { name: 'Parking', available: true },
    { name: 'Restrooms', available: true }
  ];
  const gallery = park.gallery || [
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1585829365291-1762f59ed290?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1596438611195-667f7614e7dc?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1588711447273-047b749d01f2?auto=format&fit=crop&q=80&w=200',
  ];

  return (
    <div className="snapshot-panel glass-morphism">
      <div className="snapshot-header">
        <div className="park-info">
          <h2>{park.name}</h2>
          <p className="location-text">{address}</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn" title="Share this space"><RiShareLine size={20} /></button>
          <button onClick={onClose} className="close-btn" aria-label="Close panel">
            <RiCloseLine size={24} />
          </button>
        </div>
      </div>

      {/* Loading Banner */}
      {isLoading && (
        <div className="loading-banner">
          <div className="pulse-dot" />
          <span>🤖 Gemini is enriching park data...</span>
        </div>
      )}

      <div className="snapshot-content">
        {!isExpanded ? (
          /* Compact View */
          <div className="compact-view">
            <div className="title-section">
              <span className={`access-tag ${park.access?.toLowerCase() || 'public'}`}>
                {park.access || 'Public'} {park.price && `• ${park.price}`}
              </span>
            </div>

            {/* Status Ring Section */}
            <div className="status-section">
              <div 
                className="status-ring" 
                style={{ 
                  background: `conic-gradient(${conditionColor} 0deg ${(park.condition === 'good' ? 300 : 270)}deg, #f2f4f7 ${(park.condition === 'good' ? 300 : 270)}deg 360deg)` 
                }}
              >
                <div className="inner-white"></div>
              </div>
              <div className="status-label">
                <div className="label">Status</div>
                <div className="value" style={{ color: conditionColor }}>
                  {status.text}
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="features-section">
              <h3>Key Features</h3>
              <div className="feature-list">
                {(features.length ? features : ['Garden', 'Quiet Zone', 'Walking Trails']).map((feature, i) => (
                  <div key={i} className="feature-item">{typeof feature === 'string' ? feature : feature.name}</div>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div className="ai-summary-box">
              <div className="summary-header">
                <RiLeafLine className="ai-icon" />
                <span>AI Snapshot Summary</span>
              </div>
              <p>
                {aiSummary || `This space is perfect for quiet relaxation, featuring well-maintained paths and plenty of seating. It's currently in excellent condition and ideal for urban escape.`}
              </p>
            </div>

            <button className="view-full-btn" onClick={() => setIsExpanded(true)}>
              View Full Snapshot
            </button>
          </div>
        ) : (
          /* Expanded View */
          <div className="expanded-view">
            <button className="back-btn" onClick={() => setIsExpanded(false)}>← Back</button>
            
            {/* Real Time Conditions */}
            <div className="section-block">
              <h3>Real Time Conditions</h3>
              <div className="condition-row">
                <span>Crowd Level</span>
                <div className="status-indicator-ring" style={{ borderColor: getConditionColor('good') }}></div>
              </div>
              <div className="condition-row">
                <span>Cleanliness: <i>{park.cleanliness || 'Good'}</i></span>
                <div className="status-indicator-ring" style={{ borderColor: getConditionColor(park.cleanliness || 'good') }}></div>
              </div>
              <div className="condition-row">
                <span>Safety Perception</span>
                <div className="status-indicator-ring" style={{ borderColor: getConditionColor('good') }}></div>
              </div>
              <span className="timestamp"><RiTimeLine size={12} /> 2 mins ago</span>
            </div>

            <div className="divider"></div>

            {/* Facility Checklist */}
            <div className="section-block">
              <h3>Facility Checklist</h3>
              <div className="checklist-grid">
                {facilities.map((f, i) => (
                  <div key={i} className="checklist-item">
                    <div className={`checkbox ${f.available ? 'checked' : ''}`}>
                      {f.available ? <RiCheckLine size={14} /> : null}
                    </div>
                    <span>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider"></div>

            {/* Gallery */}
            <div className="section-block">
              <h3>Gallery</h3>
              <div className="gallery-grid">
                {gallery.map((img, i) => (
                  <img key={i} src={img} alt={`park ${i + 1}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="action-footer">
          <button 
            className="btn-get-directions"
            onClick={handleGetDirections}
            disabled={isLocating}
          >
            <RiNavigationFill /> 
            {isLocating ? "Locating..." : "Get Directions"}
          </button>
          
          {onToggleFavorite && (
            <button 
              className={`btn-save-fav ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(park)}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? <RiHeartFill size={24} /> : <RiHeartLine size={24} />}
            </button>
          )}

          <button 
            className="btn-report"
            onClick={() => setShowReportModal(true)}
          >
            Report
          </button>
        </div>
      </div>

      {showReportModal && (
        <ReportModal 
          park={park} 
          onClose={() => setShowReportModal(false)}
          onSubmit={(data) => {
            console.log("New User Report:", data);
            alert(`Report logged: ${park.name} condition updated.`);
          }}
        />
      )}
    </div>
  );
};

export default SnapshotPanel;
