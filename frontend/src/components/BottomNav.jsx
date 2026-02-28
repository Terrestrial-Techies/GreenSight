import React from 'react';
import { 
  RiMapPinLine, 
  RiTreeLine, 
  RiGroupLine, 
  RiChatVoiceLine, 
  RiUserLine,
  RiMessage2Line,
  RiBuilding4Line,
  RiNotification3Line,
  RiBookmarkLine,
  RiQuestionAnswerLine
} from 'react-icons/ri';
import './BottomNav.css';

const BottomNav = ({ activeTab, onTabChange, onProfileClick }) => {
  const tabs = [
    { id: 'explore', icon: RiMapPinLine, label: 'Explore' },
    { id: 'parks', icon: RiTreeLine, label: 'Parks' },
    { id: 'community', icon: RiGroupLine, label: 'Community' },
    { id: 'support', icon: RiChatVoiceLine, label: 'Support' },
    { id: 'reviews', icon: RiMessage2Line, label: 'Reviews' },
    { id: 'park', icon: RiBuilding4Line, label: 'Park' },
    { id: 'saved', icon: RiBookmarkLine, label: 'Saved' },
    { id: 'notifications', icon: RiNotification3Line, label: 'Notifications' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button 
            key={tab.id} 
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="nav-icon-container">
              <Icon size={24} />
            </div>
            <span className="nav-label">{tab.label}</span>
            {isActive && <div className="absolute -bottom-1 w-6 h-0.5 bg-primary rounded-full transition-all" />}
          </button>
        );
      })}
      
      <button 
        className="nav-item"
        onClick={onProfileClick}
      >
        <div className="nav-icon-container">
          <RiUserLine size={24} />
        </div>
        <span className="nav-label">Profile</span>
      </button>
    </nav>
  );
};

export default BottomNav;
