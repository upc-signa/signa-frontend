import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, ChevronDown, UserRound, Cog, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { authService } from "../services/api/auth.service";
import { profileService } from "../services/api/profile.service";
import { toast } from "react-toastify";

function getUserInitial() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payloadB64 = token.split(".")[1];
    if (!payloadB64) return null;
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(decodeURIComponent(escape(json)));

    const firstName = payload?.firstName || payload?.given_name;
    const email = payload?.email || payload?.sub || "";
    const base = (firstName && String(firstName)) || String(email);
    const ch = base.trim().charAt(0);
    return ch ? ch.toUpperCase() : null;
  } catch {
    return null;
  }
}

export default function Topbar() {
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem("avatarUrl") || ""); // ✅ lee desde localStorage
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const userInitial = useMemo(getUserInitial, []);

  useEffect(() => {
    (async () => {
      if (!profilePic) {
        try {
          const user = await profileService.getMyProfile();
          if (user.profilePicturePath) {
            const url = profileService.pictureUrl(user.profilePicturePath);
            setProfilePic(url);
            localStorage.setItem("avatarUrl", url);
          }
        } catch {
          toast.error("Error al cargar avatar");
        }
      }
    })();

    const onAvatarChanged = (e) => setProfilePic(e.detail || "");
    window.addEventListener("avatar:changed", onAvatarChanged);

    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setOpenUser(false);
    };
    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("avatar:changed", onAvatarChanged);
    };
  }, [profilePic]);

  return (
    <header className="w-full border-b bg-[#ff6b3d] text-black">
      <div className="max-w-6xl mx-auto h-12 flex items-center justify-between px-4">
        <Link
          to="/"
          className="font-semibold tracking-wide hover:opacity-90 transition"
          aria-label="Ir al inicio"
        >
          SIGNA
        </Link>

        <div className="flex items-center gap-3">
          {/* Campana */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2 rounded-md hover:bg-white/20 transition"
              aria-label="Notificaciones"
              type="button"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-lg p-2 z-20">
                <div className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                  <div className="mt-1"><Bell size={14} /></div>
                  <div className="text-sm">Tu plan se va a vencer pronto.</div>
                </div>
                <div className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                  <div className="mt-1"><Bell size={14} /></div>
                  <div className="text-sm">Recuerda usar tus sesiones restantes.</div>
                </div>
              </div>
            )}
          </div>

          {/* Menú usuario */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setOpenUser((v) => !v)}
              className="flex items-center gap-1 bg-white/30 hover:bg-white/40 px-2 py-1 rounded-full"
              aria-haspopup="menu"
              type="button"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Usuario"
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white grid place-items-center text-xs font-semibold">
                  {userInitial ? userInitial : <UserRound size={14} />}
                </div>
              )}
              <ChevronDown size={16} />
            </button>

            {openUser && (
              <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden z-20">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                  onClick={() => setOpenUser(false)}
                >
                  <UserRound size={16} /> Perfil
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                  onClick={() => setOpenUser(false)}
                >
                  <Cog size={16} /> Configuración
                </Link>
                <button
                  type="button"
                  onClick={authService.logout}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 text-left border-t border-gray-100"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}