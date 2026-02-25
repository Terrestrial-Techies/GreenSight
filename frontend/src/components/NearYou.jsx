import React from 'react';
import './NearYou.css';

const NearYou = ({ parks, onParkClick, desktopLayout }) => {
  return (
    <div className={`near-you ${desktopLayout ? 'desktop-layout' : ''}`}>
      {!desktopLayout && <h2 className="section-title">Near You</h2>}
      <div className={desktopLayout ? "vertical-stack" : "horizontal-scroll"}>
        {parks.map((park) => (
          <div 
            key={park.id} 
            className="park-preview-card"
            onClick={() => onParkClick(park)}
          >
            <img 
              src={park.image || `https://images.unsplash.com/photo-1585829365291-1762f59ed290?auto=format&fit=crop&q=80&w=200`} 
              alt={park.name} 
              className="park-preview-image"
            />
            <div className="park-preview-overlay">
              <span className="park-preview-name">{park.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearYou;
