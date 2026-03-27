import { apiFetch } from "./client";
import type { Task, TaskStatus, TasksPagination } from "../types/task";

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