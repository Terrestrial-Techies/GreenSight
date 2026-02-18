import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiUserLine, RiMailLine, RiLockPasswordLine, RiLeafFill } from 'react-icons/ri';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate signup
    login({ name, email });
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-morphism">
        <Link to="/" className="auth-logo">
          <RiLeafFill className="logo-icon" />
          <span>Green<span>Sight</span></span>
        </Link>
        <h2>Join GreenSight</h2>
        <p className="auth-subtitle">Discover and verify green spaces across Nigeria.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <RiUserLine className="input-icon" />
            <input 
              type="text" 
              placeholder="Full Name (e.g. Tunde)" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <RiMailLine className="input-icon" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <RiLockPasswordLine className="input-icon" />
            <input 
              type="password" 
              placeholder="Create Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary auth-submit">Create Account</button>
        </form>

        <p className="auth-footer">
          Already a member? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
