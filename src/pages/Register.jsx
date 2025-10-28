import { useState } from 'react';
import { Eye, EyeOff, Calendar } from 'lucide-react';
import AuthBanner from '../components/AuthBanner';
import { Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    apellidos: '',
    fechaNacimiento: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: ''
  });
  
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [aceptarTerminos, setAceptarTerminos] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!aceptarTerminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    
    if (formData.contrasena !== formData.confirmarContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    console.log('Registro:', formData);
    // Aquí agregarías tu lógica de registro
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-gray-600">
        <h1 className="text-4xl font-bold text-orange-500 text-center mb-8">
          Registro
        </h1>

        <div className="space-y-6">
          {/* Nombre completo */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              className="w-full px-0 py-2 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="John Manuel"
            />
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Apellidos
            </label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className="w-full px-0 py-2 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Arismendi Ortega"
            />
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Fecha de nacimiento
            </label>
            <div className="relative">
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className="w-full px-0 py-2 pr-10 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <Calendar 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                size={20} 
              />
            </div>
          </div>

          {/* Correo electrónico */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="w-full px-0 py-2 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="johnarl20004@gmail.com"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarContrasena ? "text" : "password"}
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                className="w-full px-0 py-2 pr-10 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 !bg-transparent"
              >
                {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-gray-500 text-sm mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                name="confirmarContrasena"
                value={formData.confirmarContrasena}
                onChange={handleChange}
                className="w-full px-0 py-2 pr-10 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 !bg-transparent"
              >
                {mostrarConfirmar ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Términos y condiciones */}
          <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="terminos"
                  checked={aceptarTerminos}
                  onChange={(e) => setAceptarTerminos(e.target.checked)}
                  className="mt-1 w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="terminos" className="text-sm text-gray-700 cursor-pointer">
                  Leer Términos y condiciones
                </label>
          </div>

          {/* Botón Crear cuenta */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-lg transition-colors shadow-md"
          >
            Crear cuenta
          </button>

          <div className="text-gray-500 text-sm">¿Ya tienes una cuenta?
              <Link 
                to="/login" 
                className="!underline pl-1"
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