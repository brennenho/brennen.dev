import "server-only";
import { db } from "./db";
import { pastes } from "./db/schema";

export async function savePasteText(
  fileName: string,
  text: string,
  expiresAt?: Date,
) {
  const [paste] = await db
    .insert(pastes)
    .values({ fileName, text, expiresAt })
    .returning();

  return paste;
}
