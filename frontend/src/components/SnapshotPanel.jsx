import React, { useState } from 'react';
import { RiCloseLine, RiDirectionLine, RiBookmarkLine, RiInformationLine, RiCheckLine, RiHeartLine, RiHeartFill } from 'react-icons/ri';
import './SnapshotPanel.css';
import ReportModal from './ReportModal';

const SnapshotPanel = ({ park, onClose, onToggleFavorite, isFavorite }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!park) return null;

  const getConditionColor = (val) => {
    if (val?.toLowerCase() === 'fair' || val?.toLowerCase() === 'average') return 'orange';
    if (val?.toLowerCase() === 'bad' || val?.toLowerCase() === 'poor') return 'red';
    return '#07B60A';
  };

  const operationalCount = (park.features || []).filter(f => f.status === 'Operational').length;
  const totalFeatures = (park.features || []).length;

  return (
    <div className={`snapshot-panel ${isExpanded ? 'expanded' : 'compact'}`}>
      {/* Header */}
      <div className="snapshot-header">
        <div className="park-info">
          <h2>{park.name}</h2>
          <p>{park.address || park.location || 'NO 15, Gbadamosi Layout, Gbagada, Lagos'}</p>
        </div>
        <button onClick={onClose} className="close-btn">
          <RiCloseLine size={24} />
        </button>
      </div>

      <div className="snapshot-scroll-container content-scroll">
        {/* Status Ring Section */}
        <div className="status-section">
          <div className="status-ring" style={{ background: `conic-gradient(${getConditionColor(park.condition)} 0deg 280deg, #f2f4f7 280deg 360deg)` }}>
            <div className="inner-white"></div>
          </div>
          <div className="status-label">
            <div className="label">Status</div>
            <div className="value" style={{ color: getConditionColor(park.condition) }}>
              {park.condition?.toLowerCase() === 'good' ? 'Excellent' : (park.condition || 'Excellent')}
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="features-section">
          <h3>Key Features</h3>
          <div className="feature-list">
            {(park.key_features || ['Garden', 'Quiet Zone', 'Pet-Friendly']).map((feature, i) => (
              <div key={i} className="feature-item">{feature}</div>
            ))}
          </div>
        </div>

        {!isExpanded ? (
          <div className="compact-footer-action">
            <button className="view-full-btn" onClick={() => setIsExpanded(true)}>
              View Full Snapshot
            </button>
          </div>
        ) : (
          <div className="expanded-content animate-fade-in">
             {/* AI Snapshot Summary */}
            <div className="section-block ai-summary-section">
              <h3>AI Snapshot Summary</h3>
              <div className="ai-bubble">
                <p>{park.ai_summary || "This space is perfect for quiet relaxation, featuring well-maintained paths and plenty of seating. It's currently in excellent condition and ideal for urban escape."}</p>
              </div>
            </div>

             <div className="divider"></div>
            
            {/* Real Time Conditions */}
            <div className="section-block">
              <h3>Real Time Conditions</h3>
              <div className="condition-row">
                <span>Crowd Level</span>
                <div className="status-indicator-ring" style={{ borderColor: getConditionColor(park.crowd_level) }}></div>
              </div>
              <div className="condition-row">
                <span>Cleanliness: <i>{park.cleanliness || 'Fair'}</i></span>
                <div className="status-indicator-ring" style={{ borderColor: getConditionColor(park.cleanliness) }}></div>
              </div>
              <div className="condition-row">
                <span>Safety Perception</span>
                <div className="status-indicator-ring" style={{ borderColor: getConditionColor(park.safety_perception) }}></div>
              </div>
              <span className="timestamp">Timestamp <span className="time-val">2 mins ago</span></span>
            </div>

            <div className="divider"></div>

            {/* Facility Checklist */}
            <div className="section-block">
              <h3>Facility Checklist</h3>
              <div className="checklist-grid">
                {(park.facilities || [
                  { name: 'Seating', available: true },
                  { name: 'Walking Paths', available: true },
                  { name: 'Children\'s Play Area', available: false },
                  { name: 'Security', available: true }
                ]).map((f, i) => (
                  <div key={i} className="checklist-item">
                    <div className={`checkbox ${f.available ? 'checked' : ''}`}>
                      {f.available ? <RiCheckLine size={14} /> : null}
                    </div>
                    <span>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div className="section-block">
              <h3>Gallery</h3>
              <div className="gallery-grid">
                {(park.gallery || [
                  "https://images.unsplash.com/photo-1585829365291-1762f59ed290?auto=format&fit=crop&q=80&w=200",
                  "https://images.unsplash.com/photo-1596438459194-f275f413d6ff?auto=format&fit=crop&q=80&w=200",
                  "https://images.unsplash.com/photo-1567080597717-adc73369d19a?auto=format&fit=crop&q=80&w=200",
                  "https://images.unsplash.com/photo-1588880331179-bc9b93a8ec5e?auto=format&fit=crop&q=80&w=200"
                ]).map((img, i) => (
                  <img key={i} src={img} alt={`park ${i + 1}`} />
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="expanded-footer">
              <button className="btn-get-directions flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <RiDirectionLine size={20} />
                Get Directions
              </button>
              <button 
                className={`btn-save-fav p-3 rounded-xl border transition-all ${isFavorite ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white border-neutral-200 text-neutral-400 hover:text-primary hover:border-primary/20'}`}
                onClick={() => onToggleFavorite(park)}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? <RiHeartFill size={24} /> : <RiHeartLine size={24} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {showReportModal && (
        <ReportModal 
          park={park} 
          onClose={() => setShowReportModal(false)}
          onSubmit={(data) => {
            console.log("New User Report for Lagos Green Space:", data);
            alert(`Report logged: ${park.name} is currently flagged as ${data.safety}.`);
            setShowReportModal(false);
          }}
        />
      )}
    </div>
  );
};

export default SnapshotPanel;