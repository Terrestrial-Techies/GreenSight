import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiUserLine, RiMailLine, RiLockPasswordLine, RiLeafLine, RiArrowRightLine } from 'react-icons/ri';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { authService } = await import('../services/api');
      const data = await authService.register(email, password, name);
      if (data.user) {
        // Successful signup, redirect to home or auto-login
        // For now, redirect to login with a success state
        navigate('/login', { state: { message: `Welcome ${name}! Your account is ready. Please sign in to continue.` } });
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m3-auth-page">
      <div className="auth-visual-side">
        <div className="brand-header">
           <RiLeafLine size={32} className="text-white" />
           <span className="text-2xl font-bold text-white tracking-wide">GreenSight</span>
        </div>
        <div className="visual-content">
          <h1>Join the green revolution in Lagos.</h1>
          <p>Verified urban spaces for the modern professional. Sign up to explore, report, and preserve nature in the city.</p>
        </div>
        <div className="visual-footer">
          <p>© 2026 GreenSight Africa</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="form-container animate-fade-in">
          <div className="mobile-only-logo">
             <RiLeafLine size={40} className="text-primary" />
          </div>
          
          <div className="form-header">
            <h2>Create Account</h2>
            <p>Ready to explore? Join Tunde and 500+ others.</p>
          </div>

          {error && <div className="m3-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="m3-form">
            <div className="m3-input-field">
              <label>Full Name</label>
              <div className="input-wrapper">
                <RiUserLine className="icon" />
                <input 
                  type="text" 
                  placeholder="e.g. Tunde Johnson" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="m3-input-field">
              <label>Work Email</label>
              <div className="input-wrapper">
                <RiMailLine className="icon" />
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="m3-input-field">
              <label>Password</label>
              <div className="input-wrapper">
                <RiLockPasswordLine className="icon" />
                <input 
                  type="password" 
                  placeholder="Min. 8 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-4 mt-4 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? "Joining..." : "Get Started"}
              {!loading && <RiArrowRightLine size={18} />}
            </button>
          </form>

          <div className="form-footer">
            <p>Already have an account? <Link to="/login" className="text-primary font-bold">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
