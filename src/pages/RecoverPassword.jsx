import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api/auth.service';

export default function RecoverPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async () => {
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }
    
    try {
      await authService.requestPasswordReset(email);
      setStatus({
        type: 'success',
        message: 'Verification code has been sent to your email'
      });
      // Redirect to verification code page for password reset
      navigate('/verification-code', { 
        state: { 
          email,
          purpose: 'reset'
        } 
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'An error occurred while sending the verification code'
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="!text-3xl font-bold text-orange-500 text-center mb-3">
          Recover Password
        </h1>
        
        <p className="text-gray-600 text-center text-sm mb-8">
          Enter your email address and we'll send you a verification code to reset your password
        </p>

        {status.message && (
          <div className={`mb-4 p-3 rounded text-sm ${
            status.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
          }`}>
            {status.message}
          </div>
        )}

        <div className="mb-8">
          <label className="block text-gray-500 text-sm mb-3">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-0 py-3 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="example@email.com"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-lg transition-colors shadow-md mb-4"
        >
          Send Code
        </button>

        <div className="text-center">
          <Link 
            to="/login"
            className="text-sm">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}