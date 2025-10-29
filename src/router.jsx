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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/login", element: <Login />
      },
      {
        path: "/register", element: <Register />
      },
      {
        path: "/recover-password", element: <RecoverPassword />
      },
      {
        path: "verification-code", element: <VerificationCode />
      },
      {
        path: "/change-password", element: <ChangePassword />
      }
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
