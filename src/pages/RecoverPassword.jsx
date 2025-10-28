import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RecoverPassword() {
  const [correo, setCorreo] = useState('');

  const handleSubmit = () => {
    if (!correo) {
      alert('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }
    
    console.log('Recuperar contraseña para:', correo);
    // Aquí agregar lógica de recuperación
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
          Recuperar contraseña
        </h1>
        
        <p className="text-gray-600 text-center text-sm mb-8">
          Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
        </p>

        <div className="mb-8">
          <label className="block text-gray-500 text-sm mb-3">
            Correo electrónico
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-0 py-3 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="ejemplo@gmail.com"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-lg transition-colors shadow-md mb-4"
        >
          Enviar instrucciones
        </button>

        <div className="text-center">
          <Link 
            to="/login"
            className="text-sm">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}