import { cleanExpired } from "~/server/queries";

export async function GET() {
  await cleanExpired();
  return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
}
