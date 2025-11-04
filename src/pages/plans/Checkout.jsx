import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { planService } from "../../services/api/plan.service";
import { toast } from "react-toastify";

export default function Checkout() {
  const [sp] = useSearchParams();
  const plan = (sp.get("plan") || "premium").toUpperCase();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);

  const price = useMemo(() => (plan === "PREMIUM" ? 9.99 : 0), [plan]);
  const tax = +(price * 0.18).toFixed(2);
  const total = +(price + tax).toFixed(2);

  const onConfirm = async () => {
    try {
      setPaying(true);
      await planService.upgradeToPremium();
      toast.success("¡Pago exitoso! Ya eres Premium.");
      navigate("/profile", { replace: true });
    } catch (e) {
      const s = e?.response?.status;
      if (s === 400) toast.info("Ya tienes Premium activo.");
      else if (s === 401) toast.error("Tu sesión expiró. Inicia sesión.");
      else toast.error("No se pudo procesar el pago.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-extrabold text-orange-500 text-center">Elige tu plan</h1>
        <p className="text-center text-gray-500 mb-8">Completa tu información para finalizar la suscripción</p>

        <div className="grid md:grid-cols-[1fr_340px] gap-6">
          {/* Formulario visual */}
          <section className="card relative rounded-xl border p-6">
            <h3 className="text-sm font-semibold text-orange-500 mb-4">Información de Pago</h3>

            <form autoComplete="off" className="space-y-4">
              <div>
                <label className="text-xs text-gray-500">Número de Tarjeta</label>
                <input className="input w-full bg-gray-50 border rounded-md px-3 py-2" placeholder="1234 5678 9012 3456" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Nombre en la Tarjeta</label>
                <input className="input w-full bg-gray-50 border rounded-md px-3 py-2" placeholder="Juan Pérez" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Fecha de Expiración</label>
                  <input className="input w-full bg-gray-50 border rounded-md px-3 py-2" placeholder="MM/AA" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">CVV</label>
                  <input className="input w-full bg-gray-50 border rounded-md px-3 py-2" placeholder="123" />
                </div>
              </div>

              <h4 className="text-sm font-semibold text-orange-500 mt-2">Información de Facturación</h4>
              <div className="grid grid-cols-2 gap-3">
                <input className="input col-span-2" placeholder="Email" />
                <input className="input" placeholder="País" />
                <input className="input" placeholder="Código Postal" />
                <input className="input col-span-2" placeholder="Dirección" />
              </div>
            </form>
          </section>

          {/* Resumen */}
          <aside className="card relative rounded-xl border p-6">
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
              <div className="flex justify-between"><span>IGV(18%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold pt-1"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>

            <button
              onClick={onConfirm}
              disabled={paying}
              className="btn-primary w-full mt-5"
            >
              {paying ? "Procesando…" : "Confirmar Pago"}
            </button>
          </aside>
        </div>
      </main>
    </>
  );
}
