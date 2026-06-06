import { NotionMdx } from "@/components/notion/mdx";
import {
  PageContent,
  PageIcon,
  PageTitle,
  WorkspaceShell,
} from "@/components/notion/workspace-shell";
import { getPageEditedMetadata } from "@/lib/git";
import {
  formatMusingDate,
  getMusingPost,
  getMusingSummaries,
} from "@/lib/musings";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getMusingSummaries();

  return posts.map((post) => ({ slug: post.slug }));
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

  const { commitDate, dateLabel, commitTimestamp, commitTitle, commitUrl } =
    await getPageEditedMetadata(post.filePath);

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
        </p>
        <NotionMdx source={post.content} />
      </PageContent>
    </WorkspaceShell>
  );
}
