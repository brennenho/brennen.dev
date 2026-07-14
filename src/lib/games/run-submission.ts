type ReadyGameScoreSubmission = {
  runToken: string;
  score: number;
};

type GameRunSubmissionCoordinator = {
  cancel: () => void;
  complete: (score: number) => void;
  hasCompleted: () => boolean;
  setRunToken: (runToken: string) => void;
};

export type { GameRunSubmissionCoordinator, ReadyGameScoreSubmission };

export function createGameRunSubmissionCoordinator(
  onReady: (submission: ReadyGameScoreSubmission) => void,
): GameRunSubmissionCoordinator {
  let cancelled = false;
  let completedScore: number | null = null;
  let runToken: string | null = null;
  let submitted = false;

  function submitIfReady() {
    if (cancelled || submitted || completedScore === null || !runToken) return;

    submitted = true;
    onReady({ runToken, score: completedScore });
  }

  return {
    cancel() {
      cancelled = true;
    },
    complete(score) {
      if (cancelled || submitted || completedScore !== null) return;

      completedScore = score;
      submitIfReady();
    },
    hasCompleted() {
      return completedScore !== null;
    },
    setRunToken(nextRunToken) {
      if (cancelled || submitted || runToken) return;

      runToken = nextRunToken;
      submitIfReady();
    },
  };
}
