import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { links, pastes } from "./db/schema";

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

  return paste;
}

export async function addLink(id: string, url: string, expiresAt?: Date) {
  const [link] = await db
    .insert(links)
    .values({ id, url, expiresAt })
    .returning();

  return link;
}

export async function deleteLink(id: string) {
  const link = await db.delete(links).where(eq(links.id, id));

  return link;
}

export async function getLink(id: string) {
  const link = await db.query.links.findFirst({
    where: (links, { eq }) => eq(links.id, id),
  });

  return link;
}

export async function getAllLinks() {
  const link = await db.query.links.findMany({
    orderBy: desc(links.createdAt),
  });

  return link;
}
