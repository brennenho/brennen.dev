import { lte } from "drizzle-orm";
import { db } from "~/server/db";
import { pastes } from "~/server/db/schema";

export async function GET() {
  await db.delete(pastes).where(lte(pastes.expiresAt, new Date()));
  return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
}
