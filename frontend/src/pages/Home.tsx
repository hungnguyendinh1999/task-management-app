import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "../api/users";
import { getTasks } from "../api/tasks";
import type { User } from "../types/user";
import type { Task, TaskStatus, TasksPagination } from "../types/task";

type Filters = {
  status: "" | TaskStatus;
  assignedUserId: "" | number;
};

export default function TasksPage() {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
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
        nextFilters.assignedUserId === "" ? undefined : nextFilters.assignedUserId,
    });

    setTasks(response.data);
    setPagination(response.pagination);
  }

  async function loadPageData() {
    setLoading(true);
    setErrorMessage("");

    try {
      await Promise.all([loadUsers(), loadTasks(1, filters)]);
    } catch (error: any) {
      if (error?.error?.message) {
        setErrorMessage(error.error.message);
      } else {
        setErrorMessage("Failed to load tasks page");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApplyFilters() {
    setLoading(true);
    setErrorMessage("");

    try {
      await loadTasks(1, filters);
    } catch (error: any) {
      setErrorMessage(error?.error?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await loadTasks(nextPage, filters);
    } catch (error: any) {
      setErrorMessage(error?.error?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Tasks</h1>
          <p style={{ margin: "4px 0 0 0" }}>
            Logged in as: {user?.name} ({user?.email})
          </p>
        </div>

        <button onClick={logout}>Logout</button>
      </div>

      <section
        style={{
          border: "1px solid #ddd",
          padding: 12,
          marginBottom: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Filters</h2>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "end",
          }}
        >
          <div>
            <label htmlFor="status-filter">Status</label>
            <br />
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as "" | TaskStatus,
                }))
              }
            >
              <option value="">All</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div>
            <label htmlFor="assigned-user-filter">Assigned User</label>
            <br />
            <select
              id="assigned-user-filter"
              value={filters.assignedUserId}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  assignedUserId: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
            >
              <option value="">All</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleApplyFilters} disabled={loading}>
            Apply Filters
          </button>
        </div>
      </section>

      {errorMessage && (
        <p style={{ color: "red", marginBottom: 16 }}>{errorMessage}</p>
      )}

      <section
        style={{
          border: "1px solid #ddd",
          padding: 12,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Task List</h2>

        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={cellStyle}>ID</th>
                  <th style={cellStyle}>Title</th>
                  <th style={cellStyle}>Description</th>
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Assigned To</th>
                  <th style={cellStyle}>Created By</th>
                  <th style={cellStyle}>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td style={cellStyle}>{task.id}</td>
                    <td style={cellStyle}>{task.title}</td>
                    <td style={cellStyle}>{task.description || "-"}</td>
                    <td style={cellStyle}>{task.status}</td>
                    <td style={cellStyle}>{task.assignedUser?.name || "Unassigned"}</td>
                    <td style={cellStyle}>{task.createdByUser?.name || "-"}</td>
                    <td style={cellStyle}>
                      {new Date(task.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            Page {pagination.page} of {pagination.totalPages} | Total:{" "}
            {pagination.total}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={loading || pagination.page <= 1}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={loading || pagination.page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  verticalAlign: "top",
};