"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { Icons, Spinner, TextEditor, type TextEditorRef } from "~/components";
import { Button, Skeleton } from "~/components/ui";

interface PasteResponse {
  success: boolean;
  fileName: string;
}

function PasteContent() {
  const [text, setText] = useState("");
  const router = useRouter();
  const editorRef = useRef<TextEditorRef>(null);
  const isStatic = useSearchParams().has("static");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    try {
      setLoading(true);
      const response = await fetch("/api/paste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, isStatic }),
      });

      // redirect
      if (response.ok) {
        const { fileName } = (await response.json()) as PasteResponse;
        router.push(`/paste/${fileName}`, { scroll: true });
      } else {
        console.error("API Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving text:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleFocusClick = () => {
    editorRef.current?.focus();
  };

  return (
    <div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex min-h-[calc(100vh-6rem)] flex-col p-4 pr-0 pt-16">
          <div className="relative flex-1" onClick={handleFocusClick}>
            <div className="fixed right-4 top-16 z-10">
              <Button variant="secondary" size="sm" onClick={handleSave}>
                <Icons.save className="h-5 w-5" />
              </Button>
            </div>
            <TextEditor value={text} onChange={setText} ref={editorRef} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Paste() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col space-y-3 p-16">
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <PasteContent />
    </Suspense>
  );
}
