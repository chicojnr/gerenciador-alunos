import { buildApp } from "./app.js";
import { loadConfig } from "./core/config.js";

async function main() {
  const config = loadConfig();
  const app = await buildApp();
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Server listening on port ${config.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
