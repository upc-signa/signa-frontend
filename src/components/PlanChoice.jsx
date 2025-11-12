import React, { useState } from 'react';

/**
 * Modal para elegir plan inmediatamente después del registro.
 *
 * Props:
 * - onFree(): callback cuando el usuario decide quedarse en FREE
 * - onPremium(): callback cuando el usuario elige PREMIUM (normalmente te lleva a checkout)
 * - onClose(): (opcional) cerrar el modal sin decidir
 */
export default function PlanChoice({ onFree, onPremium, onClose }) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Elige tu plan para continuar
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded p-1 text-gray-400 hover:text-gray-600"
              title="Cerrar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div className="grid gap-4 px-6 py-5">
          <div className="rounded-xl border p-4">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Plan Free</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Actual
              </span>
            </div>
            <ul className="ml-4 list-disc text-sm text-gray-600">
              <li>Crear videollamadas (hasta 5 sesiones por semana)</li>
              <li>Duración máxima de 10 minutos por llamada</li>
              <li>Hasta 5 participantes por reunión</li>
              <li>Reconocimiento de gestos en tiempo real</li>
            </ul>
            <button
              onClick={onFree}
              className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Elegir Plan Free
            </button>
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Plan Premium</h3>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">
                Recomendado
              </span>
            </div>
            <ul className="ml-4 list-disc text-sm text-gray-600">
              <li>Videollamadas ilimitadas y en alta resolución</li>
              <li>Sin límite de duración ni cantidad de participantes</li>
              <li>Traducción avanzada de lenguaje de señas a voz y texto</li>
              <li>Soporte prioritario 24/7</li>
              <li>Acceso anticipado a nuevas funciones de IA</li>
            </ul>
            <button
              disabled={busy}
              onClick={async () => {
                try {
                  setBusy(true);
                  await onPremium();
                } finally {
                  setBusy(false);
                }
              }}
              className={`mt-3 w-full rounded-lg bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-900 ${busy ? 'opacity-80' : ''}`}
            >
              {busy ? 'Procesando…' : 'Elegir Premium (confirmación de pago)'}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Puedes suscribirte más tarde desde tu Perfil o Configuración.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
