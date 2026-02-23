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
        <Link to="/" className="brand-header hover:scale-105 transition-transform">
           <RiLeafLine size={32} className="text-white" />
           <span className="text-2xl font-bold text-white tracking-wide">GreenSight</span>
           <span className="ml-auto text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">BACK TO EXPLORE</span>
        </Link>
        <div className="visual-content">
          <h1>Join the green revolution.</h1>
          <p>Verified urban spaces for the modern professional. Sign up to explore, report, and preserve nature in Lagos.</p>
          
          {/* Mock Profile Preview */}
          <div className="mock-profile-card mt-12 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 max-w-sm">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold">TJ</div>
               <div>
                 <p className="font-bold">Tunde Johnson</p>
                 <p className="text-xs text-white/50">Verified Explorer</p>
               </div>
            </div>
            <div className="space-y-3">
              <div className="h-2 bg-white/20 rounded-full w-full"></div>
              <div className="h-2 bg-white/20 rounded-full w-4/5"></div>
              <div className="flex gap-2 pt-2">
                <div className="w-8 h-8 rounded-lg bg-white/30"></div>
                <div className="w-8 h-8 rounded-lg bg-white/30"></div>
                <div className="w-8 h-8 rounded-lg bg-white/30"></div>
              </div>
            </div>
          </div>
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
            <p>Ready to explore? Join our community of Lagos urban explorers.</p>
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
