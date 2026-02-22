import { RiMapPinLine, RiTreeLine, RiGroupLine, RiChatVoiceLine, RiUserLine } from 'react-icons/ri';
import './BottomNav.css';

const BottomNav = ({ activeTab, onTabChange, onProfileClick }) => {
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
