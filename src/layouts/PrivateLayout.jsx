
import ThemeProvider from "../theme/ThemeProvider";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function PrivateLayout() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        <Topbar />
        <Outlet />
      </div>
    </ThemeProvider>
  );
}