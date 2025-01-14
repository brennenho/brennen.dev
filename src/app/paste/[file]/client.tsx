"use client";

import { useState } from "react";
import { TextEditor } from "~/components";

type PasteClientProps = {
  initialText: string;
};

export function PasteClient({ initialText }: PasteClientProps) {
  const [text, setText] = useState(initialText);

  return (
    <div className="relative">
      <TextEditor value={text} onChange={setText} disabled={true} />
    </div>
  );
}
