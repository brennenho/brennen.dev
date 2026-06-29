import { NextResponse } from "next/server";

export function gameApiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
