"use client";

import { Shuffle, Smile } from "lucide-react";
import { useRef, useState } from "react";

const EMOJIS = [
  "📝",
  "💭",
  "💡",
  "✨",
  "⭐",
  "🌱",
  "🌿",
  "🌻",
  "🌊",
  "☀️",
  "🌙",
  "🌈",
  "🔥",
  "⚡",
  "🎯",
  "🚀",
  "🧠",
  "👀",
  "🤔",
  "😊",
  "🥳",
  "🤝",
  "❤️",
  "💜",
  "📚",
  "📌",
  "📎",
  "✏️",
  "🗒️",
  "📓",
  "📁",
  "🔖",
  "🔍",
  "🔧",
  "🧩",
  "🎨",
  "🎵",
  "🎮",
  "💻",
  "⌨️",
  "📱",
  "🏠",
  "🏆",
  "🦖",
  "🪴",
  "☕",
  "🍜",
  "🍀",
] as const;

export function EmojiPicker({
  icon,
  onSelect,
}: {
  icon: string;
  onSelect: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function closePicker() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function chooseEmoji(emoji: string) {
    onSelect(emoji);
    closePicker();
  }

  return (
    <div
      className="relative mb-1 w-fit"
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.stopPropagation();
          closePicker();
        }
      }}
    >
      <button
        type="button"
        ref={triggerRef}
        aria-label={icon ? "Change page icon" : "Add icon"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={
          icon
            ? "hover:bg-accent mb-2 cursor-pointer rounded-md text-[72px] leading-none sm:text-[78px]"
            : "add-page-icon text-muted-foreground hover:bg-accent focus-visible:bg-accent aria-expanded:bg-accent -ml-2 inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm leading-none font-medium dark:hover:bg-white/5"
        }
        onClick={() => setOpen((open) => !open)}
      >
        {icon || (
          <>
            <Smile
              aria-hidden="true"
              fill="currentColor"
              className="[&_line]:stroke-background [&_path]:stroke-background size-3.5 shrink-0"
            />
            Add icon
          </>
        )}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close emoji picker"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={closePicker}
          />
          <div
            role="dialog"
            aria-label="Choose a page icon"
            className="border-border bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-2 w-[296px] rounded-lg border p-2 shadow-lg"
          >
            <div className="grid grid-cols-8 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  autoFocus={emoji === EMOJIS[0]}
                  type="button"
                  className="hover:bg-accent flex h-8 w-8 cursor-pointer items-center justify-center rounded text-[20px] transition-colors"
                  onClick={() => chooseEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="border-border mt-2 flex gap-1 border-t pt-1">
              <button
                type="button"
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex flex-1 cursor-pointer items-center justify-center gap-2 rounded px-2 py-1.5 text-[12px] font-semibold transition-colors"
                onClick={() => {
                  const emoji =
                    EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
                  if (emoji) chooseEmoji(emoji);
                }}
              >
                <Shuffle className="h-3.5 w-3.5" />
                Shuffle
              </button>
              {icon && (
                <button
                  type="button"
                  onClick={() => chooseEmoji("")}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground flex-1 cursor-pointer rounded px-2 py-1.5 text-xs font-semibold"
                >
                  Remove icon
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
