import { pathToFileURL } from "node:url";

/**
 * True when the process was started with this module as the entry file
 * (e.g. `node dist/app.js`). Used to avoid auto-start when tests import the module.
 */
export function isNodeMainModule(importMetaUrl: string, argv1: string | undefined): boolean {
  if (argv1 === undefined || argv1.length === 0) {
    return false;
  }
  return importMetaUrl === pathToFileURL(argv1).href;
}
