import React, { useState } from 'react';
<<<<<<< HEAD
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
=======
import { RiCloseLine, RiCheckLine, RiLeafLine, RiShieldCheckLine, RiTimeLine } from 'react-icons/ri';

const SnapshotPanel = ({ park, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!park) return null;

  const address = park.address || 'NO 15, Gbadamosi Layout, Gbagada, Lagos';
  const aiSummary = park.ai_summary || 'A peaceful retreat with great amenities and well-maintained gardens. Perfect for morning jogs.';
  const features = park.key_features || ['Garden', 'Quiet Zone', 'Pet-Friendly'];
  const cleanliness = park.cleanliness || 'Fair';
  const facilities = park.facilities || [
    { name: 'Convenience', available: true },
    { name: 'Convenience Store', available: false },
    { name: 'Chairs', available: true },
    { name: 'Parking Lot', available: true },
  ];
  const gallery = park.gallery || [
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1585829365291-1762f59ed290?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1596438611195-667f7614e7dc?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1588711447273-047b749d01f2?auto=format&fit=crop&q=80&w=200',
  ];

  const conditionColor =
    park.condition?.toLowerCase() === 'bad' ? '#FF000C' :
    park.condition?.toLowerCase() === 'average' ? '#F99D1B' : '#07B60A';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Nunito, sans-serif', color: '#111418' }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 20px 12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: 'Playfair Display, serif' }}>{park.name}</h2>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#667085' }}>{address}</p>
>>>>>>> b7d569a (popup pannel and ai summary)
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111418', padding: 4, marginTop: -4 }}>
          <RiCloseLine size={24} />
        </button>
      </div>

<<<<<<< HEAD
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
            </strong> tracked infrastructures are operational. Best time to visit for a quiet experience is usually early mornings.
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
=======
      {/* ── DIVIDER ── */}
      <div style={{ height: 1, background: '#F2F4F7', margin: '0 20px' }} />

      {!isExpanded ? (
        /* ── STAGE 1: SUMMARY ── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 20px 20px', gap: 16 }}>
          
          {/* Status Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Status Ring */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: `conic-gradient(${conditionColor} 0deg 270deg, #F2F4F7 270deg 360deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${conditionColor}33`, flexShrink: 0,
            }}>
              <div style={{ width: 44, height: 44, background: 'white', borderRadius: '50%' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#667085', fontWeight: 600 }}>Status</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: conditionColor }}>
                {park.status_level || 'Excellent'}
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Key Features</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {features.map((f, i) => (
                <span key={i} style={{
                  background: '#F5FFF5', color: '#07B60A', fontSize: 11,
                  fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                  border: '1px solid #07B60A22'
                }}>{f}</span>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div style={{ background: '#FFFBF2', border: '1px solid #F99D1B22', borderRadius: 14, padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <RiLeafLine size={12} color="#F99D1B" />
              <span style={{ fontSize: 9, fontWeight: 900, color: '#F99D1B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Review Summary</span>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: '#4A5568', lineHeight: 1.6, fontStyle: 'italic' }}>"{aiSummary}"</p>
          </div>

          {/* View Full Snapshot Button */}
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              marginTop: 'auto', background: '#07B60A', color: 'white',
              border: 'none', borderRadius: 12, padding: '13px', fontWeight: 800,
              fontSize: 14, cursor: 'pointer', width: '100%',
            }}
          >
            View Full Snapshot
          </button>
        </div>
      ) : (
        /* ── STAGE 2: FULL SNAPSHOT (hidden scrollbar) ── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.sp-scroll::-webkit-scrollbar { display: none; }`}</style>
          <div className="sp-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 10px' }}>

            {/* Real Time Conditions */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Real Time Conditions</div>
              {[
                { label: 'Crowd Level', color: '#07B60A' },
                { label: `Cleanliness: ${cleanliness}`, color: '#F99D1B' },
                { label: 'Safety Perception', color: '#07B60A' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#344054' }}>{item.label}</span>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `4px solid ${item.color}` }} />
>>>>>>> b7d569a (popup pannel and ai summary)
                </div>
              ))}
              <span style={{ fontSize: 11, color: '#98A2B3', display: 'flex', alignItems: 'center', gap: 4 }}>
                <RiTimeLine size={11} /> 2 mins ago
              </span>
            </div>

            <div style={{ height: 1, background: '#F2F4F7', marginBottom: 16 }} />

            {/* Facility Checklist */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Facility Checklist</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                {facilities.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                      background: item.available ? '#344054' : 'white',
                      border: `2px solid ${item.available ? '#344054' : '#D0D5DD'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {item.available && <RiCheckLine size={11} color="white" />}
                    </div>
                    <span style={{ fontSize: 12, color: '#344054' }}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: '#F2F4F7', marginBottom: 16 }} />

            {/* Gallery */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Gallery</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {gallery.map((img, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#F2F4F7' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div style={{ display: 'flex', gap: 10, padding: '12px 20px', borderTop: '1px solid #F2F4F7', background: 'white' }}>
            <button
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${park.lat},${park.lng}`, '_blank')}
              style={{ flex: 1, background: '#07B60A', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
            >
              Get directions
            </button>
            <button
              style={{ flex: 1, background: '#07B60A', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
            >
              Save to favourites
            </button>
          </div>
        </div>
<<<<<<< HEAD

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
=======
>>>>>>> b7d569a (popup pannel and ai summary)
      )}
    </div>
  );
};

export default SnapshotPanel;