const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..", "..");
const envPath = path.join(workspaceRoot, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

const url = process.env.DATABASE_URL_TEST;
if (!url) {
  throw new Error("Set DATABASE_URL_TEST in .env");
}
process.env.DATABASE_URL = url;
process.env.DIRECT_URL = url;
execSync("npx prisma migrate reset --force --skip-seed", {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
  env: process.env
});
