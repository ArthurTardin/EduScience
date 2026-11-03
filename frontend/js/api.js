const API_BASE_URL = "http://localhost:3000/api";

const TOKEN_KEY = "@EduScience:token";

export async function login(usuario, senha) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usuario, senha })
        });

        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            const mensagemErro = data?.error || data?.message || `Erro de conexão (${response.status})`;
            throw new Error(mensagemErro);
        }

        if (data?.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
        }

        return data;
    } catch (error) {
        console.error("[API Frontend Error]:", error.message);
        throw error;
    }
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
}

export async function fetchAutenticado(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
    }

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        logout();
        window.location.href = "/login.html";
        throw new Error("Sessão expirada.");
    }

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
        throw new Error(data?.error || "Erro ao processar requisição.");
    }

    return data;
}