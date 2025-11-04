import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api/auth.service';

export default function VerificationCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');
  const email = location.state?.email || '';
  const [purpose] = useState(location.state?.purpose || 'email'); // 'email' or 'reset'
  const inputsRef = useRef([]);

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }

    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{5}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputsRef.current[4]?.focus();
    }
  };

  const handleContinue = async () => {
    const completeCode = code.join('');
    
    if (completeCode.length !== 5) {
      setError('Please enter the complete 5-digit code');
      return;
    }

    try {
      setError('');
      
      if (purpose === 'reset') {
        // For password reset flow, navigate to change password
        navigate('/change-password', { 
          state: { 
            email,
            verificationCode: completeCode
          }
        });
      } else {
        // For email verification flow
        await authService.verifyCode({
          email,
          verificationCode: completeCode
        });
        navigate('/login', { state: { verified: true } });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid verification code');
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="!text-2xl font-bold text-orange-500 mb-4">
          We've sent an email to
        </h1>
        
        <p className="text-gray-800 font-medium text-lg mb-6">
          {email}
        </p>
        
        <p className="text-orange-500 text-sm mb-8">
          {purpose === 'reset' 
            ? 'Enter the 5-digit code to reset your password'
            : 'with a 5-digit code, please enter the code below'
          }
        </p>

        {error && (
          <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {/* Code inputs */}
        <div className="flex justify-center gap-3 mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-14 h-16 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
            />
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-12 rounded-lg transition-colors shadow-md"
        >
          {purpose === 'reset' ? 'Reset Password' : 'Verify Email'}
        </button>
      </div>
    </div>
  );
}