import app from "./app";
import { getDb } from "./db";

const port = Number(process.env.PORT ?? 3000);

async function startServer(): Promise<void> {
  await getDb();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer().catch((error: Error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
