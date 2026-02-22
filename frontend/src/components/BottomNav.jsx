import { RiMapPinLine, RiTreeLine, RiGroupLine, RiChatVoiceLine } from 'react-icons/ri';
import './BottomNav.css';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'explore', icon: RiMapPinLine, label: 'Explore' },
    { id: 'park', icon: RiTreeLine, label: 'Parks' },
    { id: 'review', icon: RiGroupLine, label: 'Community' },
    { id: 'support', icon: RiChatVoiceLine, label: 'Support' },
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
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
