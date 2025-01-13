import { TextEditor } from "~/components";

export default function Paste() {
  return (
    <div className="flex h-full flex-col p-4 pr-0 pt-16">
      <div className="flex flex-row">
        <div className="pb-4 text-3xl font-semibold">pastebin</div>
      </div>
      <TextEditor />
    </div>
  );
}
