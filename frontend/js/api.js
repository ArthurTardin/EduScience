export const API_BASE_URL = "http://localhost:3000/api";
export const TOKEN_KEY = "@EduScience:token";
export const USER_KEY = "@EduScience:user";

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function logout(redirectTo = null) {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(USER_KEY);
  } catch {
    // Ignora falhas de storage em modo restrito
  }

  if (redirectTo) {
    window.location.href = redirectTo;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const { auth = true, ...fetchOptions } = options;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers
  });

  if (auth && (response.status === 401 || response.status === 403)) {
    logout();
    throw new Error("Sessão expirada.");
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Erro na requisição (${response.status})`);
  }

  return data;
}