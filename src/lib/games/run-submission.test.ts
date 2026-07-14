import { describe, expect, it, vi } from "vitest";

import { createGameRunSubmissionCoordinator } from "./run-submission";

describe("createGameRunSubmissionCoordinator", () => {
  it("submits when the token arrives before the completed score", () => {
    const onReady = vi.fn();
    const run = createGameRunSubmissionCoordinator(onReady);

    run.setRunToken("run-token");
    run.complete(1_024);

    expect(onReady).toHaveBeenCalledWith({
      runToken: "run-token",
      score: 1_024,
    });
  });

  it("retains a completed score until a late token arrives", () => {
    const onReady = vi.fn();
    const run = createGameRunSubmissionCoordinator(onReady);

    run.complete(1_727);
    expect(onReady).not.toHaveBeenCalled();

    run.setRunToken("late-run-token");
    expect(onReady).toHaveBeenCalledWith({
      runToken: "late-run-token",
      score: 1_727,
    });
  });

  it("submits a completed run exactly once", () => {
    const onReady = vi.fn();
    const run = createGameRunSubmissionCoordinator(onReady);

    run.complete(5_237);
    run.setRunToken("run-token");
    run.complete(6_000);
    run.setRunToken("another-token");

    expect(onReady).toHaveBeenCalledOnce();
  });

  it("does not submit a cancelled run", () => {
    const onReady = vi.fn();
    const run = createGameRunSubmissionCoordinator(onReady);

    run.complete(100);
    run.cancel();
    run.setRunToken("run-token");

    expect(onReady).not.toHaveBeenCalled();
  });

  it("keeps consecutive runs independent", () => {
    const firstReady = vi.fn();
    const secondReady = vi.fn();
    const firstRun = createGameRunSubmissionCoordinator(firstReady);
    const secondRun = createGameRunSubmissionCoordinator(secondReady);

    firstRun.complete(1_024);
    secondRun.complete(100);
    secondRun.setRunToken("second-token");
    firstRun.setRunToken("first-token");

    expect(firstReady).toHaveBeenCalledWith({
      runToken: "first-token",
      score: 1_024,
    });
    expect(secondReady).toHaveBeenCalledWith({
      runToken: "second-token",
      score: 100,
    });
  });
});
