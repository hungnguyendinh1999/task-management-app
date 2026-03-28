import { apiFetch } from "./client";
import type { Task, TaskStatus, TasksPagination } from "../types/task";
import type { ApiResponse } from "../types/api";

export interface GetTasksParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  assignedUserId?: number;
}

export interface GetTasksResponse {
  data: Task[];
  pagination: TasksPagination;
}

export interface TaskFormPayload {
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedUserId: number | null;
}

export async function getTasks(params: GetTasksParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.assignedUserId) {
    searchParams.set("assignedUserId", String(params.assignedUserId));
  }

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/tasks?${queryString}` : "/tasks";

  return apiFetch<GetTasksResponse>(endpoint);
}

export async function createTask(payload: TaskFormPayload) {
  const response = await apiFetch<ApiResponse<Task>>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updateTask(taskId: number, payload: TaskFormPayload) {
  const response = await apiFetch<ApiResponse<Task>>(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function deleteTask(taskId: number) {
  return apiFetch<ApiResponse<{ message: string }>>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}