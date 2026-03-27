import { PrismaClient, TaskStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to DB...");
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const [alice, bob, carol] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Johnson",
        email: "alice@example.com",
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: "Bob Lee",
        email: "bob@example.com",
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: "Carol Smith",
        email: "carol@example.com",
        passwordHash,
      },
    }),
  ]);
  console.log("Alice created:", alice.id);
  console.log("Bob created:", bob.id);
  console.log("Carol created:", carol.id);


  await prisma.task.createMany({
    data: [
      {
        title: "Set up backend project",
        description: "Initialize Express, Prisma, and env config",
        status: TaskStatus.TODO,
        assignedUserId: alice.id,
        createdByUserId: alice.id,
      },
      {
        title: "Design database schema",
        description: "Finalize User and Task models",
        status: TaskStatus.IN_PROGRESS,
        assignedUserId: bob.id,
        createdByUserId: alice.id,
      },
      {
        title: "Write auth route",
        description: "Implement login with JWT",
        status: TaskStatus.TODO,
        assignedUserId: null,
        createdByUserId: alice.id,
      },
      {
        title: "Implement task list API",
        description: "Support filters and pagination",
        status: TaskStatus.IN_PROGRESS,
        assignedUserId: carol.id,
        createdByUserId: bob.id,
      },
      {
        title: "Add seed data",
        description: null,
        status: TaskStatus.DONE,
        assignedUserId: alice.id,
        createdByUserId: bob.id,
      },
      {
        title: "Build login page",
        description: "Frontend login form with validation",
        status: TaskStatus.TODO,
        assignedUserId: bob.id,
        createdByUserId: carol.id,
      },
      {
        title: "Build task table",
        description: "Responsive layout for desktop and mobile",
        status: TaskStatus.IN_PROGRESS,
        assignedUserId: null,
        createdByUserId: carol.id,
      },
      {
        title: "Implement edit form",
        description: "Use full PUT update flow",
        status: TaskStatus.TODO,
        assignedUserId: carol.id,
        createdByUserId: alice.id,
      },
      {
        title: "Add loading states",
        description: "Handle async API requests gracefully",
        status: TaskStatus.DONE,
        assignedUserId: bob.id,
        createdByUserId: alice.id,
      },
      {
        title: "Handle delete flow",
        description: "Soft delete tasks via deletedAt",
        status: TaskStatus.TODO,
        assignedUserId: null,
        createdByUserId: bob.id,
      },
      {
        title: "Write README",
        description: "Document setup and architecture",
        status: TaskStatus.IN_PROGRESS,
        assignedUserId: alice.id,
        createdByUserId: carol.id,
      },
      {
        title: "Prepare API documentation",
        description: "Markdown or Postman collection",
        status: TaskStatus.DONE,
        assignedUserId: carol.id,
        createdByUserId: alice.id,
      },
    ],
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.log("Attempt to seed database failed.");
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });