import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { historyService } from '../../services/api/history.service';
import { planService } from '../../services/api/plan.service';
import { useNavigate } from 'react-router-dom';
import HistorySearch from './HistorySearch';
import MeetDetail from './MeetDetail';
import { MessageSquare, Trash2, Calendar, Users, AlertCircle } from 'lucide-react';

/**
 * Vista principal del historial de Meets
 * Solo accesible para usuarios Premium
 */
export default function History() {
  const navigate = useNavigate();
  const [meets, setMeets] = useState([]);
  const [filteredMeets, setFilteredMeets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedMeet, setSelectedMeet] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Verificar plan premium y cargar historial
  useEffect(() => {
    checkPremiumAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPremiumAndLoad = async () => {
    try {
      const plan = await planService.getCurrentPlan().catch(() => null);
      const premium = plan?.planType === 'PREMIUM' && plan?.active;
      setIsPremium(premium);

      if (!premium) {
        toast.error('Esta función solo está disponible para usuarios Premium');
        navigate('/plans');
        return;
      }

      await loadHistory();
    } catch {
      toast.error('Error al verificar el plan');
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await historyService.getHistory();
      setMeets(data || []);
      setFilteredMeets(data || []);
    } catch {
      toast.error('Error al cargar el historial');
      setMeets([]);
      setFilteredMeets([]);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda por palabras clave
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredMeets(meets);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = meets.filter((meet) => {
      // Buscar en participantes
      const participantsMatch = meet.participants?.some((p) =>
        p.toLowerCase().includes(term)
      );

      // Buscar en mensajes
      const messagesMatch = meet.messages?.some((msg) =>
        msg.content?.toLowerCase().includes(term) ||
        msg.sender?.toLowerCase().includes(term)
      );

      return participantsMatch || messagesMatch;
    });

    setFilteredMeets(filtered);
  };

  // Filtro por fechas
  const handleDateFilter = ({ startDate, endDate }) => {
    if (!startDate && !endDate) {
      setFilteredMeets(meets);
      return;
    }

    const filtered = meets.filter((meet) => {
      const meetDate = new Date(meet.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && meetDate < start) return false;
      if (end && meetDate > end) return false;
      return true;
    });

    setFilteredMeets(filtered);
  };

  // Ver detalle de un meet
  const handleViewMeet = async (meetId) => {
    try {
      const meetDetail = await historyService.getMeetById(meetId);
      setSelectedMeet(meetDetail);
    } catch {
      toast.error('Error al cargar el detalle del meet');
    }
  };

  // Eliminar un meet individual
  const handleDeleteMeet = async (meetId) => {
    try {
      await historyService.deleteMeet(meetId);
      toast.success('Meet eliminado correctamente');
      setShowDeleteConfirm(null);
      await loadHistory();
    } catch {
      toast.error('Error al eliminar el meet');
    }
  };

  // Eliminar todo el historial
  const handleDeleteAllHistory = async () => {
    try {
      await historyService.deleteAllHistory();
      toast.success('Historial eliminado completamente');
      setShowDeleteConfirm(null);
      await loadHistory();
    } catch {
      toast.error('Error al eliminar el historial');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Cargando historial...</div>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return null; // Ya redirigido
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-orange-500 flex items-center gap-3">
          <MessageSquare size={32} />
          Historial de Meets
        </h1>
        {meets.length > 0 && (
          <button
            onClick={() => setShowDeleteConfirm('all')}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Trash2 size={16} />
            Eliminar todo
          </button>
        )}
      </div>

      {/* Componente de búsqueda */}
      <HistorySearch onSearch={handleSearch} onDateFilter={handleDateFilter} />

      {/* Lista de meets */}
      {filteredMeets.length === 0 ? (
        <div className="card rounded-2xl shadow-md p-12 text-center">
          <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {meets.length === 0 ? 'No hay historial disponible' : 'No se encontraron resultados'}
          </h2>
          <p className="text-gray-500">
            {meets.length === 0
              ? 'Tus conversaciones aparecerán aquí una vez que realices tu primer meet.'
              : 'Intenta ajustar los filtros de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMeets.map((meet) => (
            <div
              key={meet.id}
              className="card rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-orange-500" size={20} />
                    <h3 className="text-lg font-semibold">{formatDate(meet.date)}</h3>
                  </div>

                  {/* Participantes */}
                  {meet.participants && meet.participants.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={16} className="text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {meet.participants.map((participant, idx) => (
                          <span
                            key={idx}
                            className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {participant}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resumen de mensajes */}
                  <div className="text-sm text-gray-600">
                    <MessageSquare size={14} className="inline mr-1" />
                    {meet.messages?.length || 0} mensaje(s)
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewMeet(meet.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Ver detalles
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(meet.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      {selectedMeet && (
        <MeetDetail meet={selectedMeet} onClose={() => setSelectedMeet(null)} />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertCircle size={24} />
              <h3 className="text-xl font-bold">Confirmar eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {showDeleteConfirm === 'all'
                ? '¿Estás seguro de que deseas eliminar TODO tu historial? Esta acción no se puede deshacer.'
                : '¿Estás seguro de que deseas eliminar este meet? Esta acción no se puede deshacer.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  showDeleteConfirm === 'all'
                    ? handleDeleteAllHistory()
                    : handleDeleteMeet(showDeleteConfirm)
                }
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
