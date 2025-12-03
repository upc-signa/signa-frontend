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
  const [activeMeet, setActiveMeet] = useState(null);
  const [meetDetails, setMeetDetails] = useState(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  useEffect(() => {
    loadSessionInfo();
    // Recuperar y validar la sesión activa desde localStorage
    const savedMeet = localStorage.getItem('activeMeet');
    if (savedMeet) {
      try {
        const meetData = JSON.parse(savedMeet);
        // Verificar que la sesión aún exista en el backend
        meetService.getMeetById(meetData.id)
          .then((details) => {
            // La sesión existe, cargarla
            setActiveMeet(meetData);
            setMeetDetails(details);
          })
          .catch((error) => {
            console.error('Error al cargar sesión guardada:', error);
            // Si hay error (sesión eliminada), limpiar localStorage
            localStorage.removeItem('activeMeet');
            toast.info('La sesión guardada ya no existe', { toastId: 'session-not-found' });
          });
      } catch (error) {
        console.error('Error al recuperar sesión activa:', error);
        localStorage.removeItem('activeMeet');
      }
    }
  }, []);

  // Validar periódicamente que la sesión activa siga existente
  useEffect(() => {
    if (!activeMeet) return;

    // Verificar cada 30 segundos si la sesión sigue existiendo
    const interval = setInterval(async () => {
      try {
        const details = await meetService.getMeetById(activeMeet.id);
        // Actualizar detalles en caso de cambios
        setMeetDetails(details);
        
        // Verificar si la sesión ya expiró
        if (details.endSessionTime) {
          const endTime = new Date(details.endSessionTime);
          const now = new Date();
          if (now > endTime) {
            // La sesión ya expiró
            setActiveMeet(null);
            localStorage.removeItem('activeMeet');
            toast.warning('La sesión ha expirado', { toastId: 'session-expired' });
          }
        }
      } catch (error) {
        // Si hay error 404, probablemente la sesión fue eliminada
        console.error('Error al verificar sesión:', error);
        setActiveMeet(null);
        localStorage.removeItem('activeMeet');
        toast.warning('La sesión ya no está disponible', { toastId: 'session-unavailable' });
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [activeMeet]);

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
      console.log('Meet details:', details); // Debug: ver qué devuelve el backend
      setMeetDetails(details);
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

      console.log('✅ Meet creado - Respuesta del backend:', meet);
      console.log('📅 startTime:', meet.startTime);
      console.log('⏰ endSessionTime:', meet.endSessionTime);

      const meetUrl = `${window.location.origin}/meet/${meet.uuid}`;
      await navigator.clipboard.writeText(meetUrl);

      // Guardar el meet activo
      const activeMeetData = {
        ...meet,
        url: meetUrl,
        createdAt: new Date().toISOString()
      };
      
      setActiveMeet(activeMeetData);
      // Persistir en localStorage
      localStorage.setItem('activeMeet', JSON.stringify(activeMeetData));

      // Cargar detalles completos del meet
      loadMeetDetails(meet.id);

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

  const handleEndMeet = () => {
    if (!activeMeet) return;

    // Solo limpiar el estado local y localStorage (sin eliminar del backend)
    setActiveMeet(null);
    localStorage.removeItem('activeMeet');
    toast.success('Sesión finalizada exitosamente', { toastId: 'meet-ended' });
  };

  const handleCopyUrl = async () => {
    if (!activeMeet) return;

    try {
      await navigator.clipboard.writeText(activeMeet.url);
      toast.success('Enlace copiado al portapapeles', { toastId: 'url-copied' });
    } catch {
      toast.error('Error al copiar el enlace', { toastId: 'copy-error' });
    }
  };

  const handleJoinMeet = () => {
    if (!activeMeet) return;
    window.open(`/meet/${activeMeet.uuid}`, '_blank');
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
    <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 transition-colors duration-300">
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
        <div className="flex items-start justify-center gap-8 py-16 flex-wrap">
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

          {/* Card de sesión activa */}
          {activeMeet && (
            <div className="card rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-800 border-2 border-orange-200 w-full max-w-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Sesión Activa
                  </h3>
                </div>
                <button
                  onClick={handleEndMeet}
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
                  <span>Creada: {meetDetails?.createdAt ? formatDate(meetDetails.createdAt) : formatDate(activeMeet.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} className="text-orange-500" />
                  <span>Inicio: {meetDetails?.createdAt ? formatTime(meetDetails.createdAt) : formatTime(activeMeet.createdAt)}</span>
                </div>
                {meetDetails && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={16} className="text-orange-500" />
                    <span>Fin programado: {meetDetails.endSessionTime ? formatTime(meetDetails.endSessionTime) : 'Indefinido'}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Info size={16} className="text-orange-500" />
                  <span className="font-mono">ID: {activeMeet.uuid}</span>
                </div>
              </div>

              {/* URL con botón de copiar */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Enlace de la reunión:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activeMeet.url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-mono"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title="Copiar enlace"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={handleJoinMeet}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink size={18} />
                  Ingresar
                </button>
                <button
                  onClick={handleEndMeet}
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                  title="Finalizar"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Diálogo de programación de reunión */}
      <ScheduleMeetDialog
        isOpen={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        onConfirm={handleScheduleMeet}
      />
    </main>
  );
}