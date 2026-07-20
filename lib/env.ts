import "server-only";

import { parseEnv } from "@/schemas/env.schema";

export const env = parseEnv(process.env);
