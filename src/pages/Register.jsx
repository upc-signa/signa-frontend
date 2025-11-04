import { useState } from 'react';
import { Eye, EyeOff, Calendar } from 'lucide-react';
import AuthBanner from '../components/AuthBanner';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api/auth.service';
import TermsDialog from '../components/TermsDialog';
import { toast } from 'react-toastify';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkMissingFields = () => {
    const missingFields = [];
    
    if (!formData.firstName.trim()) missingFields.push('First Name');
    if (!formData.lastName.trim()) missingFields.push('Last Name');
    if (!formData.birthDate) missingFields.push('Birth Date');
    if (!formData.email.trim()) missingFields.push('Email');
    if (!formData.password) missingFields.push('Password');
    if (!formData.confirmPassword) missingFields.push('Confirm Password');
    if (!acceptTerms) missingFields.push('Terms and Conditions acceptance');
    
    return missingFields;
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      const missingFields = checkMissingFields();
      if (missingFields.length > 0) {
        toast.error(
          <div>
            <p>Please fill in all required fields:</p>
            <ul className="list-disc pl-4 mt-2">
              {missingFields.map(field => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>,
          {
            position: "top-right",
            autoClose: 5000
          }
        );
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const registerData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        birthDate: formData.birthDate
      };
      
      await authService.register(registerData);
      // Navigate to verification code page for email verification
      navigate('/verification-code', { 
        state: { 
          email: formData.email,
          purpose: 'email'  // Could omit this since 'email' is default
        } 
      });
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-gray-600">
        <h1 className="text-4xl font-bold text-orange-500 text-center mb-8">
          Sign Up
        </h1>

        <div className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* First Name */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-0 py-2 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="John"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-0 py-2 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Smith"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Birth Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-0 py-2 pr-10 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <Calendar 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                size={20} 
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-0 py-2 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="john.smith@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-0 py-2 pr-10 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 !bg-transparent"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-0 py-2 pr-10 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 !bg-transparent"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-500"
            />
            <label className="text-sm text-gray-700">
              Accept&nbsp;
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-orange-500 hover:text-orange-600 underline focus:!outline-none !bg-transparent !border-none !p-0"
              >
                Terms and Conditions
              </button>
            </label>
          </div>

          {/* Terms Dialog */}
          <TermsDialog 
            isOpen={showTerms} 
            onClose={() => setShowTerms(false)}
          />

          {/* Create Account Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-lg transition-colors shadow-md"
          >
            Create Account
          </button>

          <div className="text-gray-500 text-sm">Already have an account?
              <Link 
                to="/login" 
                className="underline pl-1"
              >
                Log in
              </Link>
          </div>
        </div>
      </div>
      <div className="w-1/2 hidden md:block">
            <AuthBanner />
            {/*<img
                src="/login.png"
                alt="Ilustración de inicio de sesión"
                width={400}
                height={400}
                className="object-contain"
            />*/}
        </div>
    </div>
  );
}