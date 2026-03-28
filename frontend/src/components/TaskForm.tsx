import { useEffect, useState } from "react";
import type { User } from "../types/user";
import type { Task, TaskStatus } from "../types/task";
import type { TaskFormPayload } from "../api/tasks";

interface TaskFormProps {
  users: User[];
  initialTask: Task | null;
  submitting: boolean;
  onSubmit: (payload: TaskFormPayload) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({
  users,
  initialTask,
  submitting,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [assignedUserId, setAssignedUserId] = useState<number | "">("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? "");
      setStatus(initialTask.status);
      setAssignedUserId(initialTask.assignedUser?.id ?? "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setAssignedUserId("");
    }

    setErrorMessage("");
  }, [initialTask]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Title is required");
      return;
    }

    setErrorMessage("");

    await onSubmit({
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      status,
      assignedUserId: assignedUserId === "" ? null : assignedUserId,
    });
  }

  const isEditMode = Boolean(initialTask);

  return (
    <section className="p-6 border border-slate-600 rounded-lg bg-slate-900 shadow-xl">
      <h2 className="text-2xl font-bold mt-0 mb-6">
        {isEditMode ? "Edit Task" : "Add Task"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium mb-2">
            Title *
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            disabled={submitting}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="task-description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            disabled={submitting}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 min-h-24"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              disabled={submitting}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-assigned-user" className="block text-sm font-medium mb-2">
              Assigned User
            </label>
            <select
              id="task-assigned-user"
              value={assignedUserId}
              onChange={(e) =>
                setAssignedUserId(e.target.value === "" ? "" : Number(e.target.value))
              }
              disabled={submitting}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-300 text-sm p-3 bg-red-900/30 border border-red-600 rounded">
            {errorMessage}
          </p>
        )}

        <div className="flex gap-3 flex-wrap pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors disabled:opacity-50"
          >
            {submitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Task"
              : "Create Task"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}