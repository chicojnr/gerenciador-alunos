const BASE_URL = import.meta.env.VITE_API_URL as string;

const AUTH_PATHS_EXCLUDED_FROM_REFRESH = ["/auth/login", "/auth/refresh", "/auth/logout"];

async function refreshAccessToken(): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return response.ok;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers }
  });

  if (!response.ok) {
    if (response.status === 401 && !AUTH_PATHS_EXCLUDED_FROM_REFRESH.includes(path)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const retryResponse = await fetch(`${BASE_URL}${path}`, {
          ...options,
          credentials: "include",
          headers: { "Content-Type": "application/json", ...options.headers }
        });
        if (!retryResponse.ok) {
          throw new Error(`Request failed: ${retryResponse.status}`);
        }
        return retryResponse.json() as Promise<T>;
      }
    }
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" })
};
