import { getMusingPost, getMusingSummaries } from "@/lib/musings";
import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgCard,
} from "@/lib/og/card";

export const alt = "musings";
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const size = OG_IMAGE_SIZE;

export async function generateStaticParams() {
  const posts = await getMusingSummaries();

  return posts.map((post) => ({ slug: post.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getMusingPost(slug);

  return renderOgCard({
    cover: "solid",
    emoji: post?.emoji ?? "💭",
    title: post?.title ?? "musings",
  });
}
