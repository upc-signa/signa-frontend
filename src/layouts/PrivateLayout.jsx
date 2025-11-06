import { useEffect, useState } from "react";
import ThemeProvider from "../theme/ThemeProvider";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import { profileService } from "../services/api/profile.service";

export default function PrivateLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await profileService.getMyProfile();
        const size = me?.textSize === "GRANDE" ? "GRANDE" : "NORMAL";
        document.documentElement.setAttribute("data-textsize", size);
      } catch {
        document.documentElement.setAttribute("data-textsize", "NORMAL");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        <Topbar />
        <Outlet />
      </div>
    </ThemeProvider>
  );
}