import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { authService } from '../services/api/auth.service';
import { toast } from 'react-toastify';

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email] = useState(location.state?.email || '');
  const [verificationCode] = useState(location.state?.verificationCode || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset states when unmounting
  useEffect(() => {
    return () => {
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setIsSubmitting(false);
    };
  }, []);

  // Password validations
  const validations = {
    length: newPassword.length >= 12,
    special: /[#$%&/]/.test(newPassword),
    number: /\d/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!newPassword || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!Object.values(validations).every(v => v)) {
        setError('Password does not meet all requirements');
        return;
      }

      await authService.resetPassword({
        email,
        verificationCode,
        newPassword
      });

      toast.success('Password changed successfully');
      // Redirect to login with success message
      navigate('/login', { 
        state: { message: 'Password has been changed successfully. Please login with your new password.' }
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Error changing password. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!verificationCode || !email) {
    return <Navigate to="/recover-password" />;
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10">
        <h1 className="!text-4xl font-bold text-orange-500 mb-10">
          New Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-orange-500 text-sm font-medium mb-3 uppercase">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-0 py-3 pr-12 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-800 text-white p-2 rounded"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-4 space-y-2">
              <div className={`flex items-center gap-2 text-sm ${validations.length ? 'text-green-600' : 'text-gray-600'}`}>
                <div className={`w-4 h-4 flex items-center justify-center border-2 rounded ${validations.length ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {validations.length && <Check size={12} className="text-white" />}
                </div>
                <span>12 Characters</span>
              </div>

              <div className={`flex items-center gap-2 text-sm ${validations.special ? 'text-green-600' : 'text-gray-600'}`}>
                <div className={`w-4 h-4 flex items-center justify-center border-2 rounded ${validations.special ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {validations.special && <Check size={12} className="text-white" />}
                </div>
                <span>1 Special Character (Ex: # $ % & / )</span>
              </div>

              <div className={`flex items-center gap-2 text-sm ${validations.number ? 'text-green-600' : 'text-gray-600'}`}>
                <div className={`w-4 h-4 flex items-center justify-center border-2 rounded ${validations.number ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {validations.number && <Check size={12} className="text-white" />}
                </div>
                <span>1 Numeric Character</span>
              </div>

              <div className={`flex items-center gap-2 text-sm ${validations.uppercase ? 'text-green-600' : 'text-gray-600'}`}>
                <div className={`w-4 h-4 flex items-center justify-center border-2 rounded ${validations.uppercase ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {validations.uppercase && <Check size={12} className="text-white" />}
                </div>
                <span>1 Uppercase Character</span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-orange-500 text-sm font-medium mb-3 uppercase">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-0 py-3 pr-12 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-800 text-white p-2 rounded"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Change Password Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-full transition-colors shadow-md mt-8 text-lg ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}