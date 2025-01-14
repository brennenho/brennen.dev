import { use } from "react";
import { PasteClient } from "~/app/paste/[file]/client";
import { getPasteText } from "~/server/queries";

type PasteDisplayParams = {
  params: {
    file: string;
  };
};

export default function PasteDisplay({ params }: PasteDisplayParams) {
  const { file } = use(Promise.resolve(params));
  const paste = use(getPasteText(file));

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col overflow-auto pt-16">
      <PasteClient initialText={paste?.text ?? ""} />
    </div>
  );
}
