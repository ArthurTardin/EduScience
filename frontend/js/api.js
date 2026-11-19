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