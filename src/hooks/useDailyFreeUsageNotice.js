import { useEffect, useState } from "react";
import { planService } from "../services/api/plan.service";
import { meetService } from "../services/api/meet.service";

const PREFS_KEY = "settings.prefs";
const DISMISS_KEY = "dailyNotice.dismissedDate";

function getPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getTargetDate(preferredTime) {
  const parts = preferredTime.split(":").map(Number);
  const hh = parts[0] || 0;
  const mm = parts[1] || 0;

  const target = new Date();
  target.setHours(hh, mm, 0, 0);
  return target;
}

export function useDailyFreeUsageNotice() {
  const [state, setState] = useState({
    loading: true,
    show: false,
    message: "",
    remaining: 0,
  });

  useEffect(() => {
    let mounted = true;
    let timeoutId = null;

    const scheduleAndEvaluate = async () => {
      try {
        const prefs = getPrefs();
        const preferredTime = prefs.preferredTime || "16:00";

        // Si no quiere notificación, apagamos todo
        if (prefs.dailyNotification === false) {
          if (mounted) {
            setState((s) => ({ ...s, loading: false, show: false }));
          }
          return;
        }

        const now = new Date();
        const target = getTargetDate(preferredTime);
        const msDiff = target.getTime() - now.getTime();

        // Si aún no llegamos a la hora -> programamos un timeout hasta ese momento
        if (msDiff > 0) {
          if (mounted) {
            // aseguramos que la notificación no esté visible si se cambió la hora al futuro
            setState((s) => ({ ...s, loading: false, show: false }));
          }
          timeoutId = setTimeout(scheduleAndEvaluate, msDiff);
          return;
        }

        // Ya estamos en o después de la hora preferida: ahora sí revisamos plan y saldo
        const today = getTodayStr();
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (dismissed === today) {
          if (mounted) {
            setState((s) => ({ ...s, loading: false, show: false }));
          }
          return;
        }

        const plan = await planService.getCurrentPlan().catch(() => null);
        if (!mounted || !plan) {
          if (mounted)
            setState((s) => ({ ...s, loading: false, show: false }));
          return;
        }

        const type = (plan.planType || "").toUpperCase();
        if (type && type !== "FREE") {
          if (mounted) {
            setState({
              loading: false,
              show: false,
              message: "",
              remaining: 0,
            });
          }
          return;
        }

        const r = await meetService.getFreeMeetsToday();
        const remaining = (r && (r.remaining ?? r.data?.remaining)) ?? 0;

        if (remaining <= 0) {
          if (mounted) {
            setState({
              loading: false,
              show: false,
              message: "",
              remaining,
            });
          }
          return;
        }

        const msg =
          remaining === 1
            ? "Tienes 1 traducción gratuita disponible hoy."
            : `Tienes ${remaining} traducciones gratuitas disponibles hoy.`;

        if (mounted) {
          setState({
            loading: false,
            show: true,
            message: msg,
            remaining,
          });
        }
      } catch (err) {
        console.error("Error dailyNotice:", err);
        if (mounted) {
          setState((s) => ({ ...s, loading: false, show: false }));
        }
      }
    };

    // Primera programación al montar
    scheduleAndEvaluate();

    // Cuando cambian las prefs (hora o toggle), reagendamos
    const onPrefsChanged = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      // Recalcular con la nueva hora / preferencias
      scheduleAndEvaluate();
    };

    window.addEventListener("settings:prefsChanged", onPrefsChanged);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("settings:prefsChanged", onPrefsChanged);
    };
  }, []);

  const dismissToday = () => {
    localStorage.setItem(DISMISS_KEY, getTodayStr());
    setState((s) => ({ ...s, show: false }));
  };

  return { ...state, dismissToday };
}