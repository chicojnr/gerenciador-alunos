import { RouterProvider } from "react-router-dom";
import { router } from "./router.js";
import { AuthProvider } from "./auth/AuthContext.js";
import { ConfirmProvider } from "./shared/contexts/ConfirmContext.js";

export function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <RouterProvider router={router} />
      </ConfirmProvider>
    </AuthProvider>
  );
}
