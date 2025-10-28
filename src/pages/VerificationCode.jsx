import { useState, useRef, useEffect } from 'react';

export default function VerificationCode() {
  const [codigo, setCodigo] = useState(['', '', '', '', '']);
  const inputsRef = useRef([]);

  useEffect(() => {
    // Enfocar el primer input al montar el componente
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const nuevoCodigo = [...codigo];
    nuevoCodigo[index] = value;
    setCodigo(nuevoCodigo);

    // Auto-focus al siguiente input si se ingresó un dígito
    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Manejar backspace
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Solo procesar si son exactamente 5 dígitos
    if (/^\d{5}$/.test(pastedData)) {
      const nuevoCodigo = pastedData.split('');
      setCodigo(nuevoCodigo);
      inputsRef.current[4]?.focus();
    }
  };

  const handleContinuar = () => {
    const codigoCompleto = codigo.join('');
    
    if (codigoCompleto.length !== 5) {
      alert('Por favor, ingresa el código completo de 5 dígitos');
      return;
    }
    
    console.log('Código ingresado:', codigoCompleto);
    // Aquí agregarías tu lógica de verificación
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="!text-2xl font-bold text-orange-500 mb-4">
          Hemos enviado un correo electrónico a
        </h1>
        
        <p className="text-gray-800 font-medium text-lg mb-6">
          ******@gmail.com
        </p>
        
        <p className="text-orange-500 text-sm mb-8">
          con un código de 5 dígitos, inserte el código en las casillas
        </p>

        {/* Inputs de código */}
        <div className="flex justify-center gap-3 mb-8">
          {codigo.map((digito, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digito}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-14 h-16 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
            />
          ))}
        </div>

        {/* Botón Continuar */}
        <button
          onClick={handleContinuar}
          className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-12 rounded-lg transition-colors shadow-md"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}