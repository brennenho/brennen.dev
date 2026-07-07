import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgCard,
} from "@/lib/og/card";

export const alt = "hey, i’m brennen";
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const size = OG_IMAGE_SIZE;

export default async function OpengraphImage() {
  return renderOgCard({
    cover: "pixel",
    emoji: "👋",
    title: "hey, i’m brennen",
  });
}
