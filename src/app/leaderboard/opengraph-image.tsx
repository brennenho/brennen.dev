import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgCard,
} from "@/lib/og/card";

export const alt = "leaderboard";
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const size = OG_IMAGE_SIZE;

export default async function OpengraphImage() {
  return renderOgCard({
    emoji: "🏆",
    title: "leaderboard",
  });
}
