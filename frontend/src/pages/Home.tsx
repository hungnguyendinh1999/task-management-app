import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "../api/users";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  type TaskFormPayload,
} from "../api/tasks";
import type { User } from "../types/user";
import type { Task, TaskStatus, TasksPagination } from "../types/task";
import TaskForm from "../components/TaskForm";

type AssignedUserFilter = "" | number | "unassigned";

type Filters = {
  status: "" | TaskStatus;
  assignedUserId: AssignedUserFilter;
};

export default function TasksPage() {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [filters, setFilters] = useState<Filters>({
    status: "",
    assignedUserId: "",
  });

  const [pagination, setPagination] = useState<TasksPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  async function loadUsers() {
    const usersData = await getUsers();
    setUsers(usersData);
  }

  async function loadTasks(page = 1, nextFilters = filters) {
    const response = await getTasks({
      page,
      limit: pagination.limit,
      status: nextFilters.status || undefined,
      assignedUserId:
        nextFilters.assignedUserId === "" || nextFilters.assignedUserId === "unassigned"
          ? undefined
          : nextFilters.assignedUserId,
    });
    let nextTasks = response.data;

    if (nextFilters.assignedUserId === "unassigned") {
      nextTasks = nextTasks.filter((t) => t.assignedUser === null);
    }

    nextTasks = [...nextTasks].sort((a, b) => a.id - b.id);

    setTasks(nextTasks);
    setPagination(response.pagination);
  }

  async function loadPageData() {
    setLoadingPage(true);
    setErrorMessage("");

    try {
      await Promise.all([loadUsers(), loadTasks(1, filters)]);
    } catch (error: any) {
      setErrorMessage(error?.error?.message || "Failed to load tasks page");
    } finally {
      setLoadingPage(false);
    }
  }

  useEffect(() => {
    void loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApplyFilters() {
    setLoadingTasks(true);
    setErrorMessage("");

    try {
      await loadTasks(1, filters);
    } catch (error: any) {
      setErrorMessage(error?.error?.message || "Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  }

  async function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    setLoadingTasks(true);
    setErrorMessage("");

    try {
      await loadTasks(nextPage, filters);
    } catch (error: any) {
      setErrorMessage(error?.error?.message || "Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  }

  function handleOpenCreateForm() {
    setEditingTask(null);
    setIsFormOpen(true);
    setErrorMessage("");
  }

  function handleOpenEditForm(task: Task) {
    setEditingTask(task);
    setIsFormOpen(true);
    setErrorMessage("");
  }

  function handleCancelForm() {
    setEditingTask(null);
    setIsFormOpen(false);
    setErrorMessage("");
  }

  async function handleSubmitTask(payload: TaskFormPayload) {
    setSubmittingTask(true);
    setErrorMessage("");

    try {
      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }

      setEditingTask(null);
      setIsFormOpen(false);
      await loadTasks(pagination.page, filters);
    } catch (error: any) {
      setErrorMessage(error?.error?.message || "Failed to save task");
    } finally {
      setSubmittingTask(false);
    }
  }

  async function handleDeleteTask(taskId: number) {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    setDeletingTaskId(taskId);
    setErrorMessage("");

    try {
      await deleteTask(taskId);

      if (tasks.length === 1 && pagination.page > 1) {
        await loadTasks(pagination.page - 1, filters);
      } else {
        await loadTasks(pagination.page, filters);
      }
    } catch (error: any) {
      setErrorMessage(error?.error?.message || "Failed to delete task");
    } finally {
      setDeletingTaskId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold m-0">Tasks</h1>
          <p className="text-sm text-slate-400 mt-1 m-0">
            Logged in as: {user?.name} ({user?.email})
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors disabled:opacity-50"
        >
          Logout
        </button>
      </div>

      {/* Task Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <TaskForm
              users={users}
              initialTask={editingTask}
              submitting={submittingTask}
              onSubmit={handleSubmitTask}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-600 text-red-200 rounded">
          {errorMessage}
        </div>
      )}

      {/* Filters */}
      <section className="mb-6 p-4 border border-slate-600 rounded bg-slate-900/50">
        <h2 className="text-xl font-bold mt-0 mb-4">Filters</h2>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="status-filter" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as "" | TaskStatus,
                }))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label htmlFor="assigned-user-filter" className="block text-sm font-medium mb-2">
              Assigned User
            </label>
            <select
              id="assigned-user-filter"
              value={filters.assignedUserId}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  assignedUserId: e.target.value === "" ? "" 
                  : e.target.value === "unassigned" ? "unassigned" : Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="unassigned">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleApplyFilters}
            disabled={loadingTasks || submittingTask}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-medium transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {loadingTasks ? "Loading..." : "Apply Filters"}
          </button>
        </div>
      </section>

      {/* Task List */}
      <section className="p-4 border border-slate-600 rounded bg-slate-900/50">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold m-0">Task List</h2>
          <button
            onClick={handleOpenCreateForm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            + Add Task
          </button>
        </div>

        {loadingPage ? (
          <p className="text-slate-400">Loading...</p>
        ) : loadingTasks ? (
          <p className="text-slate-400">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-slate-400">No tasks found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-600 bg-slate-800/50">
                  <th className="text-left px-3 py-2 font-semibold text-sm">ID</th>
                  <th className="text-left px-3 py-2 font-semibold text-sm">Title</th>
                  <th className="text-left px-3 py-2 font-semibold text-sm hidden md:table-cell">Description</th>
                  <th className="text-left px-3 py-2 font-semibold text-sm">Status</th>
                  <th className="text-left px-3 py-2 font-semibold text-sm hidden sm:table-cell">Assigned To</th>
                  <th className="text-left px-3 py-2 font-semibold text-sm hidden lg:table-cell">Created By</th>
                  <th className="text-left px-3 py-2 font-semibold text-sm hidden lg:table-cell">Updated At</th>
                  <th className="text-left px-3 py-2 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-700 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-3 py-3 text-sm">{task.id}</td>
                    <td className="px-3 py-3 text-sm font-medium">{task.title}</td>
                    <td className="px-3 py-3 text-sm text-slate-400 hidden md:table-cell max-w-xs truncate">
                      {task.description || "-"}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          task.status === "DONE"
                            ? "bg-green-900/50 text-green-200"
                            : task.status === "IN_PROGRESS"
                            ? "bg-blue-900/50 text-blue-200"
                            : "bg-slate-700 text-slate-200"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm hidden sm:table-cell text-slate-300">
                      {task.assignedUser?.name || "Unassigned"}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400 hidden lg:table-cell">
                      {task.createdByUser?.name || "-"}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400 hidden lg:table-cell text-xs">
                      {new Date(task.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleOpenEditForm(task)}
                          disabled={deletingTaskId === task.id || deletingTaskId !== null}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deletingTaskId !== null && deletingTaskId !== task.id}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loadingPage && tasks.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6 pt-4 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              Page {pagination.page} of {pagination.totalPages} | Total: {pagination.total}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={loadingTasks || submittingTask || pagination.page <= 1}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={loadingTasks || submittingTask || pagination.page >= pagination.totalPages}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}