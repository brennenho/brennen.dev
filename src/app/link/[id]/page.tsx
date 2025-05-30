import PostHogClient from "@/lib/analytics";
import { supabase } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

type ShortLinksParams = {
  params: Promise<{
    id: string;
  }>;
};
export default async function ShortLinks(props: ShortLinksParams) {
  const params = await props.params;
  const { id } = params;
  const { data: link } = await supabase
    .from("links")
    .select("*")
    .eq("short", id)
    .single();

  if (!link) {
    redirect("/");
  }

  const posthog = PostHogClient();
  posthog.capture({
    distinctId: "server",
    event: "shortened_link",
    properties: {
      $process_person_profile: false,
      short: id,
      url: link.url,
    },
  });

  await posthog.shutdown();

  redirect(link.url);
}
