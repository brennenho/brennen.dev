import { PageContent, PageIcon, PageTitle } from "@/components/blocks";
import { MdxContent } from "@/components/mdx";
import { WorkspaceShell } from "@/components/workspace";
import { getPageEditedMetadata } from "@/lib/git";
import {
  formatMusingDate,
  getMusingPost,
  getMusingSummaries,
} from "@/lib/musings";
import { formatViewCount, getViewCount } from "@/lib/views";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getMusingSummaries();

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getMusingPost(slug);

  if (!post) return {};

  const description = `${formatMusingDate(post.date)} • ${post.readTime}`;

  return {
    title: {
      absolute: `${post.title} • Brennen Ho`,
    },
    description,
    openGraph: {
      title: post.title,
      description,
      url: `https://brennen.dev${post.href}`,
      siteName: "Brennen Ho",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function MusingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getMusingPost(slug);

  if (!post) {
    notFound();
  }

  const [
    { commitDate, dateLabel, commitTimestamp, commitTitle, commitUrl },
    views,
  ] = await Promise.all([
    getPageEditedMetadata(post.filePath),
    getViewCount(post.href),
  ]);

  return (
    <WorkspaceShell
      editedCommitDate={commitDate}
      editedCommitTimestamp={commitTimestamp}
      editedCommitTitle={commitTitle}
      editedCommitUrl={commitUrl}
      editedDate={dateLabel}
      activePath={post.href}
      pageIcon={post.emoji}
      pageTitle={post.title}
    >
      <PageContent>
        <PageIcon>{post.emoji}</PageIcon>
        <PageTitle>{post.title}</PageTitle>
        <p className="-mt-[10px] text-[14px] leading-[1.4] font-medium text-[#858582]">
          {formatMusingDate(post.date)} • {post.readTime}
          {views !== null && views > 0 && (
            <>
              {" "}
              • {formatViewCount(views)} {views === 1 ? "view" : "views"}
            </>
          )}
        </p>
        <MdxContent source={post.content} />
      </PageContent>
    </WorkspaceShell>
  );
}
