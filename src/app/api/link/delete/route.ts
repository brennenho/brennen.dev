import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteLink } from "~/server/queries";

const deleteSchema = z.object({
  id: z.string(),
});

export async function POST(req: Request) {
  try {
    const { id } = deleteSchema.parse(await req.json());

    await deleteLink(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 },
    );
  }
}
