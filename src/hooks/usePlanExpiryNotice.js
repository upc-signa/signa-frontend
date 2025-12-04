import { useEffect, useState } from "react";
import { planService } from "../services/api/plan.service";
import {
  daysUntil,
  isDismissedForToday,
  dismissForToday,
  isNoExpiry
} from "../utils/planExpiry";

export function usePlanExpiryNotice() {
  const [state, setState] = useState({
    loading: true,
    show: false,
    message: "",
    daysLeft: null,
    expired: false,
    endDate: null
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const plan = await planService.getCurrentPlan().catch(() => null);
        if (!mounted || !plan) {
          setState((s) => ({ ...s, loading: false, show: false }));
          return;
        }

        // 1) Si es FREE o tratado como "sin vencimiento" -> no mostrar
        if (isNoExpiry(plan)) {
          setState({
            loading: false,
            show: false,
            message: "",
            daysLeft: null,
            expired: false,
            endDate: null
          });
          return;
        }

        // 2) Solo alertamos para PREMIUM
        if ((plan.planType || "").toUpperCase() !== "PREMIUM") {
          setState({
            loading: false,
            show: false,
            message: "",
            daysLeft: null,
            expired: false,
            endDate: null
          });
          return;
        }

        const d = daysUntil(plan.endDate);
        const dismissed = isDismissedForToday(plan.endDate);

        // 3) Vencido
        if (plan.expired || (typeof d === "number" && d < 0)) {
          setState({
            loading: false,
            show: !dismissed,
            message: "Tu plan ha vencido. Renueva para mantener el acceso.",
            daysLeft: d ?? null,
            expired: true,
            endDate: plan.endDate
          });
          return;
        }

        const windowDays = 33;
        // 4) Por vencer: hoy o en 0..windowDays
        if (typeof d === "number" && d >= 0 && d <= windowDays && !dismissed) {
          const msg =
            d === 0
              ? "Tu plan vence hoy."
              : `Tu plan se vence en ${d} día${d === 1 ? "" : "s"}.`;
          setState({
            loading: false,
            show: true,
            message: msg,
            daysLeft: d,
            expired: false,
            endDate: plan.endDate
          });
          return;
        }

        // 5) Fuera de rango: no mostrar
        setState({
          loading: false,
          show: false,
          message: "",
          daysLeft: d ?? null,
          expired: false,
          endDate: plan.endDate
        });
      } catch {
        setState((s) => ({ ...s, loading: false, show: false }));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const dismissToday = () => {
    if (state.endDate) dismissForToday(state.endDate);
    setState((s) => ({ ...s, show: false }));
  };

  return { ...state, dismissToday };
}