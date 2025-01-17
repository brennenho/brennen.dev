import { redirect } from "next/navigation";
import { PasteClient } from "~/app/paste/[file]/client";
import { getPasteText } from "~/server/queries";

type PasteDisplayParams = {
  params: Promise<{
    file: string;
  }>;
};

export default async function PasteDisplay(props: PasteDisplayParams) {
  const params = await props.params;
  const { file } = params;
  const paste = await getPasteText(file);

  if (!paste) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col overflow-auto pt-16">
      <PasteClient initialText={paste?.text ?? ""} />
    </div>
  );
}
