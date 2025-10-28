// src/router.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

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
      // 🔹 Ejemplo: agregar nuevas rutas aquí
      // { path: "login", element: <Login /> },
      // { path: "dashboard", element: <Dashboard /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
