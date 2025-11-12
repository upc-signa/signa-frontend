import { useMemo, useState } from "react";
import { planService } from "../services/api/plan.service";
import { toast } from "react-toastify";

/**
 * Modal de pago para el flujo de registro.
 * Props:
 * - plan: "PREMIUM" | "FREE" (default "PREMIUM")
 * - email: correo usado en el registro (para redirigir a verificación luego)
 * - onConfirmSuccess(): callback cuando el pago/upgrade se completa OK
 * - onClose(): cerrar modal (ej. volver a PlanChoice)
 */
export default function CheckoutModal({ plan = "PREMIUM", email, onConfirmSuccess, onClose }) {
  const [paying, setPaying] = useState(false);
  const price = useMemo(() => (plan === "PREMIUM" ? 9.99 : 0), [plan]);
  const tax = +(price * 0.18).toFixed(2);
  const total = +(price + tax).toFixed(2);

  const onConfirm = async () => {
    try {
      setPaying(true);

      // usar el token temporal del registro SOLO para el upgrade
      const regToken = localStorage.getItem("reg_token");
      if (regToken) localStorage.setItem("token", regToken);

      await planService.upgradeToPremium();

      toast.success("¡Pago exitoso! Ya eres Premium.");

      // limpiar tokens para no saltarse verificación de correo
      localStorage.removeItem("token");
      localStorage.removeItem("reg_token");

      // avisar al contenedor (Register.jsx) que ya puede ir a /verification-code
      onConfirmSuccess?.();
    } catch (e) {
      const s = e?.response?.status;
      if (s === 400) toast.info("Ya tienes Premium activo.");
      else if (s === 401) toast.error("Sesión inválida. Vuelve a intentar.");
      else toast.error("No se pudo procesar el pago.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Completa tu suscripción</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600" title="Cerrar">✕</button>
        </div>

        {/* Body */}
        <div className="grid md:grid-cols-[1fr_340px] gap-6 p-6">
          {/* Formulario visual */}
          <section className="rounded-xl border p-6">
            <h3 className="text-sm font-semibold text-orange-500 mb-4">Información de Pago</h3>

            <form autoComplete="off" className="space-y-4">
              <div>
                <label className="text-xs text-gray-500">Número de Tarjeta</label>
                <input className="w-full bg-gray-50 border rounded-md px-3 py-2" placeholder="1234 5678 9012 3456" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Nombre en la Tarjeta</label>
                <input className="w-full bg-gray-50 border rounded-md px-3 py-2" placeholder="Juan Pérez" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Fecha de Expiración</label>
                  <input className="w-full bg-gray-50 border rounded-md px-3 py-2" placeholder="MM/AA" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">CVV</label>
                  <input className="w-full bg-gray-50 border rounded-md px-3 py-2" placeholder="123" />
                </div>
              </div>

              <h4 className="text-sm font-semibold text-orange-500 mt-2">Información de Facturación</h4>
              <div className="grid grid-cols-2 gap-3">
                <input className="col-span-2 bg-gray-50 border rounded-md px-3 py-2" placeholder="Email" defaultValue={email} />
                <input className="bg-gray-50 border rounded-md px-3 py-2" placeholder="País" />
                <input className="bg-gray-50 border rounded-md px-3 py-2" placeholder="Código Postal" />
                <input className="col-span-2 bg-gray-50 border rounded-md px-3 py-2" placeholder="Dirección" />
              </div>
            </form>
          </section>

          {/* Resumen */}
          <aside className="rounded-xl border p-6">
            <h3 className="text-sm font-semibold mb-3">Resumen</h3>

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Plan</span>
                <span className="text-xs bg-black text-white px-2 py-0.5 rounded">Mensual</span>
              </div>
              <div className="text-sm">{plan === "PREMIUM" ? "Premium" : "Free"}</div>
              <ul className="text-sm mt-2 space-y-1">
                <li>✓ Acceso completo a la plataforma</li>
                <li>✓ Proyectos ilimitados</li>
                <li>✓ Soporte prioritario 24/7</li>
              </ul>
            </div>

            <div className="text-sm space-y-1 border-t pt-3">
              <div className="flex justify-between"><span>Subtotal</span><span>${price.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>IGV (18%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold pt-1"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>

            <button
              onClick={onConfirm}
              disabled={paying}
              className="w-full mt-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white py-3 disabled:opacity-60"
            >
              {paying ? "Procesando…" : "Confirmar Pago"}
            </button>
            <button
              onClick={onClose}
              disabled={paying}
              className="w-full mt-3 rounded-lg border border-gray-300 py-3"
            >
              Cancelar
            </button>

            <p className="mt-3 text-xs text-gray-500 text-center">
              También podrás suscribirte más tarde desde tu Perfil → Planes.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
