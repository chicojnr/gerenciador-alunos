import { RouterProvider } from "react-router-dom";
import { router } from "./router.js";
import { AuthProvider } from "./auth/AuthContext.js";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
