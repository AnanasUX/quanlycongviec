import { buildApp } from "./app.js";

const port = Number(process.env.PORT) || 4000;
const host = process.env.HOST || "0.0.0.0";

const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({ port, host });
    console.log(`API Server running at http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
