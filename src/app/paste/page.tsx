import { TextEditor } from "~/components";

export default function Paste() {
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col p-4 pr-0 pt-16">
      <div className="flex flex-row">
        <div className="pb-4 text-3xl font-semibold">pastebin</div>
      </div>
      <TextEditor />
    </div>
  );
}
