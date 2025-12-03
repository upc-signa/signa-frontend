// src/pages/settings/Settings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import Toggle from '../../components/Toggle';

const STORAGE = 'settings.prefs';

export default function Settings() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  // Cargar desde localStorage en el estado inicial
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      /* ignore */
    }
    // Si no hay nada guardado, usamos el default
    return {
      dailyNotification: true,
      preferredTime: '16:00',
      autoSync: true,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(prefs));

    window.dispatchEvent(
      new CustomEvent("settings:prefsChanged", { detail: prefs })
    );
  }, [prefs]);

  const flip = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <main className="max-w-5xl mx-auto px-4 py-8" data-tour-id="settings-page">
      <h1 className="text-3xl font-extrabold text-orange-500 mb-6">Configuración</h1>

      <div className="relative">
        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-black/10 dark:bg-black/30 pointer-events-none" />
        
        <section className="card relative">
          {/* Tema */}
          <div className="mb-8">
            <div className="uppercase text-xs tracking-widest text-orange-500 mb-1">Tema</div>

            <div className="flex items-center gap-4">
              <Toggle
                checked={isDark}
                onChange={() => toggle()}
                label={isDark ? 'Modo oscuro' : 'Modo claro'}
              />
            </div>
          </div>

          {/* Notificación de uso diario */}
          <div className="mb-8">
            <div className="uppercase text-xs tracking-widest text-orange-500 mb-1">
              Notificación de uso diario
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefs.dailyNotification}
                  onChange={() => flip('dailyNotification')}
                  className="h-4 w-4 accent-orange-500"
                />
                Activar recordatorio diario
              </label>

              {/* Hora preferida */}
              <div className="text-sm flex items-center gap-2">
                <span className="muted">Horario preferido:</span>
                  <input
                    type="time"
                    value={prefs.preferredTime}
                    onChange={(e) =>
                      setPrefs(p => ({
                        ...p,
                        preferredTime: e.target.value.slice(0, 5),
                      }))
                    }
                    disabled={!prefs.dailyNotification}
                    className={`select transition ${
                      !prefs.dailyNotification ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                    step="900"
                  />
              </div>
            </div>
          </div>

          {/* Datos sincronizados */}
          <div className="mb-10">
            <div className="uppercase text-xs tracking-widest text-orange-500 mb-1">
              Datos sincronizados
            </div>
            <Toggle
              checked={prefs.autoSync}
              onChange={(v) => setPrefs(p => ({ ...p, autoSync: v }))}
              label="Sincronización automática"
            />
          </div>

          {/* Cambiar de plan */}
          <div>
            <Link
              to="/plans"
              className="text-sm inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg shadow"
            >
              Cambiar de plan
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}