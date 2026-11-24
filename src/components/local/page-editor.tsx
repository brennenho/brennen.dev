"use client";

import { PageContent } from "@/components/blocks";
import {
  createLocalPage,
  openLocalPage,
  updateLocalPage,
  useLocalPage,
  useLocalPagesReady,
  useLocalPagesSaved,
  type LocalPage,
} from "@/lib/local-pages";
import { DEFAULT_LOCAL_PAGE_TITLE, SITE_NAME } from "@/lib/site";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { localEditorExtensions } from "./editor-extensions";
import { EmojiPicker } from "./emoji-picker";

export function PageEditor({ id }: { id: string }) {
  const page = useLocalPage(id);
  const ready = useLocalPagesReady();

  let content;
  if (!ready) {
    content = <span className="sr-only">Loading page</span>;
  } else if (page) {
    content = <EditableLocalPage key={page.id} page={page} />;
  } else {
    content = <MissingLocalPage />;
  }

  const { title = "" } = page ?? {};

  return (
    <PageContent className="ph-no-capture">
      <title>{`${title || DEFAULT_LOCAL_PAGE_TITLE} • ${SITE_NAME}`}</title>
      {content}
    </PageContent>
  );
}

function MissingLocalPage() {
  function createNewPage() {
    const page = createLocalPage("recovery");
    openLocalPage(page.id, { replace: true });
  }

  return (
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
  );
}

function EditableLocalPage({ page }: { page: LocalPage }) {
  const saved = useLocalPagesSaved();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const pendingContentRef = useRef<JSONContent | null>(null);
  const saveTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") flushContent();
    }

    window.addEventListener("pagehide", flushContent);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushContent);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      flushContent();
    };
  }, [flushContent]);

  useEffect(() => {
    // Storage events update the page object, but Tiptap only reads its initial
    // content once. Apply external edits without emitting another save or
    // replacing edits that this tab has not flushed yet.
    if (!editor || pendingContentRef.current) return;
    if (JSON.stringify(editor.getJSON()) === JSON.stringify(page.content))
      return;

    editor.commands.setContent(page.content ?? "", { emitUpdate: false });
  }, [editor, page.content]);

  useEffect(() => {
    const textarea = titleRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [page.title]);

  function handleTitleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

    event.preventDefault();
    if (!editor) return;
    editor.commands.focus("start");
    // Tiptap schedules DOM focus on the next frame. Route immediate typing to the body.
    editor.view.focus();
  }

  return (
    <>
      <div className="local-page-heading">
        <EmojiPicker
          icon={page.emoji}
          onSelect={(emoji) => updateLocalPage(page.id, { emoji })}
        />

        <textarea
          ref={titleRef}
          rows={1}
          value={page.title}
          autoFocus={!page.title && page.content === null}
          aria-label="Page title"
          placeholder={DEFAULT_LOCAL_PAGE_TITLE}
          onChange={(event) =>
            updateLocalPage(page.id, { title: event.target.value })
          }
          onKeyDown={handleTitleKeyDown}
          className="text-foreground placeholder:text-muted-foreground/55 mb-[10px] w-full resize-none overflow-hidden bg-transparent text-[42px] leading-[1.12] font-bold tracking-normal outline-none sm:text-[48px]"
        />
      </div>
      {!saved && (
        <p className="text-muted-foreground text-sm" role="status">
          Not saved — browser storage is unavailable
        </p>
      )}

      <div className="local-editor">
        <EditorContent editor={editor} />
      </div>
    </>
  );
}
