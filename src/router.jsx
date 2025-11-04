// src/router.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/LogIn";
import Register from "./pages/Register";
import RecoverPassword from "./pages/RecoverPassword";
import VerificationCode from "./pages/VerificationCode";
import ChangePassword from "./pages/ChangePassword";
import { AuthGuard, PublicGuard } from "./guards/auth.guard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <AuthGuard><Home /></AuthGuard>,
      },
      {
        path: "/login",
        element: <PublicGuard><Login /></PublicGuard>
      },
      {
        path: "/register",
        element: <PublicGuard><Register /></PublicGuard>
      },
      {
        path: "/recover-password",
        element: <PublicGuard><RecoverPassword /></PublicGuard>
      },
      {
        path: "verification-code",
        element: <PublicGuard><VerificationCode /></PublicGuard>
      },
      {
        path: "/change-password",
        element: <PublicGuard><ChangePassword /></PublicGuard>
      }
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
