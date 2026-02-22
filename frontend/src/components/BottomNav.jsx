<<<<<<< HEAD
import React from 'react';
<<<<<<< HEAD
import { RiMapPinLine, RiQuestionAnswerLine, RiGroupLine, RiNotification3Line, RiMessage2Line, RiBuilding4Line, RiBookmarkLine } from 'react-icons/ri';
=======
import { RiMapPinLine, RiMessage2Line, RiBuilding4Line, RiNotification3Line } from 'react-icons/ri';
>>>>>>> 5a86afe (review section)
=======
import { RiMapPinLine, RiTreeLine, RiGroupLine, RiChatVoiceLine } from 'react-icons/ri';
import './BottomNav.css';
>>>>>>> 35c36ca (new version)

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'explore', icon: RiMapPinLine, label: 'Explore' },
<<<<<<< HEAD
    { id: 'reviews', icon: RiMessage2Line, label: 'Reviews' },
    { id: 'park', icon: RiBuilding4Line, label: 'Park' },
<<<<<<< HEAD
    { id: 'saved', icon: RiBookmarkLine, label: 'Saved' },
    { id: 'notifications', icon: RiNotification3Line, label: 'Notifications' },
    { id: 'support', icon: RiQuestionAnswerLine, label: 'Support' },
    { id: 'community', icon: RiGroupLine, label: 'Community' },
=======
    { id: 'notifications', icon: RiNotification3Line, label: 'Notifications' },
>>>>>>> 5a86afe (review section)
=======
    { id: 'park', icon: RiTreeLine, label: 'Parks' },
    { id: 'review', icon: RiGroupLine, label: 'Community' },
    { id: 'support', icon: RiChatVoiceLine, label: 'Support' },
>>>>>>> 35c36ca (new version)
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
<<<<<<< HEAD
            <Icon size={24} />
            <span className="text-[12px] font-medium">{tab.label}</span>
            {isActive && <div className="absolute -bottom-1 w-6 h-0.5 bg-primary rounded-full transition-all" />}
=======
            <div className="nav-icon-container">
               <Icon size={24} />
            </div>
            <span className="nav-label">{tab.label}</span>
>>>>>>> 35c36ca (new version)
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
