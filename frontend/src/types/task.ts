import type { User } from "./user";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedUser: User | null;
  createdByUser: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface TasksPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  assignedUserId?: number | null;
};

export type UpdateTaskInput = {
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedUserId: number | null;
};