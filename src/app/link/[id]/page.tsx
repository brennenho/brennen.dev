import { redirect } from "next/navigation";
import { getLink } from "~/server/queries";

type ShortLinksParams = {
  params:
    | {
        id: string;
      }
    | Promise<{
        id: string;
      }>;
};

export default async function ShortLinks({ params }: ShortLinksParams) {
  const { id } = await params;
  const link = await getLink(id);

  if (!link) {
    redirect("/");
  }

  redirect(link.url);
}
