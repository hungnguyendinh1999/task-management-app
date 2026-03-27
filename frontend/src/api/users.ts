import { apiFetch } from "./client";
import type { ApiResponse } from "../types/api";
import type { User } from "../types/user";

export async function getUsers() {
  const response = await apiFetch<ApiResponse<User[]>>("/users");
  return response.data;
}