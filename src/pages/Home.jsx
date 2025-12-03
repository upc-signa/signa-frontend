import { useEffect, useState } from 'react';
import { BookMarked, Info, Crown, Copy, ExternalLink, XCircle, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { meetService } from '../services/api/meet.service';
import { planService } from '../services/api/plan.service';
import ScheduleMeetDialog from '../components/ScheduleMeetDialog';

export default function Home() {
  const [sessionsUsed, setSessionsUsed] = useState(0);
  const [maxSessions, setMaxSessions] = useState(2);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(true);
  const [activeMeets, setActiveMeets] = useState([]);
  const [meetsDetails, setMeetsDetails] = useState({});
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEndMeetDialog, setShowEndMeetDialog] = useState(false);
  const [meetToEnd, setMeetToEnd] = useState(null);

  useEffect(() => {
    loadSessionInfo();
    loadActiveMeets();
  }, []);

  const loadActiveMeets = async () => {
    // Recuperar y validar las sesiones activas desde localStorage
    const savedMeets = localStorage.getItem('activeMeets');
    if (savedMeets) {
      try {
        const meetsData = JSON.parse(savedMeets);
        const validMeets = [];
        const detailsMap = {};

        // Verificar cada sesión en el backend
        for (const meetData of meetsData) {
          try {
            const details = await meetService.getMeetById(meetData.id);
            validMeets.push(meetData);
            detailsMap[meetData.id] = details;
          } catch (error) {
            console.error('Sesión no encontrada:', meetData.id);
          }
        }

        setActiveMeets(validMeets);
        setMeetsDetails(detailsMap);

        // Actualizar localStorage con solo las sesiones válidas
        if (validMeets.length !== meetsData.length) {
          localStorage.setItem('activeMeets', JSON.stringify(validMeets));
        }
      } catch (error) {
        console.error('Error al recuperar sesiones activas:', error);
        localStorage.removeItem('activeMeets');
      }
    }
  };

  // Validar periódicamente que las sesiones activas sigan existentes
  useEffect(() => {
    if (activeMeets.length === 0) return;

    // Verificar cada 30 segundos si las sesiones siguen existiendo
    const interval = setInterval(async () => {
      const validMeets = [];
      const updatedDetails = { ...meetsDetails };
      let hasChanges = false;

      for (const meet of activeMeets) {
        try {
          const details = await meetService.getMeetById(meet.id);
          updatedDetails[meet.id] = details;

          // Verificar si la sesión ya expiró
          if (details.endSessionTime) {
            const endTime = new Date(details.endSessionTime);
            const now = new Date();
            if (now > endTime) {
              // La sesión ya expiró, no incluirla
              hasChanges = true;
              continue;
            }
          }
          validMeets.push(meet);
        } catch (error) {
          // Si hay error 404, la sesión fue eliminada
          console.error('Error al verificar sesión:', error);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setActiveMeets(validMeets);
        localStorage.setItem('activeMeets', JSON.stringify(validMeets));
        if (activeMeets.length !== validMeets.length) {
          toast.info('Algunas sesiones han expirado o fueron eliminadas', { toastId: 'sessions-updated' });
        }
      }

      setMeetsDetails(updatedDetails);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [activeMeets]);

  const loadSessionInfo = async () => {
    try {
      setLoading(true);

      // Verificar plan del usuario
      const plan = await planService.getCurrentPlan().catch(() => null);
      const premium = plan?.planType === 'PREMIUM' && plan?.active;
      setIsPremium(premium);

      if (premium) {
        // Usuario Premium: sesiones ilimitadas
        setMaxSessions(Infinity);
        setSessionsUsed(0);
        setCanCreate(true);
      } else {
        // Usuario Free: obtener sesiones usadas hoy
        const response = await meetService.getFreeMeetsToday();
        const used = response?.meetsCreatedToday || 0;
        const max = response?.maxAllowed || 2;
        const remaining = response?.remaining || 0;

        setSessionsUsed(used);
        setMaxSessions(max);
        setCanCreate(remaining > 0);
      }
    } catch {
      toast.error('Error al cargar información de sesiones', { toastId: 'load-session-error' });
      setCanCreate(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMeetDetails = async (meetId) => {
    try {
      const details = await meetService.getMeetById(meetId);
      setMeetsDetails(prev => ({
        ...prev,
        [meetId]: details
      }));
    } catch (error) {
      console.error('Error al cargar detalles del meet:', error);
    }
  };

  const handleCreateMeet = () => {
    if (!canCreate && !isPremium) {
      toast.warning('Has alcanzado el límite de sesiones diarias. Actualiza a Premium para sesiones ilimitadas.', { toastId: 'session-limit' });
      return;
    }

    // Abrir el diálogo de programación
    setShowScheduleDialog(true);
  };

  const handleScheduleMeet = async (startTime) => {
    try {
      const meet = await meetService.createNewMeet({
        startTime: startTime
      });

      const meetUrl = `${window.location.origin}/meet/${meet.uuid}`;
      await navigator.clipboard.writeText(meetUrl);

      // Agregar la nueva reunión a la lista
      const newMeetData = {
        ...meet,
        url: meetUrl,
        createdAt: new Date().toISOString()
      };
      
      const updatedMeets = [...activeMeets, newMeetData];
      setActiveMeets(updatedMeets);
      
      // Persistir en localStorage
      localStorage.setItem('activeMeets', JSON.stringify(updatedMeets));

      // Cargar detalles completos del meet
      await loadMeetDetails(meet.id);

      toast.success('¡Reunión creada exitosamente! El enlace ha sido copiado.', { toastId: 'meet-created' });

      if (!isPremium) {
        const newSessionsUsed = sessionsUsed + 1;
        const remaining = maxSessions - newSessionsUsed;
        setSessionsUsed(newSessionsUsed);
        setCanCreate(remaining > 0);
      }

      // Cerrar el diálogo
      setShowScheduleDialog(false);
    } catch {
      toast.error('Error al crear la sesión', { toastId: 'create-meet-error' });
    }
  };

  const handleEndMeet = (meet) => {
    setMeetToEnd(meet);
    setShowEndMeetDialog(true);
  };

  const confirmEndMeet = async () => {
    if (!meetToEnd) return;

    try {
      // Finalizar la sesión en el backend
      await meetService.endMeet(meetToEnd.id);
      
      // Remover de la lista de sesiones activas
      const updatedMeets = activeMeets.filter(m => m.id !== meetToEnd.id);
      setActiveMeets(updatedMeets);
      localStorage.setItem('activeMeets', JSON.stringify(updatedMeets));
      
      setShowEndMeetDialog(false);
      setMeetToEnd(null);
      toast.success('Sesión finalizada exitosamente', { toastId: 'meet-ended' });
    } catch (error) {
      console.error('Error al finalizar sesión:', error);
      toast.error('Error al finalizar la sesión', { toastId: 'meet-end-error' });
      setShowEndMeetDialog(false);
      setMeetToEnd(null);
    }
  };

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles', { toastId: 'url-copied' });
    } catch {
      toast.error('Error al copiar el enlace', { toastId: 'copy-error' });
    }
  };

  const handleJoinMeet = (uuid) => {
    window.open(`/meet/${uuid}`, '_blank');
  };

  const formatDate = (dateString) => {
    // Asegurar que la fecha tenga "Z" para indicar UTC
    const isoString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(isoString);
    // Ajustar a hora de Perú (UTC-5)
    const peruDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    return peruDate.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatTime = (dateString) => {
    // Asegurar que la fecha tenga "Z" para indicar UTC
    const isoString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(isoString);
    // Ajustar a hora de Perú (UTC-5)
    const peruDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    return peruDate.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  const sessionsRemaining = isPremium ? '∞' : Math.max(0, maxSessions - sessionsUsed);

  return (
    <main className="h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Banner de información de sesiones */}
        <div className="mb-8">
          {isPremium ? (
            <div className="card rounded-2xl shadow-md p-6 bg-linear-to-r from-orange-50 to-yellow-50 border-2 border-orange-200">
              <div className="flex items-center gap-3">
                <Crown className="text-orange-500" size={32} />
                <div>
                  <h2 className="text-xl font-bold text-orange-600 mb-1">
                    Plan Premium Activo
                  </h2>
                  <p className="text-gray-700">
                    ✨ Disfruta de sesiones ilimitadas sin restricciones
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card rounded-2xl shadow-md p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Info className="text-orange-500 shrink-0" size={24} />
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                      Sesiones disponibles hoy
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Plan gratuito: máximo 2 sesiones por día
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-orange-500">
                      {loading ? '...' : sessionsRemaining}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Restantes
                    </div>
                  </div>

                  <div className="h-12 w-px bg-gray-300" />

                  <div className="text-center">
                    <div className="text-3xl font-black text-gray-400">
                      {loading ? '...' : sessionsUsed}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Usadas
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${(sessionsUsed / maxSessions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Mensaje de límite alcanzado */}
              {!canCreate && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ Has alcanzado el límite diario de sesiones gratuitas.
                  </p>
                </div>
              )}

              {/* Call to action Premium */}
              {sessionsUsed >= 1 && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-orange-800 mb-1">
                        ¿Necesitas más sesiones?
                      </p>
                      <p className="text-sm text-orange-700">
                        Actualiza a Premium y obtén sesiones ilimitadas
                      </p>
                    </div>
                    <Link
                      to="/plans"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <Crown size={16} />
                      Ver Planes
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón de crear reunión */}
        <div className="mb-8">
          <div className="flex justify-center">
            <button
              type="button"
              className={`group flex flex-col items-center gap-2 ${!canCreate && !isPremium ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onClick={handleCreateMeet}
              disabled={!canCreate && !isPremium}
            >
              <div
                className={`rounded-xl p-6 bg-[#ff6b3d] text-white shadow-md transition ${canCreate || isPremium
                  ? 'group-hover:shadow-lg group-hover:scale-105'
                  : ''
                  }`}
              >
                <BookMarked size={44} />
              </div>
              <span className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                {!canCreate && !isPremium
                  ? 'Límite de sesiones alcanzado'
                  : 'Nueva reunión'}
              </span>
            </button>
          </div>
        </div>

        {/* Lista de sesiones activas/programadas */}
        {activeMeets.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Mis Reuniones ({activeMeets.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMeets.map((meet) => {
                const details = meetsDetails[meet.id];
                return (
                  <div
                    key={meet.id}
                    className="card rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border-2 border-orange-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                          (() => {
                            if (!details?.startTime) return 'bg-green-500';
                            const startTime = new Date(details.startTime.endsWith('Z') ? details.startTime : details.startTime + 'Z');
                            const now = new Date();
                            return now >= startTime ? 'bg-green-500' : 'bg-blue-500';
                          })()
                        }`}></div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          {(() => {
                            if (!details?.startTime) return 'Sesión Activa';
                            const startTime = new Date(details.startTime.endsWith('Z') ? details.startTime : details.startTime + 'Z');
                            const now = new Date();
                            return now >= startTime ? 'Sesión Activa' : 'Sesión Programada';
                          })()}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleEndMeet(meet)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Finalizar sesión"
                      >
                        <XCircle size={24} />
                      </button>
                    </div>

                    {/* Información de la sesión */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={16} className="text-orange-500" />
                        <span>Creada: {details?.createdAt ? formatDate(details.createdAt) : formatDate(meet.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={16} className="text-orange-500" />
                        <span>Inicio: {details?.startTime ? formatTime(details.startTime) : (meet.startTime ? formatTime(meet.startTime) : 'No definido')}</span>
                      </div>
                      {details?.endSessionTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock size={16} className="text-orange-500" />
                          <span>Fin: {formatTime(details.endSessionTime)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Info size={16} className="text-orange-500" />
                        <span className="font-mono text-xs">{meet.uuid}</span>
                      </div>
                    </div>

                    {/* URL con botón de copiar */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                        Enlace:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={meet.url}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 font-mono overflow-hidden text-ellipsis"
                        />
                        <button
                          onClick={() => handleCopyUrl(meet.url)}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title="Copiar enlace"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Botón de ingresar */}
                    <button
                      onClick={() => handleJoinMeet(meet.uuid)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={18} />
                      Ingresar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {activeMeets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No tienes reuniones activas. Crea una nueva para comenzar.
            </p>
          </div>
        )}
      </section>

      {/* Diálogo de programación de reunión */}
      <ScheduleMeetDialog
        isOpen={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        onConfirm={handleScheduleMeet}
      />

      {/* Diálogo de confirmación para finalizar sesión */}
      {showEndMeetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              ¿Finalizar sesión?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Esta acción finalizará la reunión y la removerá de tu vista principal. Los detalles de sesión estarán disponibles en el historial.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEndMeetDialog(false);
                  setMeetToEnd(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEndMeet}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}