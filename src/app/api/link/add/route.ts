import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";
import { addLink } from "~/server/queries";

const linkSchema = z.object({
  short: z.string().optional(),
  target: z.string().url(),
  expiresAt: z
    .enum(["24 hours", "7 days", "30 days", "12 months", "never"])
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as z.infer<typeof linkSchema>;
    const data = linkSchema.parse(body);

    let date: Date | undefined = undefined;
    switch (data.expiresAt) {
      case "24 hours":
        date = new Date(Date.now() + 24 * 60 * 60 * 1000);
        break;
      case "7 days":
        date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "30 days":
        date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        break;
      case "12 months":
        date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const link = await addLink(data.short ?? nanoid(8), data.target, date);
    return NextResponse.json({ link });
  } catch {
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 },
    );
  }
}
