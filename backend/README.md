# Backend

Express + TypeScript REST API for the task management app. Uses Prisma with PostgreSQL and JWT authentication.

## Prerequisites

- Node.js 20+
- Docker (for the local database) or an existing PostgreSQL instance

## Environment Setup

Create a `.env` file in this directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/task_app"
JWT_SECRET="your-secret-key"
PORT=3001
```

| Variable       | Description                              | Required |
| -------------- | ---------------------------------------- | -------- |
| `DATABASE_URL` | PostgreSQL connection string             | Yes      |
| `JWT_SECRET`   | Secret used to sign JWT tokens           | Yes      |
| `PORT`         | Port the server listens on (default 3001)| No       |

## Quick Start

**1. Start a local PostgreSQL database (Docker):**

Note that username and password for example below is `postgres`

```bash
docker run --name task-app-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=task_app \
  -p 5432:5432 \
  -d postgres:16
```

You can use any PostgreSQL instance — just update `DATABASE_URL` accordingly.

**2. Install dependencies:**

```bash
npm install
```

**3. Run migrations:**

```bash
npm run prisma:migrate
```

**4. Seed the database:**

```bash
npm run prisma:seed
```

**5. Start the dev server:**

```bash
npm run dev
```

The server starts at `http://localhost:3001`.

## API Documentation and Testing (Postman)

Postman collection: [Tama - Task Management App.postman_collection.json](../docs/postman/Tama%20-%20Task%20Management%20App.postman_collection.json)

In Postman, import the collection and configure:

- `baseUrl` = `http://localhost:3001`
- `bearerToken` = token returned by `POST /api/auth/login`

## Scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start dev server with hot reload         |
| `npm run build`      | Compile TypeScript to `dist/`            |
| `npm start`          | Run compiled output from `dist/`         |
| `npm run prisma:migrate` | Apply pending migrations             |
| `npm run prisma:generate` | Regenerate Prisma client            |
| `npm run prisma:seed` | Seed the database with test data        |

## Architecture

```
src/
├── server.ts           # Entry point — starts HTTP server
├── app.ts              # Express app — middleware + routes
├── routes/             # Route definitions (path -> handler mapping)
├── controllers/        # HTTP layer — parse request, return response
├── services/           # Business logic + data access (Prisma)
├── middleware/
│   ├── auth.middleware.ts   # JWT verification
│   └── error.middleware.ts  # Global error handler
├── errors/
│   └── app-error.ts    # Error class
├── validators/         # Zod schemas for request body validation
├── utils/              # JWT helpers
└── lib/
    └── prisma.ts       # Shared Prisma client instance
```

**Request flow:**

```
Request -> helmet -> morgan -> cors -> json parser
       -> [auth middleware] -> controller -> service -> Prisma
       -> notFoundHandler / errorHandler
```

## Database Relationship Diagram (Prisma ERD)

![Prisma ERD](../docs/imgs/prisma-erd.svg)

---

## API Reference

All endpoints are prefixed with `/api`. Authenticated routes require:

```
Authorization: Bearer <token>
```
- JWT is issued on login
- protected routes use bearer token middleware
- `req.user` is derived from token payload

---

### Auth

#### `POST /api/auth/login`

Login with existing credentials.

**Request body:**

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response `200`:**

```json
{
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "name": "Alice Johnson", "email": "alice@example.com" , "createdAt": "<datetime>"}
  }
}
```

---

### Users

#### `GET /api/users`

List all users.

**Response `200`:**

```json
{
  "data": [
    { "id": 1, "name": "Alice Johnson", "email": "alice@example.com" }
  ]
}
```

---

### Tasks

All task endpoints require authentication.

#### `GET /api/tasks` 

List tasks with optional filtering and pagination. Excluded deleted items.

**Query parameters:**

| Parameter        | Type   | Description                                        |
| ---------------- | ------ | -------------------------------------------------- |
| `page`           | number | Page number (default: 1)                           |
| `limit`          | number | Results per page (default: 10, max: 100)           |
| `status`         | string | Filter by status: `TODO`, `IN_PROGRESS`, or `DONE` |
| `assignedUserId` | number | Filter by assigned user ID                         |

**Response `200`:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Set up backend project",
      "description": "Initialize Express, Prisma, and env config",
      "status": "TODO",
      "assignedUserId": 1,
      "createdByUserId": 1,
      "createdAt": "2026-03-27T00:00:00.000Z",
      "updatedAt": "2026-03-27T00:00:00.000Z"
    },
    ...
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

---

#### `POST /api/tasks` 

Create a new task. `createdByUserId` is set automatically from the authenticated user.

**Request body:**

```json
{
  "title": "Write unit tests",
  "description": "Cover service layer",
  "status": "TODO",
  "assignedUserId": 2
}
```

| Field            | Type   | Required | Description                                |
| ---------------- | ------ | -------- | ------------------------------------------ |
| `title`          | string | Yes      | Task title                                 |
| `description`    | string | No       | Optional task description                  |
| `status`         | string | No       | `TODO`, `IN_PROGRESS`, or `DONE` (default: `TODO`) |
| `assignedUserId` | number | No       | ID of an existing user to assign           |

**Response `201`:** Returns the created task in `{ "data": { ... } }`.

---

#### `PUT /api/tasks/:id` 

Update an existing task.

**URL parameter:** `id` — task ID

**Request body:** Same fields as `POST /api/tasks` (all optional).

**Response `200`:** Returns the updated task in `{ "data": { ... } }`.

---

#### `DELETE /api/tasks/:id` 

Soft-delete a task (sets `deletedAt`).

**URL parameter:** `id` — task ID

**Response `204`:** No content.

---

## Error Responses

All errors follow this shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}
```

`details` is only present for validation errors.

| HTTP | Code                    | When                                              |
| ---- | ----------------------- | ------------------------------------------------- |
| 400  | `VALIDATION_ERROR`      | Request body or query param failed validation     |
| 401  | `UNAUTHORIZED`          | Missing or invalid Authorization header           |
| 404  | `NOT_FOUND`             | Resource or route not found                       |
| 404  | `USER_NOT_FOUND`        | `assignedUserId` does not exist                   |
| 404  | `TASK_NOT_FOUND`        | Task ID does not exist or is deleted              |
| 500  | `INTERNAL_SERVER_ERROR` | Unexpected server-side error                      |