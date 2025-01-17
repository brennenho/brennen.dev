import { redirect } from "next/navigation";
import { getLink } from "~/server/queries";

type ShortLinksParams = {
  params: {
    id: string;
  };
};

export default async function ShortLinks({ params }: ShortLinksParams) {
  const { id } = params;
  const link = await getLink(id);

  if (!link) {
    redirect("/");
  }

  redirect(link.url);
}
