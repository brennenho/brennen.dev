import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteLink } from "~/server/queries";

const deleteSchema = z.object({
  id: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as z.infer<typeof deleteSchema>;
    const { id } = deleteSchema.parse(body);

    await deleteLink(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 },
    );
  }
}
