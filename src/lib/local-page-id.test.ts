import { describe, expect, it } from "vitest";
import { isLocalPageId, isLocalPagePath } from "./local-page-id";

describe("local page identity", () => {
  it("recognizes reserved local page ids", () => {
    expect(isLocalPageId("a1b2c3d4")).toBe(true);
    expect(isLocalPageId("new-start")).toBe(false);
    expect(isLocalPageId("ABC12345")).toBe(false);
  });

  it("recognizes only direct local musing paths", () => {
    expect(isLocalPagePath("/musings/a1b2c3d4")).toBe(true);
    expect(isLocalPagePath("/musings/a1b2c3d4/")).toBe(true);
    expect(isLocalPagePath("/musings/new-start")).toBe(false);
    expect(isLocalPagePath("/musings/a1b2c3d4/edit")).toBe(false);
  });
});
