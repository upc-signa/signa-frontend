// src/router.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import NotFound from "./pages/auth/NotFound";
import Login from "./pages/auth/LogIn";
import Register from "./pages/auth/Register";
import RecoverPassword from "./pages/auth/RecoverPassword";
import VerificationCode from "./pages/auth/VerificationCode";
import ChangePassword from "./pages/auth/ChangePassword";
import { AuthGuard, PublicGuard } from "./guards/auth.guard";

import ProfileView from "./pages/profile/ProfileView";
import ProfileEdit from "./pages/profile/ProfileEdit";
import Plans from "./pages/plans/Plans";
import Checkout from "./pages/plans/Checkout";
import Settings from "./pages/settings/Settings";
import History from "./pages/history/History";
import PrivateLayout from "./layouts/PrivateLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      // Públicas
      { path: "/login", element: <PublicGuard><Login /></PublicGuard> },
      { path: "/register", element: <PublicGuard><Register /></PublicGuard> },
      { path: "/recover-password", element: <PublicGuard><RecoverPassword /></PublicGuard> },
      { path: "/verification-code", element: <PublicGuard><VerificationCode /></PublicGuard> },
      { path: "/change-password", element: <PublicGuard><ChangePassword /></PublicGuard> },

      // Privadas (bajo PrivateLayout)
      {
        element: (
          <AuthGuard>
            <PrivateLayout />
          </AuthGuard>
        ),
        children: [
          { index: true, element: <Home /> },
          { path: "profile", element: <ProfileView /> },
          { path: "profile/edit", element: <ProfileEdit /> },
          { path: "plans", element: <Plans /> },
          { path: "checkout", element: <Checkout /> },
          { path: "settings", element: <Settings /> },
          { path: "history", element: <History /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
