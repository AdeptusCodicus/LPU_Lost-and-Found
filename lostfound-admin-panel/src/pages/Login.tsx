import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import '../styles/Login.css';
import illustration from '../images/Illustration.png';
import Footer from '../components/Footer';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Load email from local storage if "Remember me" was previously checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Hardcoded credentials
    const validEmail = 'lpuadmin@lpunetwork.edu.ph';
    const validPassword = 'LPUlost&found';

    if (email === validEmail && password === validPassword) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email); // Save email to local storage
      } else {
        localStorage.removeItem('rememberedEmail'); // Remove email from local storage
      }
      window.location.href = '/Home'; // Redirect to Home page
    } else {
      setErrorMessage('Invalid email or password. Please try again.');
    }
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };
useEffect(() => {
    document.title = 'Login | LPU Lost & Found';
  }, []);

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

            {/* Display Alert instead of plain error message */}
            {errorMessage && (
              <Alert
                icon={<CheckIcon fontSize="inherit" />}
                severity="error"
                sx={{ mb: 2 }}
              >
                {errorMessage}
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
                  autoComplete="email" // Enable browser autocomplete for email
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
                />
              </div>
            </div>

            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />{' '}
                Remember me
              </label>
              {/* Route to "/ForgotPassword" */}
              <Link to="/ForgotPassword">Forgot Password?</Link>
            </div>

            <button type="submit">Login</button>

            <p className="contact-note">
              Don’t have an account? <br />
              <a href="mailto:LostFound.Admin@lpunetwork.edu.ph">Contact your administrator</a>
            </p>
          </form>
        </div>
      </div>

      <Footer /> {/* Use the reusable Footer component */}
    </div>
  );
};

export default Login;