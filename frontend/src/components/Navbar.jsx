import { RiMapPinLine, RiTreeLine, RiGroupLine, RiChatVoiceLine, RiUserLine, RiLeafLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ activeTab, onTabChange, onProfileClick, user }) => {
  const navigate = useNavigate();
  const tabs = [
    { id: 'explore', icon: RiMapPinLine, label: 'Explore' },
    { id: 'park', icon: RiTreeLine, label: 'Parks' },
    { id: 'review', icon: RiGroupLine, label: 'Community' },
    { id: 'support', icon: RiChatVoiceLine, label: 'AI Support' },
  ];

  return (
    <nav className="m3-navbar">
      <div className="nav-content">
        <div className="nav-left">
          <div className="brand" onClick={() => onTabChange('explore')}>
            <RiLeafLine className="brand-icon" />
            <span className="brand-name">Green<span>Sight</span></span>
          </div>
        </div>

        <div className="nav-center">
          <div className="m3-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`m3-tab-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="nav-right">
          {user ? (
            <button className="user-profile-btn" onClick={onProfileClick}>
              <RiUserLine size={20} />
              <span>{user.name || user.email?.split('@')[0]}</span>
            </button>
          ) : (
            <button className="user-profile-btn sign-in-highlight" onClick={() => navigate('/login')}>
              <RiUserLine size={20} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
