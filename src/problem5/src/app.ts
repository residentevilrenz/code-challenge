import express from "express";
import resourcesRouter from "./routes/resources";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/resources", resourcesRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Keep error responses generic for API clients.
  res.status(500).json({
    message: "Internal server error.",
    detail: err.message
  });
});

export default app;
