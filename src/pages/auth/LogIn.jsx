import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthBanner from '../../components/AuthBanner';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api/auth.service';
import { toast } from 'react-toastify';
        
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFields = () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail || !password) {
      const missingFields = [];
      if (!trimmedEmail) missingFields.push('Correo');
      if (!password) missingFields.push('Contraseña');
      return { isValid: false, missingFields };
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Por favor ingresa un correo electrónico válido');
      return { isValid: false };
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return { isValid: false };
    }

    return { isValid: true };
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      const validation = validateFields();
      if (!validation.isValid) {
        if (validation.missingFields) {
          toast.error(
            <div>
              <p>Por favor completa todos los campos requeridos:</p>
              <ul className="list-disc pl-4 mt-2">
                {validation.missingFields.map(field => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>,
            {
              position: "top-right",
              autoClose: 5000
            }
          );
        }
        return;
      }

      const response = await authService.login({ 
        email: email.trim(), 
        password 
      });
      localStorage.setItem('token', response.token);
      navigate('/'); // Redirect to home after successful login
    } catch (error) {
      if (error.response?.status === 409) {
        // Email not verified, redirect to verification page
        toast.info('Por favor verifica tu correo electrónico para continuar');
        navigate('/verification-code', { 
          state: { 
            email: email.trim(),
            purpose: 'email'
          } 
        });
      } else {
        const errorMessage = error.response?.data?.message || 'Ocurrió un error durante el inicio de sesión';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full h-min max-w-[1024px] flex shadow-2xl rounded-2xl overflow-hidden bg-white text-gray-600">
        {/* Left section - Form */}
        <div className="w-[min(500px,100%)] p-12 lg:p-16 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-orange-500 mb-12">
            ¡Bienvenido!
          </h1>
          
          <div className="space-y-8">
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-orange-400 text-sm font-medium mb-3">
                CORREO ELECTRÓNICO
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-0 py-3 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-orange-400 text-sm font-medium mb-3">
                CONTRASEÑA
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-0 py-3 pr-10 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 !bg-transparent"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div>
              <Link 
                to="/recover-password" 
                className="text-sm text-black hover:text-gray-600"
              >
                Olvidé mi contraseña <i className="pi pi-arrow-right pl-1"></i>
              </Link>
            </div>

            {/* Login button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-lg transition-colors shadow-md"
            >
              Iniciar sesión
            </button>

            <div className="text-gray-500 text-sm">¿No tienes una cuenta? 
              <Link 
                to="/register" 
                className="underline pl-1"
              >
                Regístrate
              </Link>
            </div>
          </div>
        </div>

        {/* Right section - Banner */}
        <div className="w-full hidden md:block">
          <AuthBanner />
          {/* <img
            src="/login.png"
            alt="Ilustración de inicio de sesión"
            width={400}
            height={400}
            className="object-contain"
          /> */}
        </div>
      </div>
    </div>
  );
}