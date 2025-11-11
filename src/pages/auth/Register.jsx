import { useState } from 'react';
import { Eye, EyeOff, Calendar, Check } from 'lucide-react';
import AuthBanner from '../../components/AuthBanner';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api/auth.service';
import TermsDialog from '../../components/TermsDialog';
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

  // Password validations
  const validations = {
    length: formData.password.length >= 12,
    special: /[#$%&/]/.test(formData.password),
    number: /\d/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password)
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkMissingFields = () => {
    const missingFields = [];
    
    if (!formData.firstName.trim()) missingFields.push('Nombre');
    if (!formData.lastName.trim()) missingFields.push('Apellidos');
    if (!formData.birthDate) missingFields.push('Fecha de nacimiento');
    if (!formData.email.trim()) missingFields.push('Correo electrónico');
    if (!formData.password) missingFields.push('Contraseña');
    if (!formData.confirmPassword) missingFields.push('Confirmar contraseña');
    if (!acceptTerms) missingFields.push('Aceptación de Términos y Condiciones');
    
    return missingFields;
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      const missingFields = checkMissingFields();
      if (missingFields.length > 0) {
        toast.error(
          <div>
            <p>Por favor completa todos los campos requeridos:</p>
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

      // Validar requisitos de contraseña
      if (!validations.length || !validations.special || !validations.number || !validations.uppercase) {
        const missingRequirements = [];
        if (!validations.length) missingRequirements.push('Mínimo 12 caracteres');
        if (!validations.special) missingRequirements.push('Al menos 1 carácter especial (# $ % & /)');
        if (!validations.number) missingRequirements.push('Al menos 1 número');
        if (!validations.uppercase) missingRequirements.push('Al menos 1 letra mayúscula');

        toast.error(
          <div>
            <p>La contraseña no cumple con los requisitos:</p>
            <ul className="list-disc pl-4 mt-2">
              {missingRequirements.map(req => (
                <li key={req}>{req}</li>
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
        setError('Las contraseñas no coinciden');
        toast.error('Las contraseñas no coinciden');
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
      setError(error.response?.data?.message || 'Ocurrió un error durante el registro');
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50 py-12 px-4 overflow-x-hidden">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-gray-600">
        <h1 className="text-4xl font-bold text-orange-500 text-center mb-8">
          Registro
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
              Nombre
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-0 py-2 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Juan"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Apellidos
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-0 py-2 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Pérez"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Fecha de nacimiento
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
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-0 py-2 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="juan.perez@ejemplo.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Contraseña
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
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-4 space-y-2">
              <div className={`flex items-center gap-2 text-sm ${validations.length ? 'text-green-600' : 'text-gray-600'}`}>
                <div className={`w-4 h-4 flex items-center justify-center border-2 rounded ${validations.length ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {validations.length && <Check size={12} className="text-white" />}
                </div>
                <span>12 Caracteres</span>
              </div>

              <div className={`flex items-center gap-2 text-sm ${validations.special ? 'text-green-600' : 'text-gray-600'}`}>
                <div className={`w-4 h-4 flex items-center justify-center border-2 rounded ${validations.special ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {validations.special && <Check size={12} className="text-white" />}
                </div>
                <span>1 Caracter Especial (Ej: # $ % & / )</span>
              </div>

              <div className={`flex items-center gap-2 text-sm ${validations.number ? 'text-green-600' : 'text-gray-600'}`}>
                <div className={`w-4 h-4 flex items-center justify-center border-2 rounded ${validations.number ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {validations.number && <Check size={12} className="text-white" />}
                </div>
                <span>1 Número</span>
              </div>

              <div className={`flex items-center gap-2 text-sm ${validations.uppercase ? 'text-green-600' : 'text-gray-600'}`}>
                <div className={`w-4 h-4 flex items-center justify-center border-2 rounded ${validations.uppercase ? 'bg-black border-black' : 'border-gray-400'}`}>
                  {validations.uppercase && <Check size={12} className="text-white" />}
                </div>
                <span>1 Letra Mayúscula</span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Confirmar contraseña
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
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
              Acepto los&nbsp;
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-orange-500 hover:text-orange-600 underline focus:outline-none! bg-transparent! border-none! p-0!"
              >
                Términos y Condiciones
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
            Crear Cuenta
          </button>

          <div className="text-gray-500 text-sm">¿Ya tienes una cuenta?
              <Link 
                to="/login" 
                className="underline pl-1"
              >
                Inicia sesión
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