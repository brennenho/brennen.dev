"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import {
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const defaultAuthor = "Brennen Ho";
const defaultAvatarSrc = "/img/notion.png";
const popoverGap = 6;
const popoverMargin = 8;

type CommentEntry = {
  author?: string;
  avatarSrc?: string;
  content: ReactNode;
  reactions?: string[];
};

type CommentInput = CommentEntry | ReactNode;

type ThreadProps = {
  author?: string;
  avatarSrc?: string;
  comment?: CommentInput;
  comments?: CommentInput[];
  reactions?: string[];
};

type CommentProps = ThreadProps & {
  children: ReactNode;
  className?: string;
};

type DiscussionProps = ThreadProps & {
  className?: string;
};

export function Comment({ children, className, ...thread }: CommentProps) {
  const entries = normalizeComments(thread);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number }>();

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const popover = popoverRef.current;

    if (!anchor || !popover) return;

    const anchorRect = anchor.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const left = Math.max(
      popoverMargin,
      Math.min(
        anchorRect.left,
        window.innerWidth - popoverRect.width - popoverMargin,
      ),
    );
    const fitsBelow =
      anchorRect.bottom + popoverGap + popoverRect.height <=
      window.innerHeight - popoverMargin;
    const fitsAbove =
      anchorRect.top - popoverGap - popoverRect.height >= popoverMargin;
    const top =
      fitsBelow || !fitsAbove
        ? anchorRect.bottom + popoverGap
        : anchorRect.top - popoverGap - popoverRect.height;

    setPosition({ left, top });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        anchorRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (entries.length === 0) {
    return <>{children}</>;
  }

  function handleAnchorKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    setOpen((value) => !value);
  }

  const popoverStyle: CSSProperties = position
    ? { left: position.left, top: position.top }
    : { left: 0, top: 0, visibility: "hidden" };

  return (
    <>
      <span
        aria-expanded={open}
        className={cn(
          "cursor-pointer border-b-2 border-[rgba(255,212,0,0.43)] bg-[rgba(255,212,0,0.14)] [box-decoration-break:clone] transition-colors duration-100 hover:bg-[rgba(255,212,0,0.22)]",
          open && "bg-[rgba(255,212,0,0.25)]",
          className,
        )}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleAnchorKeyDown}
        ref={anchorRef}
        role="button"
        tabIndex={0}
      >
        {children}
      </span>
      {open
        ? createPortal(
            <div
              className="fixed z-50 w-[350px] max-w-[calc(100vw-16px)] rounded-lg bg-popover p-3 shadow-[0_0_0_1px_var(--border),0_3px_6px_rgba(0,0,0,0.1),0_9px_24px_rgba(0,0,0,0.2)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.094),0_3px_6px_rgba(0,0,0,0.2),0_9px_24px_rgba(0,0,0,0.4)]"
              ref={popoverRef}
              style={popoverStyle}
            >
              <CommentThread entries={entries} quote={children} />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function Discussion({ className, ...thread }: DiscussionProps) {
  const entries = normalizeComments(thread);

  if (entries.length === 0) return null;

  return <CommentThread className={cn("py-1", className)} entries={entries} />;
}

function CommentThread({
  className,
  entries,
  quote,
}: {
  className?: string;
  entries: CommentEntry[];
  quote?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {entries.map((entry, index) => (
        <CommentItem
          entry={entry}
          key={index}
          quote={index === 0 ? quote : undefined}
        />
      ))}
    </div>
  );
}

function CommentItem({
  entry,
  quote,
}: {
  entry: CommentEntry;
  quote?: ReactNode;
}) {
  const author = entry.author ?? defaultAuthor;

  return (
    <div className="flex items-start gap-2.5">
      <CommentAvatar author={author} src={entry.avatarSrc} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="truncate text-[14px] font-semibold text-popover-foreground/85">
            {author}
          </span>
        </div>
        {quote ? (
          <div className="mt-1.5 flex items-stretch gap-2">
            <span className="w-[3px] shrink-0 rounded-full bg-[rgba(255,212,0,0.65)]" />
            <span className="truncate text-[14px] text-popover-foreground/85">
              {quote}
            </span>
          </div>
        ) : null}
        <div className="mt-1.5 text-[14px] leading-normal text-popover-foreground/85">
          {entry.content}
        </div>
        {entry.reactions?.length ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {entry.reactions.map((emoji, index) => (
              <ReactionPill emoji={emoji} key={index} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CommentAvatar({ author, src }: { author: string; src?: string }) {
  return (
    <Image
      alt={author}
      className="mt-0.5 size-6 shrink-0 rounded-full object-cover"
      height={24}
      src={src ?? defaultAvatarSrc}
      width={24}
    />
  );
}

function ReactionPill({ emoji }: { emoji: string }) {
  const [active, setActive] = useState(false);

  return (
    <button
      className={cn(
        "flex h-6 items-center gap-1 rounded-full border px-2 text-[12px] leading-none transition-colors",
        active
          ? "border-[rgba(35,131,226,0.57)] bg-[rgba(35,131,226,0.14)] text-[#2383e2] dark:text-[#529cca]"
          : "border-border text-muted-foreground hover:bg-accent",
      )}
      onClick={() => setActive((value) => !value)}
      type="button"
    >
      <span className="text-[13px]">{emoji}</span>
      <span className="font-medium">{active ? 2 : 1}</span>
    </button>
  );
}

function isCommentEntry(input: CommentInput): input is CommentEntry {
  return (
    typeof input === "object" &&
    input !== null &&
    !Array.isArray(input) &&
    !isValidElement(input) &&
    "content" in input
  );
}

function normalizeComments({
  author,
  avatarSrc,
  comment,
  comments,
  reactions,
}: ThreadProps): CommentEntry[] {
  const inputs = comments ?? (comment === undefined ? [] : [comment]);

  return inputs.map((input, index) => {
    const entry = isCommentEntry(input) ? input : { content: input };

    return {
      author: entry.author ?? author,
      avatarSrc: entry.avatarSrc ?? avatarSrc,
      content: entry.content,
      reactions: entry.reactions ?? (index === 0 ? reactions : undefined),
    };
  });
}
