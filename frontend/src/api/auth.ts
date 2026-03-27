import { apiFetch } from "./client";
import type { ApiResponse } from "../types/api";
import type { LoginResponseData } from "../types/auth";

const baseAPIRoute = "/auth";

export async function login(email: string, password: string) {
    const response = await apiFetch<ApiResponse<LoginResponseData>>(
        `${baseAPIRoute}/login`,
        {
            method: "POST",
            body: JSON.stringify({ email, password }),
        },
    );

    return response.data;
}
