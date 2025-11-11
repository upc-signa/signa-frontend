import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, AlertCircle, Crown } from 'lucide-react';
import { toast } from 'react-toastify';
import { historyService } from '../../services/api/history.service';
import { planService } from '../../services/api/plan.service';
import HistorySearch from './HistorySearch';
import MeetDetail from './MeetDetail';

export default function History() {
  const navigate = useNavigate();
  const [meets, setMeets] = useState([]);
  const [filteredMeets, setFilteredMeets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedMeet, setSelectedMeet] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    checkPremiumAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, meets]);

  const checkPremiumAndLoad = async () => {
    try {
      setLoading(true);
      const plan = await planService.getCurrentPlan().catch(() => null);
      const premium = plan?.planType === 'PREMIUM' && plan?.active;
      setIsPremium(premium);

      if (!premium) {
        toast.warning('Necesitas una cuenta Premium para acceder al historial');
        navigate('/plans');
        return;
      }

      await loadHistory();
    } catch {
      toast.error('Error al verificar el plan');
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await historyService.getHistory();
      setMeets(data || []);
      setFilteredMeets(data || []);
    } catch {
      toast.error('Error al cargar el historial');
      setMeets([]);
      setFilteredMeets([]);
    }
  };

  // Aplicar todos los filtros combinados
  const applyFilters = () => {
    let filtered = [...meets];

    // Filtro por palabra clave
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((meet) => {
        const hasInMessages = meet.messages?.some(
          (msg) =>
            msg.content?.toLowerCase().includes(searchLower) ||
            msg.senderName?.toLowerCase().includes(searchLower)
        );
        return hasInMessages;
      });
    }

    // Filtro por fechas
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((meet) => {
        const meetDate = new Date(meet.createdAt);
        const start = filters.startDate ? new Date(filters.startDate) : null;
        const end = filters.endDate ? new Date(filters.endDate) : null;

        if (start && end) {
          return meetDate >= start && meetDate <= end;
        }
        if (start) {
          return meetDate >= start;
        }
        if (end) {
          return meetDate <= end;
        }
        return true;
      });
    }

    setFilteredMeets(filtered);
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const handleDateFilter = ({ startDate, endDate }) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleViewMeet = (meetId) => {
    // Buscar el meet en el array local ya que no hay endpoint individual
    const meetData = meets.find(m => m.id === meetId);
    if (meetData) {
      setSelectedMeet(meetData);
    } else {
      toast.error('No se pudo encontrar el detalle del meet');
    }
  };

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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4">
        <div className="card rounded-2xl shadow-md p-8 max-w-md text-center">
          <Crown className="text-orange-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-4">Función Premium</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El historial de conversaciones solo está disponible para usuarios Premium.
          </p>
          <button
            onClick={() => navigate('/plans')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Ver Planes Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Historial de Conversaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Revisa todas tus conversaciones anteriores
          </p>
        </div>

        <HistorySearch onSearch={handleSearch} onDateFilter={handleDateFilter} />

        {/* Indicador de filtros activos */}
        {(filters.searchTerm || filters.startDate || filters.endDate) && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <AlertCircle size={16} className="inline mr-1" />
              {filteredMeets.length} resultado(s) encontrado(s)
              {filters.searchTerm && ` con "${filters.searchTerm}"`}
              {filters.startDate && ` desde ${new Date(filters.startDate).toLocaleDateString('es-ES')}`}
              {filters.endDate && ` hasta ${new Date(filters.endDate).toLocaleDateString('es-ES')}`}
            </p>
          </div>
        )}

        {filteredMeets.length === 0 ? (
          <div className="card rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {meets.length === 0 
                ? 'Aún no tienes conversaciones guardadas'
                : 'No se encontraron resultados con los filtros aplicados'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total: {filteredMeets.length} conversación(es)
              </p>
              {meets.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm('all')}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <Trash2 size={16} />
                  Eliminar todo el historial
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMeets.map((meet) => (
                <div
                  key={meet.id}
                  className="card rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      📅 {formatDate(meet.createdAt)}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        meet.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {meet.isActive ? '🟢 Activa' : '⚫ Finalizada'}
                      </span>
                    </div>

                    {meet.endSessionTime && !meet.isActive && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Finalizada: {new Date(meet.endSessionTime).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    💬 {meet.messageCount} mensaje(s)
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewMeet(meet.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      <Eye size={16} />
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedMeet && (
          <MeetDetail meet={selectedMeet} onClose={() => setSelectedMeet(null)} />
        )}

        {showDeleteConfirm === 'all' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <AlertCircle size={24} />
                <h3 className="text-xl font-bold">Confirmar eliminación</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Estás seguro de que deseas eliminar <strong>TODO</strong> tu historial de conversaciones? 
                Esta acción no se puede deshacer y perderás todas tus conversaciones guardadas.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAllHistory}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Sí, eliminar todo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}