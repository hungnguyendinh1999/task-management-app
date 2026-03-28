import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import {
    errorHandler,
    notFoundHandler,
} from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));

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
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
