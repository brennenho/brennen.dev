"use client";

import { PageContent } from "@/components/blocks";
import {
  createLocalPage,
  deleteLocalPage,
  updateLocalPage,
  useLocalPage,
  useLocalPagesReady,
  type LocalPage,
} from "@/lib/local-pages";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { localEditorExtensions } from "./editor-extensions";
import { EmojiPicker } from "./emoji-picker";

export function LocalPageEditor({ id }: { id: string }) {
  const page = useLocalPage(id);
  const ready = useLocalPagesReady();

  if (!ready) {
    return (
      <PageContent>
        <span className="sr-only">Loading page</span>
      </PageContent>
    );
  }

  if (!page) {
    return <MissingLocalPage />;
  }

  return <EditableLocalPage key={page.id} page={page} />;
}

function MissingLocalPage() {
  const router = useRouter();

  function createNewPage() {
    const page = createLocalPage("recovery");
    router.replace(`/musings/${page.id}`);
  }

  return (
    <PageContent>
      <div className="flex max-w-xl flex-col gap-4 pt-10">
        <span className="text-[56px] leading-none">📝</span>
        <h1 className="text-foreground text-[32px] leading-tight font-bold sm:text-[38px]">
          This page isn’t available in this browser.
        </h1>
        <p className="text-muted-foreground text-[16px] leading-relaxed font-medium">
          Local pages only exist in the browser where they were created. It may
          have been deleted, or this link may have been opened somewhere else.
        </p>
        <div>
          <button
            type="button"
            onClick={createNewPage}
            className="bg-foreground text-background cursor-pointer rounded-md px-3 py-2 text-[14px] font-semibold transition-opacity hover:opacity-85"
          >
            Create a new page
          </button>
        </div>
      </div>
    </PageContent>
  );
}

function EditableLocalPage({ page }: { page: LocalPage }) {
  const router = useRouter();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const pendingContentRef = useRef<JSONContent | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const flushContent = useCallback(() => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (pendingContentRef.current) {
      updateLocalPage(page.id, { content: pendingContentRef.current });
      pendingContentRef.current = null;
    }
  }, [page.id]);

  const editor = useEditor(
    {
      extensions: localEditorExtensions,
      content: page.content ?? "",
      immediatelyRender: false,
      editorProps: {
        attributes: {
          "aria-label": "Page content",
        },
      },
      onUpdate: ({ editor: nextEditor }) => {
        pendingContentRef.current = nextEditor.getJSON();

        if (saveTimerRef.current !== null) {
          window.clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = window.setTimeout(flushContent, 500);
      },
    },
    [page.id],
  );

  useEffect(() => flushContent, [flushContent]);

  useEffect(() => {
    const title = `${page.title || "Untitled"} • Brennen Ho`;
    document.title = title;

    const timeout = window.setTimeout(() => {
      document.title = title;
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [page.title]);

  useEffect(() => {
    const textarea = titleRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [page.title]);

  function handleTitleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    editor?.commands.focus("start");
  }

  function handleDelete() {
    if (!window.confirm("Delete this page from this browser?")) return;

    flushContent();
    deleteLocalPage(page.id);
    router.push("/");
  }

  return (
    <PageContent className="local-page">
      <div className="relative mb-1 w-fit">
        <button
          type="button"
          aria-label="Change page icon"
          aria-expanded={emojiPickerOpen}
          className="hover:bg-accent cursor-pointer rounded-md text-[72px] leading-none transition-colors sm:text-[78px]"
          onClick={() => setEmojiPickerOpen((open) => !open)}
        >
          {page.emoji}
        </button>
        {emojiPickerOpen ? (
          <EmojiPicker
            onClose={() => setEmojiPickerOpen(false)}
            onSelect={(emoji) => updateLocalPage(page.id, { emoji })}
          />
        ) : null}
      </div>

      <textarea
        ref={titleRef}
        rows={1}
        value={page.title}
        autoFocus={!page.title && page.content === null}
        aria-label="Page title"
        placeholder="Untitled"
        onChange={(event) =>
          updateLocalPage(page.id, { title: event.target.value })
        }
        onKeyDown={handleTitleKeyDown}
        className="text-foreground placeholder:text-muted-foreground/55 mb-[10px] w-full resize-none overflow-hidden bg-transparent text-[42px] leading-[1.12] font-bold tracking-normal outline-none sm:text-[48px]"
      />

      <div className="text-muted-foreground mb-4 flex items-center gap-2 text-[14px] font-medium">
        <span>Private</span>
        <span aria-hidden="true">•</span>
        <span>Saved in this browser</span>
        <button
          type="button"
          onClick={handleDelete}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive ml-auto flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      <div className="local-editor">
        <EditorContent editor={editor} />
      </div>
    </PageContent>
  );
}
