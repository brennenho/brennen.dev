"use client";

import { generateLocalPageId, isLocalPageId } from "@/lib/local-page-id";
import type { JSONContent } from "@tiptap/react";
import posthog from "posthog-js";
import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "brennen.dev:local-pages:v1";
const EMPTY_PAGES: readonly LocalPage[] = Object.freeze([]);

export type LocalPage = {
  id: string;
  title: string;
  emoji: string;
  content: JSONContent | null;
  createdAt: number;
  updatedAt: number;
};

export type LocalPageCreationSource = "sidebar" | "recovery";

type LocalPagePatch = Partial<Pick<LocalPage, "title" | "emoji" | "content">>;

let pages: readonly LocalPage[] = EMPTY_PAGES;
let initialized = false;
let storageWarningShown = false;
const listeners = new Set<() => void>();

function parsePages(value: string | null): LocalPage[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (!isRecord(parsed) || !Array.isArray(parsed.pages)) return [];

    return parsed.pages.filter(isLocalPage);
  } catch {
    return [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLocalPage(value: unknown): value is LocalPage {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    isLocalPageId(value.id) &&
    typeof value.title === "string" &&
    typeof value.emoji === "string" &&
    (value.content === null || isRecord(value.content)) &&
    typeof value.createdAt === "number" &&
    typeof value.updatedAt === "number"
  );
}

function initialize() {
  if (initialized || typeof window === "undefined") return;

  initialized = true;
  try {
    pages = parsePages(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    pages = EMPTY_PAGES;
    showStorageWarning();
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;

    pages = parsePages(event.newValue);
    emitChange();
  });

  emitChange();
}

function emitChange() {
  for (const listener of listeners) listener();
}

function persistPages() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ pages }));
  } catch {
    showStorageWarning();
  }
}

function showStorageWarning() {
  if (storageWarningShown) return;

  storageWarningShown = true;
  toast.error("This page can’t be saved in this browser.");
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return pages;
}

function getServerSnapshot() {
  return EMPTY_PAGES;
}

export function useLocalPages() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => initialize(), []);

  return snapshot;
}

export function useLocalPagesReady() {
  const ready = useSyncExternalStore(
    subscribe,
    () => initialized,
    () => false,
  );

  useEffect(() => initialize(), []);

  return ready;
}

export function useLocalPage(id: string) {
  return useLocalPages().find((page) => page.id === id);
}

export function createLocalPage(source: LocalPageCreationSource) {
  initialize();

  let id = generateLocalPageId();
  while (pages.some((page) => page.id === id)) {
    id = generateLocalPageId();
  }

  const now = Date.now();
  const page: LocalPage = {
    id,
    title: "",
    emoji: "📝",
    content: null,
    createdAt: now,
    updatedAt: now,
  };

  pages = [...pages, page];
  persistPages();
  emitChange();

  posthog.capture("local_page_created", {
    $process_person_profile: false,
    source,
  });

  return page;
}

export function updateLocalPage(id: string, patch: LocalPagePatch) {
  initialize();

  let changed = false;
  pages = pages.map((page) => {
    if (page.id !== id) return page;

    changed = true;
    return { ...page, ...patch, updatedAt: Date.now() };
  });

  if (!changed) return;

  persistPages();
  emitChange();
}

export function deleteLocalPage(id: string) {
  initialize();

  const nextPages = pages.filter((page) => page.id !== id);
  if (nextPages.length === pages.length) return;

  pages = nextPages;
  persistPages();
  emitChange();
}
