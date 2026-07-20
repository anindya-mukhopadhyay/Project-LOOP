import "server-only";

import { prisma } from "@/lib/database/client";

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
  return {
    ok: true,
    checkedAt: new Date().toISOString(),
  };
}
