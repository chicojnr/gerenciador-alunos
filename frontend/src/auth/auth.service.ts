import { apiClient } from "../core/apiClient.js";

export interface LoginResponse {
  userId: string;
}

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/auth/login", { email, password }),
  logout: () => apiClient.post<{ ok: boolean }>("/auth/logout", {}),
  me: () => apiClient.get<LoginResponse>("/auth/me")
};
