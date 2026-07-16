"use client";

import { Shuffle } from "lucide-react";
import { useEffect } from "react";

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
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (emoji: string) => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function chooseEmoji(emoji: string) {
    onSelect(emoji);
    onClose();
  }

  function chooseRandomEmoji() {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    if (emoji) chooseEmoji(emoji);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close emoji picker"
        className="fixed inset-0 z-40 cursor-default"
        onClick={onClose}
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
              type="button"
              className="hover:bg-accent flex h-8 w-8 cursor-pointer items-center justify-center rounded text-[20px] transition-colors"
              onClick={() => chooseEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="border-border text-muted-foreground hover:text-foreground mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded border-t px-2 pt-2 text-[12px] font-semibold transition-colors"
          onClick={chooseRandomEmoji}
        >
          <Shuffle className="h-3.5 w-3.5" />
          Shuffle
        </button>
      </div>
    </>
  );
}
