import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: false,
    }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({ data: { status: "ok" } });
});

app.use("/api", routes);

export default app;
