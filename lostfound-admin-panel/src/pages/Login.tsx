import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import '../styles/Login.css';
import illustration from '../images/Illustration.png';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  // const [loading, setLoading] = useState(false); // Loading state will be from context
  // const [errorMessage, setErrorMessage] = useState(''); // Error message will be from context

  const { login, authError, isLoading, clearAuthError } = useAuth(); // Use context
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/Home";

  // Load email from local storage if "Remember me" was previously checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    // Clear any previous auth errors when the component mounts or email/password changes
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);


  useEffect(() => {
    document.title = 'Login | LPU Lost & Found Admin';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError(); // Clear previous errors

    const success = await login(email, password); // Call login from context

    if (success) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate(from, { replace: true }); // Navigate to intended page or Home
    }
    // Error handling is managed by displaying authError from context
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-illustration">
            <img src={illustration} alt="Illustration" className="illustration-image" />
          </div>
        </div>

        <div className="login-right">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>
              Welcome to <span>LPU Lost & Found</span>
            </h2>
            <p className="note">* indicates a required field</p>

            {authError && (
              <Alert
                icon={<ErrorOutlineIcon fontSize="inherit" />}
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => clearAuthError()} // Allow dismissing error
              >
                {authError}
              </Alert>
            )}

            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <div className="input-icon">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2099/2099199.png"
                  alt="Email Icon"
                  className="icon"
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password*</label>
              <div className="input-icon">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/807/807292.png"
                  alt="Password Icon"
                  className="icon"
                />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  disabled={isLoading}
                />{' '}
                Remember me
              </label>
              <Link to="/ForgotPassword">Forgot Password?</Link>
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <p className="contact-note">
              Don’t have an account? <br />
              <a href="mailto:LostFound.Admin@lpunetwork.edu.ph">Contact your administrator</a>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;