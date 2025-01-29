"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState, useTransition } from "react";
import { Icons } from "~/components/icons";
import { Spinner, TextEditor, type TextEditorRef } from "~/components/paste";
import { Button, Skeleton } from "~/components/ui";
import { genericError } from "~/lib/errors";

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
  const [isPending, startTransition] = useTransition();

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
        startTransition(() => {
          router.prefetch(`/paste/${fileName}`);
          router.push(`/paste/${fileName}`, { scroll: true });
        });
      } else {
        genericError();
      }
    } catch {
      genericError();
    } finally {
      setLoading(false);
    }
  }

  const handleFocusClick = () => {
    editorRef.current?.focus();
  };

  return (
    <div>
      {loading || isPending ? (
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
