import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiLeafFill } from 'react-icons/ri';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login for now
    login({ name: 'Tunde', email });
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-morphism">
        <Link to="/" className="auth-logo">
          <RiLeafFill className="logo-icon" />
          <span>Green<span>Sight</span></span>
        </Link>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Choose your next green escape in Lagos.</p>
        
        <form onSubmit={handleSubmit}>
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
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>

          <button type="submit" className="btn-primary auth-submit">Login</button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Join Lagos Explorers</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
