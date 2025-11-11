import { useEffect, useState } from 'react';
import { BookMarked, Info, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { meetService } from '../services/api/meet.service';
import { planService } from '../services/api/plan.service';

export default function Home() {
  const [sessionsUsed, setSessionsUsed] = useState(0);
  const [maxSessions, setMaxSessions] = useState(2);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(true);

  useEffect(() => {
    loadSessionInfo();
  }, []);

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
      toast.error('Error al cargar información de sesiones');
      setCanCreate(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeet = async () => {
    if (!canCreate && !isPremium) {
      toast.warning('Has alcanzado el límite de sesiones diarias. Actualiza a Premium para sesiones ilimitadas.');
      return;
    }

    try {
      // Aquí iría la lógica para crear el meet
      // Por ahora solo mostramos un mensaje
      toast.info('Funcionalidad de crear meet en desarrollo');
      // await meetService.createMeet({ /* datos del meet */ });
      // await loadSessionInfo(); // Recargar info después de crear
    } catch {
      toast.error('Error al crear la sesión');
    }
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
        <div className="flex items-center justify-center py-16">
          <button
            type="button"
            className={`group flex flex-col items-center gap-2 ${
              !canCreate && !isPremium ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleCreateMeet}
            disabled={!canCreate && !isPremium}
          >
            <div
              className={`rounded-xl p-6 bg-[#ff6b3d] text-white shadow-md transition ${
                canCreate || isPremium
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
      </section>
    </main>
  );
}