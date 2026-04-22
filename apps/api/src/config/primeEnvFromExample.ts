import { readFileSync } from "node:fs";

import { parse } from "dotenv";

/**
 * PaaS hosts (Railway, etc.) inject config into `process.env`, but often omit keys
 * entirely instead of setting empty strings. `dotenv-safe` still requires every name
 * listed in `.env.example` to exist as a key on `process.env`.
 *
 * Call **after** `dotenv.config` has merged a local `.env` file so file values win.
 * Only fills keys that are still absent (`!(key in process.env)`).
 */
export function primeMissingKeysFromExample(exampleFilePath: string): void {
  const exampleVars = parse(readFileSync(exampleFilePath, "utf8"));
  const secretPlaceholders: Partial<Record<string, string>> = {
    JWT_PRIVATE_KEY: "placeholder",
    JWT_PUBLIC_KEY: "placeholder",
    FAST2SMS_API_KEY: "placeholder",
    RAZORPAY_KEY_ID: "placeholder",
    RAZORPAY_KEY_SECRET: "placeholder"
  };

  for (const key of Object.keys(exampleVars)) {
    if (Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }
    if (key === "DATABASE_URL_TEST" && typeof process.env.DATABASE_URL === "string") {
      process.env[key] = process.env.DATABASE_URL;
      continue;
    }
    const sample = exampleVars[key];
    if (sample !== undefined && sample !== "") {
      process.env[key] = sample;
      continue;
    }
    const ph = secretPlaceholders[key as keyof typeof secretPlaceholders];
    process.env[key] = ph ?? "";
  }
}
