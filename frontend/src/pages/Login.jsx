import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiLeafFill } from 'react-icons/ri';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { authService } = await import('../services/api');
      const data = await authService.login(email, password);

      // Normalize Supabase response shape (backend returns `session: data` where
      // `data` may contain `{ user, session }`). Safely extract user email and token.
      const sessionWrapper = data.session || {};
      const userObj = sessionWrapper.user || sessionWrapper.session?.user;
      const token = sessionWrapper.session?.access_token || sessionWrapper.access_token || null;

      if (!userObj) throw new Error('Missing user information in login response');

      login({
        email: userObj.email,
        token,
      });
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
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
        
        {error && <div className="auth-error-message">{error}</div>}
        
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

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Join Lagos Explorers</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
