import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LocalPage } from "./local-pages";
import type * as LocalPagesStore from "./local-pages";

const mocks = vi.hoisted(() => ({ capture: vi.fn(), error: vi.fn() }));
vi.mock("posthog-js", () => ({ default: { capture: mocks.capture } }));
vi.mock("sonner", () => ({ toast: { error: mocks.error } }));

const STORAGE_KEY = "brennen.dev:local-pages:v1";
let store: typeof LocalPagesStore;
let values: Map<string, string>;
let browser: EventTarget & {
  localStorage: Pick<Storage, "getItem" | "setItem">;
};

beforeEach(async () => {
  vi.resetModules();
  values = new Map();
  browser = Object.assign(new EventTarget(), {
    localStorage: {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        values.set(key, value);
      }),
    },
  });
  vi.stubGlobal("window", browser);
  store = await import("./local-pages");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("browser-local pages", () => {
  it("persists creation, edits, and deletion without sending the content to analytics", () => {
    const page = store.createLocalPage("sidebar");
    store.updateLocalPage(page.id, { title: "Private title", emoji: "🌱" });
    expect(readPages()).toMatchObject([
      { id: page.id, title: "Private title", emoji: "🌱" },
    ]);
    expect(mocks.capture).toHaveBeenCalledExactlyOnceWith(
      "local_page_created",
      {
        $process_person_profile: false,
        source: "sidebar",
      },
    );

    store.deleteLocalPage(page.id);
    expect(readPages()).toEqual([]);
  });

  it("preserves another tab's page even before its storage event is delivered", () => {
    const page = store.createLocalPage("sidebar");
    const otherPage = { ...page, id: "other123", title: "Other tab" };
    values.set(STORAGE_KEY, JSON.stringify({ pages: [page, otherPage] }));

    store.updateLocalPage(page.id, { title: "This tab" });
    expect(readPages()).toMatchObject([
      { id: page.id, title: "This tab" },
      { id: "other123", title: "Other tab" },
    ]);
  });

  it("does not resurrect pages removed by another tab", () => {
    const page = store.createLocalPage("sidebar");
    values.set(STORAGE_KEY, JSON.stringify({ pages: [] }));

    store.updateLocalPage(page.id, { title: "Stale edit" });
    store.createLocalPage("sidebar");
    expect(readPages()).toHaveLength(1);
    expect(readPages()[0]?.id).not.toBe(page.id);
  });

  it("handles a storage clear event without restoring deleted pages", () => {
    const page = store.createLocalPage("sidebar");
    values.clear();
    browser.dispatchEvent(Object.assign(new Event("storage"), { key: null }));

    store.createLocalPage("sidebar");
    expect(readPages()).toHaveLength(1);
    expect(readPages()[0]?.id).not.toBe(page.id);
  });

  it("retains unsaved in-memory pages when storage fails and later recovers", () => {
    vi.mocked(browser.localStorage.setItem).mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
    const page = store.createLocalPage("sidebar");
    store.updateLocalPage(page.id, { title: "Keep this draft" });
    expect(mocks.error).toHaveBeenCalledOnce();

    vi.mocked(browser.localStorage.setItem).mockImplementation((key, value) => {
      values.set(key, value);
    });
    store.updateLocalPage(page.id, { emoji: "🌱" });
    expect(readPages()).toMatchObject([
      { title: "Keep this draft", emoji: "🌱" },
    ]);
  });

  it("recovers from invalid stored JSON", () => {
    values.set(STORAGE_KEY, "invalid JSON");
    const page = store.createLocalPage("recovery");
    expect(readPages()).toEqual([page]);
  });
});

function readPages() {
  return (
    JSON.parse(values.get(STORAGE_KEY) ?? '{"pages":[]}') as {
      pages: LocalPage[];
    }
  ).pages;
}
