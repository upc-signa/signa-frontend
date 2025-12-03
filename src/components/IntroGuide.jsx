// src/components/IntroGuide.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STEPS = [
  {
    id: "welcome",
    title: "Bienvenido a SIGNA 👋",
    description:
      "Te guiaremos por las funciones principales para que puedas usar SIGNA con confianza desde tu primera sesión.",
    route: "/",
    target: null,
  },
  {
    id: "home-sessions",
    title: "Sesiones disponibles hoy",
    description:
      "En este panel ves cuántas sesiones gratuitas tienes hoy, cuántas ya usaste y un resumen visual de tu uso diario.",
    route: "/",
    target: "sessions-banner",
  },
  {
    id: "home-new-meet",
    title: "Crear nueva reunión",
    description:
      "Haz clic aquí para crear tu próxima sesión de interpretación o traducción. Podrás programar la hora y compartir el enlace con tus participantes.",
    route: "/",
    target: "translation",
  },
  {
    id: "home-active-meet",
    title: "Sesión activa",
    description:
      "Cuando tengas una reunión creada, aquí verás sus datos principales, podrás copiar el enlace de acceso, ingresar a la sala y finalizar la sesión cuando termine.",
    route: "/",
    target: "active-session",
  },
  {
    id: "user-menu",
    title: "Menú de usuario",
    description:
      "Desde este menú accedes rápido a tu perfil, historial de conversaciones, configuración de la cuenta, esta guía inicial y la opción de cerrar sesión.",
    route: "/",
    target: "user-menu",
  },
  {
    id: "profile",
    title: "Sección Perfil",
    description:
      "En Perfil puedes actualizar tus datos personales, ajustar subtítulos y tamaño de texto, y revisar el estado de tu plan actual (Free o Premium).",
    route: "/profile",
    target: null,
  },
  {
    id: "history",
    title: "Historial de conversaciones",
    description:
      "Aquí encuentras tus reuniones anteriores, puedes filtrarlas por fecha o contenido y revisar el detalle de cada conversación cuando lo necesites.",
    route: "/history",
    target: null,
  },
  {
    id: "settings",
    title: "Configuración de la cuenta",
    description:
      "En Configuración eliges el tema claro u oscuro, ajustas el recordatorio diario de uso y decides si quieres que la sincronización de datos sea automática.",
    route: "/settings",
    target: null,
  },
];

export default function IntroGuide({ onFinish }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  const step = STEPS[stepIndex];
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ⛔ Si la guía está cerrada, no hacemos NADA
    if (!isOpen) return;

    let intervalId = null;

    setHighlightRect(null);

    // 1) Navegar a la ruta del paso
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
      return;
    }

    // 2) Si no hay target, solo mostramos el modal centrado
    if (!step.target) return;

    const tryFind = () => {
      const el = document.querySelector(
        `[data-tour-id="${step.target}"]`
      );
      if (!el) return false;

      const rect = el.getBoundingClientRect();
      setHighlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      return true;
    };

    let attempts = 0;
    const maxAttempts = 20;

    intervalId = window.setInterval(() => {
      attempts += 1;
      const found = tryFind();
      if (found || attempts >= maxAttempts) {
        window.clearInterval(intervalId);
      }
    }, 50);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isOpen, step.id, step.target, step.route, location.pathname, navigate]);

  const closeGuide = () => {
    onFinish?.();     // marca como vista (localStorage, etc.)
    setIsOpen(false); // deja de mostrarla y el effect se “apaga”
  };

  const handleNext = () => {
    if (stepIndex === STEPS.length - 1) {
      // 👆 pequeño bug: antes tenías `STEPS.length + -1`
      closeGuide();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleSkipForever = () => {
    closeGuide();
  };

  // Si está cerrada, no renderizamos nada
  if (!isOpen) {
    return null;
  }

  // posición de la card
  let cardStyle = {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };

  if (highlightRect) {
    const margin = 16;
    cardStyle = {
      top: highlightRect.top + highlightRect.height + margin,
      left: highlightRect.left + highlightRect.width / 2,
      transform: "translateX(-50%)",
    };
  }

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" />

      {highlightRect && (
        <div
          className="absolute rounded-xl ring-4 ring-orange-400 pointer-events-none bg-transparent"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
          }}
        />
      )}

      <div
        className="absolute bg-white rounded-2xl shadow-xl px-6 py-5 max-w-md text-sm text-gray-800"
        style={cardStyle}
      >
        <h2 className="text-lg font-bold text-orange-500 mb-2">
          {step.title}
        </h2>
        <p className="mb-4 leading-relaxed">{step.description}</p>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleSkipForever}
            className="text-gray-400 hover:text-gray-600"
          >
            No mostrar más
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
          >
            {stepIndex === STEPS.length - 1 ? "Finalizar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}