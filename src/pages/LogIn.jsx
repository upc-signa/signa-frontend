import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthBanner from '../components/AuthBanner';
import { Link } from 'react-router-dom';
        

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleSubmit = () => {
    console.log('Login:', { usuario, contrasena });
    // Aquí agregarías tu lógica de autenticación
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full h-min max-w-[1024px] flex shadow-2xl rounded-2xl overflow-hidden bg-white text-gray-600">
        {/* Sección izquierda - Formulario */}
        <div className="w-[min(500px,100%)] p-12 lg:p-16 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-orange-500 mb-12">
            ¡Bienvenido!
          </h1>
          
          <div className="space-y-8">
            {/* Campo Usuario */}
            <div>
              <label className="block text-orange-400 text-sm font-medium mb-3">
                USUARIO
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-0 py-3 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-orange-400 text-sm font-medium mb-3">
                CONTRASEÑA
              </label>
              <div className="relative">
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-0 py-3 pr-10 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 !bg-transparent !border-none"
                >
                  {mostrarContrasena ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Link olvidé contraseña */}
            <div className="">
              <Link 
                to="/recover-password" 
                className="text-sm !text-black hover:!text-gray-600"
              >
                He olvidado la contraseña <i className="pi pi-arrow-right pl-1"></i>
              </Link>
            </div>

            {/* Botón Iniciar Sesión */}
            <button
              onClick={handleSubmit}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-lg transition-colors shadow-md"
            >
              Iniciar sesión
            </button>

            <div className="text-gray-500 text-sm">¿No tienes una cuenta? 
              <Link 
                to="/register" 
                className="!underline pl-1"
              >
                Regístrate
            </Link>
            </div>
          </div>
        </div>

        {/* Sección derecha - Ilustración */}
        
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