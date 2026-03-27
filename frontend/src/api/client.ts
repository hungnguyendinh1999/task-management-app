const BASE_URL = "http://localhost:3001/api";

export function getStoredToken(): string | null {
    return localStorage.getItem("token");
}

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getStoredToken();

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers ?? {}),
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw (
            data ?? {
                error: {
                    code: "UNKNOWN_ERROR",
                    message: "Something went wrong",
                },
            }
        );
    }

    return data as T;
}
