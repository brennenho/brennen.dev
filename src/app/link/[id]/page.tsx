import { redirect } from "next/navigation";
import { posthog } from "~/server/analytics";
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
  posthog.capture({
    distinctId: "server",
    event: "shortened_link",
    properties: {
      $process_person_profile: false,
      short: id,
      url: link?.url,
    },
  });

  await posthog.shutdown();

  if (!link) {
    redirect("/");
  }

  redirect(link.url);
}
