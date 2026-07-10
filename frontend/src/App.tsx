import { RouterProvider } from "react-router-dom";
import { router } from "./core/router.js";
import { AuthProvider } from "./auth/AuthContext.js";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
