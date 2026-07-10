import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(join(here, ".env.test"), "utf-8");
const parsed = parseEnv(envContent);

for (const [key, value] of Object.entries(parsed)) {
  process.env[key] = value;
}
