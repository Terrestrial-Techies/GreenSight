import React from 'react';
import { RiMapPinLine, RiQuestionAnswerLine, RiGroupLine, RiNotification3Line, RiMessage2Line, RiBuilding4Line, RiBookmarkLine } from 'react-icons/ri';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'explore', icon: RiMapPinLine, label: 'Explore' },
    { id: 'reviews', icon: RiMessage2Line, label: 'Reviews' },
    { id: 'park', icon: RiBuilding4Line, label: 'Park' },
    { id: 'saved', icon: RiBookmarkLine, label: 'Saved' },
    { id: 'notifications', icon: RiNotification3Line, label: 'Notifications' },
    { id: 'support', icon: RiQuestionAnswerLine, label: 'Support' },
    { id: 'community', icon: RiGroupLine, label: 'Community' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[70px] bg-neutral-50 flex justify-around items-center px-3 border-t border-black/5 z-[100]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id} 
            className={`flex flex-col items-center gap-1 relative flex-1 py-2 active:opacity-70 transition-opacity ${isActive ? 'text-primary' : 'text-neutral-400'}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={24} />
            <span className="text-[12px] font-medium">{tab.label}</span>
            {isActive && <div className="absolute -bottom-1 w-6 h-0.5 bg-primary rounded-full transition-all" />}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;

