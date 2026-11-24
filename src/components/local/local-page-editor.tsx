"use client";

import { PageContent } from "@/components/blocks";
import {
  createLocalPage,
  updateLocalPage,
  useLocalPage,
  useLocalPagesReady,
  useLocalPagesSaved,
  type LocalPage,
} from "@/lib/local-pages";
import { DEFAULT_LOCAL_PAGE_TITLE, SITE_NAME } from "@/lib/site";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
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
  const saved = useLocalPagesSaved();
  const iconButtonRef = useRef<HTMLButtonElement>(null);
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
    const title = `${page.title || DEFAULT_LOCAL_PAGE_TITLE} • ${SITE_NAME}`;
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
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

    event.preventDefault();
    if (!editor) return;
    editor.commands.focus("start");
    // Tiptap schedules DOM focus on the next frame. Route immediate typing to the body.
    editor.view.focus();
  }

  return (
    <PageContent className="ph-no-capture">
      <div className="local-page-heading">
        <div className="relative mb-1 w-fit">
          <button
            type="button"
            ref={iconButtonRef}
            aria-label={page.emoji ? "Change page icon" : "Add icon"}
            aria-haspopup="dialog"
            aria-expanded={emojiPickerOpen}
            className={
              page.emoji
                ? "hover:bg-accent mb-2 cursor-pointer rounded-md text-[72px] leading-none sm:text-[78px]"
                : "add-page-icon text-muted-foreground hover:bg-accent focus-visible:bg-accent aria-expanded:bg-accent -ml-2 inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm leading-none font-medium dark:hover:bg-white/5"
            }
            onClick={() => setEmojiPickerOpen((open) => !open)}
          >
            {page.emoji || (
              <>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-3.5 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 .75a7.25 7.25 0 1 0 0 14.5A7.25 7.25 0 0 0 8 .75ZM5.5 5.25a.88.88 0 1 0 0 1.76.88.88 0 0 0 0-1.76Zm5 0a.88.88 0 1 0 0 1.76.88.88 0 0 0 0-1.76ZM4.85 9.2a.6.6 0 0 1 .84.12 2.9 2.9 0 0 0 4.62 0 .6.6 0 1 1 .96.72 4.1 4.1 0 0 1-6.54 0 .6.6 0 0 1 .12-.84Z"
                  />
                </svg>
                Add icon
              </>
            )}
          </button>
          {emojiPickerOpen ? (
            <EmojiPicker
              hasIcon={Boolean(page.emoji)}
              onClose={() => {
                setEmojiPickerOpen(false);
                iconButtonRef.current?.focus();
              }}
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
    </PageContent>
  );
}
