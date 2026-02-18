import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiLeafFill, RiUserLine, RiLogoutBoxRLine } from 'react-icons/ri';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar glass-morphism">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <RiLeafFill className="logo-icon" />
          <span className="logo-text">Green<span>Sight</span></span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <div className="user-menu">
              <span className="welcome-text">Hi, {user.name || 'Explorer'}</span>
              <button onClick={logout} className="logout-btn" title="Logout">
                <RiLogoutBoxRLine size={20} />
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/signup" className="btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
