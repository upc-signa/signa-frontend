import { MessageCircle, Hand, Subtitles } from 'lucide-react';

/**
 * Componente para mostrar el detalle de un meet con sus mensajes
 */
export default function MeetDetail({ meet, onClose }) {
  if (!meet) return null;

  const getMessageIcon = (type) => {
    switch (type) {
      case 'SIGN':
      case 'seña':
        return <Hand size={16} className="text-orange-500" />;
      case 'SUBTITLE':
      case 'subtitulo':
        return <Subtitles size={16} className="text-blue-500" />;
      case 'CHAT':
      case 'chat':
      default:
        return <MessageCircle size={16} className="text-green-500" />;
    }
  };

  const getMessageTypeLabel = (type) => {
    switch (type) {
      case 'SIGN':
      case 'seña':
        return 'Seña';
      case 'SUBTITLE':
      case 'subtitulo':
        return 'Subtítulo';
      case 'CHAT':
      case 'chat':
      default:
        return 'Chat';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-orange-500 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Detalle del Meet</h2>
              <p className="text-orange-100">{formatDateTime(meet.createdAt)}</p>
              {meet.endSessionTime && (
                <p className="text-orange-100 text-sm mt-1">
                  Finalizada: {new Date(meet.endSessionTime).toLocaleString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-orange-600 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Estado */}
          <div className="mt-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              meet.isActive 
                ? 'bg-green-400 text-white' 
                : 'bg-orange-300 text-orange-900'
            }`}>
              {meet.isActive ? '🟢 Sesión Activa' : '⚫ Sesión Finalizada'}
            </span>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-6">
          {!meet.messages || meet.messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay mensajes en esta conversación
            </div>
          ) : (
            <div className="space-y-4">
              {meet.messages.map((message, idx) => (
                <div
                  key={message.id || idx}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        {message.senderName || 'Usuario'}
                      </span>
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                        {getMessageIcon(message.messageType)}
                        <span>{getMessageTypeLabel(message.messageType)}</span>
                      </div>
                    </div>
                    {message.sentAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(message.sentAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap wrap-break-word">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
