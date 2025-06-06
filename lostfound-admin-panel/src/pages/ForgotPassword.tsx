import React, { useState } from 'react';
import '../styles/ForgotPassword.css'; // Separate CSS for Forgot Password page

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setMessage('An OTP has been sent to your email.');
    setStep('otp');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP you received.');
      return;
    }
    setError('');
    setMessage('OTP verified! You can now reset your password.');
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <h2>Forgot Your Password?</h2>
          <p className="instructions">
            Enter your registered email address below. We'll send you a link to reset your password.
          </p>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <form
            className="forgot-password-form"
            onSubmit={step === 'email' ? handleEmailSubmit : handleOtpSubmit}
          >
            {step === 'email' && (
              <>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="your.email@lpu.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="action-button">
                  Send Reset Link
                </button>
              </>
            )}

            {step === 'otp' && (
              <>
                <label htmlFor="otp">Enter the OTP Sent to Your Email</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button type="submit" className="action-button">
                  Verify OTP
                </button>
              </>
            )}
          </form>

          <p className="back-to-login">
            Remembered your password? <a href="/Login">Back to Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;