import { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

export default function ScheduleMeetDialog({ isOpen, onClose, onConfirm }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [minDate, setMinDate] = useState('');
  const [minTime, setMinTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Configurar fecha y hora mínima (ahora en hora local)
      const now = new Date();
      
      // Formato para input date: YYYY-MM-DD (en hora local)
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setMinDate(dateString);
      setSelectedDate(dateString);
      
      // Formato para input time: HH:MM (en hora local)
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      setMinTime(timeString);
      setSelectedTime(timeString);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    // El input date/time ya está en hora local del navegador
    // Crear la fecha combinando año, mes, día, hora y minutos
    const [year, month, day] = selectedDate.split('-');
    const [hours, minutes] = selectedTime.split(':');
    
    // Crear fecha en hora local (esto ya considera la zona horaria del navegador)
    const localDate = new Date(year, month - 1, day, hours, minutes);
    
    // Convertir a UTC para enviar al backend
    const utcDate = new Date(localDate.getTime());
    
    onConfirm(utcDate.toISOString());
  };

  const validateTime = () => {
    if (!selectedDate || !selectedTime) return true;
    
    const now = new Date();
    const selected = new Date(`${selectedDate}T${selectedTime}`);
    
    // Si es hoy, validar que la hora no sea pasada
    if (selectedDate === minDate) {
      return selectedTime >= minTime;
    }
    
    return selected > now;
  };

  const isValidTime = validateTime();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-screen bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full relative shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Programar Reunión
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona la fecha y hora de inicio para tu reunión. La zona horaria es UTC-5 (Perú).
          </p>

          {/* Fecha */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar size={18} className="text-orange-500" />
              Fecha de inicio
            </label>
            <input
              type="date"
              value={selectedDate}
              min={minDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock size={18} className="text-orange-500" />
              Hora de inicio
            </label>
            <input
              type="time"
              value={selectedTime}
              min={selectedDate === minDate ? minTime : '00:00'}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Mensaje de validación */}
          {!isValidTime && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                ⚠️ La hora seleccionada no puede ser en el pasado
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              💡 <strong>Nota:</strong> La reunión se creará con la fecha y hora seleccionadas.
              Podrás compartir el enlace con los participantes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || !isValidTime}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Crear Reunión
          </button>
        </div>
      </div>
    </div>
  );
}
