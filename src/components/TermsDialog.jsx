import { X } from 'lucide-react';

export default function TermsDialog({ isOpen, onClose }) {
  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 h-screen bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Términos y Condiciones</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors !bg-transparent !border-none focus:!outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto">
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-500 mb-4">Última actualización: {currentDate}</p>
            
            <p className="mb-6">
              Bienvenido a nuestra plataforma de videollamadas. Al registrarte, acceder o utilizar nuestros servicios, 
              aceptas los siguientes Términos y Condiciones. Por favor, léelos detenidamente antes de usar la plataforma.
            </p>

            <h3 className="text-lg font-semibold mb-2">1. Aceptación de Términos</h3>
            <p className="mb-4">
              Al crear una cuenta o utilizar la plataforma, confirmas que has leído y aceptado estos 
              Términos y Condiciones, así como nuestra Política de Privacidad. Si no estás de acuerdo, no debes utilizar el servicio.
            </p>

            <h3 className="text-lg font-semibold mb-2">2. Registro de Usuario y Cuenta</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Se requiere registro con información veraz y actualizada para las videollamadas.</li>
              <li>Eres responsable de mantener la confidencialidad de tus credenciales.</li>
              <li>No está permitido el uso de cuentas falsas o cuentas de terceros no autorizadas.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">3. Uso Permitido de la Plataforma</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>La plataforma debe ser utilizada únicamente para fines legales y respetuosos.</li>
              <li>Está prohibido grabar, distribuir o compartir videollamadas sin el consentimiento de los participantes.</li>
              <li>No está permitido usar la plataforma para actividades ilegales, ofensivas o que infrinjan derechos de terceros.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">4. Responsabilidad del Usuario</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Los usuarios son responsables del contenido que comparten durante las videollamadas.</li>
              <li>La empresa no es responsable de la conducta de otros usuarios ni del contenido que compartan.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">5. Limitación de Responsabilidad</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>El servicio se proporciona "tal cual" y no garantizamos su disponibilidad ininterrumpida.</li>
              <li>No asumimos responsabilidad por interrupciones técnicas, pérdida de datos o problemas derivados del uso del servicio.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">6. Modificaciones del Servicio</h3>
            <p className="mb-4">
              Podemos actualizar, modificar o suspender parcial o totalmente la plataforma en cualquier momento, 
              notificando a los usuarios con anticipación cuando sea posible.
            </p>

            <h3 className="text-lg font-semibold mb-2">7. Legislación Aplicable</h3>
            <p className="mb-4">
              Estos Términos y Condiciones se rigen por las leyes de Perú. Cualquier disputa será resuelta 
              en los tribunales competentes de esta jurisdicción.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Entiendo
          </button>
        </div>
      </div>
    </div>
  );
}