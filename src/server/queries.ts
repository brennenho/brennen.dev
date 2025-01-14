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

export async function getPasteText(fileName: string) {
  const paste = await db.query.pastes.findFirst({
    where: (pastes, { eq }) => eq(pastes.fileName, fileName),
  });

  if (!paste) {
    throw new Error("File not found");
  }

  return paste;
}
