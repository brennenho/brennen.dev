"use client";

import { PageContent, PageIcon, PageTitle } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import {
  createLocalPage,
  DEFAULT_LOCAL_PAGE_TITLE,
  MISSING_MUSING,
  openLocalPage,
  updateLocalPage,
  useLocalPagesSaved,
  type LocalPage,
} from "@/lib/local-pages";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Selection } from "@tiptap/pm/state";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { localEditorExtensions } from "./editor-extensions";
import { EmojiPicker } from "./emoji-picker";

export function PageEditor({ page }: { page: LocalPage | null | undefined }) {
  let content;
  if (page === undefined) {
    content = <span className="sr-only">Loading page</span>;
  } else if (page) {
    content = <EditableLocalPage key={page.id} page={page} />;
  } else {
    content = <MissingLocalPage />;
  }

  return <PageContent className="ph-no-capture">{content}</PageContent>;
}

function MissingLocalPage() {
  function createNewPage() {
    const page = createLocalPage("recovery");
    openLocalPage(page.id, { replace: true });
  }

  return (
    <>
      <PageIcon>{MISSING_MUSING.emoji}</PageIcon>
      <PageTitle>{MISSING_MUSING.title}</PageTitle>
      <p className="text-muted-foreground max-w-md leading-relaxed">
        Musings are saved in your browser and can&apos;t be shared. Clearing
        cookies will also erase them.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={createNewPage}
        className="mt-2 cursor-pointer self-start"
      >
        Create page
      </Button>
    </>
  );
}

function EditableLocalPage({ page }: { page: LocalPage }) {
  const saved = useLocalPagesSaved();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const pendingContentRef = useRef<ProseMirrorNode | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  const flushContent = useCallback(() => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const doc = pendingContentRef.current;
    if (doc) {
      pendingContentRef.current = null;
      updateLocalPage(page.id, { content: doc.toJSON() as JSONContent });
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
        pendingContentRef.current = nextEditor.state.doc;

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
    const { state, view } = editor;
    view.dispatch(
      state.tr.setSelection(Selection.atStart(state.doc)).scrollIntoView(),
    );
    view.focus();
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
