"use client";

import { useState } from "react";
import { Icons, TextEditor } from "~/components";
import { Button } from "~/components/ui";

export default function Paste() {
  const [text, setText] = useState("");

  async function handleSave() {
    try {
      await fetch("/api/paste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      // Optionally handle success: show a message, redirect, etc.
    } catch (error) {
      console.error("Error saving text:", error);
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col p-4 pr-0 pt-16">
      <div className="relative h-full">
        <div className="absolute right-4 top-0 z-10">
          <Button variant="secondary" size="sm" onClick={handleSave}>
            <Icons.save className="h-5 w-5" />
          </Button>
        </div>
        <TextEditor value={text} onChange={setText} />
      </div>
    </div>
  );
}
