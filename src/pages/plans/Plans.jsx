import { useEffect, useState } from 'react';
import { planService } from '../../services/api/plan.service';
import { useNavigate } from 'react-router-dom';

const BENEFITS = {
  FREE: [
    'Crear videollamadas (hasta 5 sesiones por semana)',
    'Duración máxima de 10 minutos por llamada',
    'Hasta 5 participantes por reunión',
    'Reconocimiento de gestos en tiempo real',
  ],
  PREMIUM: [
    'Videollamadas ilimitadas y en alta resolución',
    'Sin límite de duración ni cantidad de participantes',
    'Traducción avanzada de lenguaje de señas a voz y texto',
    'Soporte prioritario 24/7',
    'Acceso anticipado a nuevas funciones de IA',
  ],
};

export default function Plans() {
  const navigate = useNavigate();
  const [myPlan, setMyPlan] = useState(null);

  const load = async () => {
    try {
      const p = await planService.getCurrentPlan();
      setMyPlan(p);
    } catch {
      setMyPlan(null);
    }
  };

  useEffect(() => { load(); }, []);

  const isPremium = myPlan?.planType === 'PREMIUM' && myPlan?.active;

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center text-orange-500 mb-2">Elige tu plan</h1>
      <p className="text-center text-gray-600 mb-10">
        Selecciona el plan que mejor se adapte a tus necesidades.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Free */}
        <div className="rounded-2xl border shadow-sm p-6 card">
          <h3 className="text-xl font-semibold mb-1">Free</h3>
          <p className="text-sm muted text-gray-500 mb-4">Perfecto para empezar</p>
          <div className="text-3xl font-bold mb-4">$0 <span className="text-base font-normal">/ mes</span></div>
          <ul className="space-y-2 mb-6 text-sm">
            {BENEFITS.FREE.map((b) => <li key={b}>✓ {b}</li>)}
          </ul>
          <button
            disabled
            className="w-full bg-gray-100 text-gray-400 rounded-lg py-3"
          >
            Gratis
          </button>
        </div>

        {/* Premium */}
        <div className="rounded-2xl border-2 border-orange-300 shadow p-6">
          <h3 className="text-xl font-semibold mb-1">Premium</h3>
          <p className="text-sm text-gray-500 mb-4">Para mejor experiencia</p>
          <div className="text-3xl font-bold mb-4">$9.99 <span className="text-base font-normal">/ mes</span></div>
          <ul className="space-y-2 mb-6 text-sm">
            {BENEFITS.PREMIUM.map((b) => <li key={b}>✓ {b}</li>)}
          </ul>

          {isPremium ? (
            <button className="w-full bg-green-500 text-white rounded-lg py-3">
              Ya eres Premium
            </button>
          ) : (
            <button
            onClick={() => navigate('/checkout?plan=premium')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 disabled:opacity-60"
            >
            Actualizar a Premium
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
