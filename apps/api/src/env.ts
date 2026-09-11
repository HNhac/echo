import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRootEnv } from "../../../scripts/load-root-env.mjs";

loadRootEnv(dirname(fileURLToPath(import.meta.url)));
