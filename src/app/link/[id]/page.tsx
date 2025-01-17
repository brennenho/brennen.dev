import { redirect } from "next/navigation";
import { getLink } from "~/server/queries";

type ShortLinksParams = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ShortLinks(props: ShortLinksParams) {
  const params = await props.params;
  const { id } = params;
  const link = await getLink(id);

  if (!link) {
    redirect("/");
  }

  redirect(link.url);
}
