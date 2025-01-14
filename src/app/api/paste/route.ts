import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { savePasteText } from "~/server/queries";

const PasteSchema = z.object({
  text: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as z.infer<typeof PasteSchema>;
    const result = PasteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { text } = result.data;
    await savePasteText("untitled.txt", text, new Date(Date.now() + 1000 * 60));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error saving text:", error);
    return NextResponse.json(
      { success: false, error: "Unable to save text" },
      { status: 500 },
    );
  }
}
