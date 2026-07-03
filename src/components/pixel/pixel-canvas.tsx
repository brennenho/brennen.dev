"use client";

import { getGameConfig } from "@/lib/games/config";
import { GAME_LEADERBOARD_UPDATED_EVENT } from "@/lib/games/events";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { createDinoScene } from "./games/dino/scene";
import type { PixelScene, PixelSceneStatus } from "./scene";

const DINO_CONFIG = getGameConfig("dino");
const DINO_HIGH_SCORE_STORAGE_KEY = "dino_high_score";

type PixelCanvasProps = {
  className?: string;
};

export function PixelCanvas({ className }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<PixelScene | null>(null);
  const frameRef = useRef<number | null>(null);
  const actionHeldRef = useRef(false);
  const isStartingRunRef = useRef(false);
  const lastTimeRef = useRef<number>(0);
  const highScoreRef = useRef(0);
  const pendingScoreRef = useRef<number | null>(null);
  const runRequestIdRef = useRef(0);
  const runTokenRef = useRef<string | null>(null);
  const submittedRunRef = useRef(false);
  const statusRef = useRef<PixelSceneStatus>("cover");
  const [isInteractive, setIsInteractive] = useState(false);
  const [status, setStatus] = useState<PixelSceneStatus>("cover");

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;

    if (!canvas || !scene) return;

    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * scale));
    canvas.height = Math.max(1, Math.floor(rect.height * scale));
    scene.resize(canvas.width, canvas.height, scale);
  }, []);

  const startRun = useCallback(async () => {
    const response = await fetch(DINO_CONFIG.runEndpoint, {
      cache: "no-store",
      credentials: "same-origin",
      method: "POST",
    });

    if (!response.ok) return null;

    const body = (await response.json().catch(() => null)) as unknown;

    if (!isRunResponse(body)) return null;

    return body;
  }, []);

  const setHighScoreValue = useCallback((score: number) => {
    if (!Number.isFinite(score) || score < 0) return;

    const nextHighScore = Math.floor(score);
    highScoreRef.current = nextHighScore;
    sceneRef.current?.setHighScore(nextHighScore);

    try {
      window.localStorage.setItem(
        DINO_HIGH_SCORE_STORAGE_KEY,
        String(nextHighScore),
      );
    } catch {
      // Local storage can be unavailable in privacy-restricted contexts.
    }
  }, []);

  const sendScore = useCallback(
    (runToken: string, score: number) => {
      const body = JSON.stringify({ runToken, score });

      void fetch(DINO_CONFIG.scoreEndpoint, {
        body,
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
        method: "POST",
      })
        .then(async (response) => {
          const body = (await response.json().catch(() => null)) as unknown;

          if (isScoreResponse(body)) {
            setHighScoreValue(body.highScore);

            if (body.isNewHighScore) {
              window.dispatchEvent(new Event(GAME_LEADERBOARD_UPDATED_EVENT));
            }
          }
        })
        .catch((error: unknown) => {
          if (process.env.NODE_ENV === "development") {
            console.warn("Unable to submit Dino score", error);
          }
        });
    },
    [setHighScoreValue],
  );

  const start = useCallback(() => {
    if (isStartingRunRef.current) return;

    const runRequestId = runRequestIdRef.current + 1;
    runRequestIdRef.current = runRequestId;
    isStartingRunRef.current = true;
    pendingScoreRef.current = null;
    runTokenRef.current = null;
    submittedRunRef.current = false;
    sceneRef.current?.start();
    statusRef.current = "playing";
    setStatus("playing");

    void startRun()
      .then((run) => {
        if (!run || runRequestIdRef.current !== runRequestId) return;

        setHighScoreValue(run.highScore);

        const pendingScore = pendingScoreRef.current;
        if (pendingScore !== null) {
          pendingScoreRef.current = null;
          sendScore(run.runToken, pendingScore);
          return;
        }

        runTokenRef.current = run.runToken;
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Unable to start Dino run", error);
        }
      })
      .finally(() => {
        if (runRequestIdRef.current === runRequestId) {
          isStartingRunRef.current = false;
        }
      });
  }, [sendScore, setHighScoreValue, startRun]);

  const reset = useCallback(() => {
    actionHeldRef.current = false;
    pendingScoreRef.current = null;
    runRequestIdRef.current += 1;
    runTokenRef.current = null;
    isStartingRunRef.current = false;
    submittedRunRef.current = false;
    sceneRef.current?.reset();
    statusRef.current = "cover";
    setStatus("cover");
  }, []);

  const submitScore = useCallback(
    (score: number) => {
      const runToken = runTokenRef.current;

      if (!runToken) {
        pendingScoreRef.current = score;
        return;
      }

      runTokenRef.current = null;
      sendScore(runToken, score);
    },
    [sendScore],
  );

  const trigger = useCallback(() => {
    if (!isInteractive) return;
    if (!sceneRef.current) return;

    if (statusRef.current === "cover") {
      start();
      return;
    }

    if (statusRef.current === "over") {
      reset();
      return;
    }

    sceneRef.current.action();
  }, [isInteractive, reset, start]);

  const releaseAction = useCallback(() => {
    sceneRef.current?.releaseAction();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");

    function syncInteractivity() {
      setIsInteractive(query.matches);

      if (!query.matches) {
        reset();
      }
    }

    syncInteractivity();
    query.addEventListener("change", syncInteractivity);

    return () => query.removeEventListener("change", syncInteractivity);
  }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const scene = createDinoScene(context);
    sceneRef.current = scene;
    scene.setHighScore(highScoreRef.current);
    resize();

    const tick = (time: number) => {
      const delta = Math.min(32, time - (lastTimeRef.current || time));
      lastTimeRef.current = time;
      scene.update(delta);
      const nextStatus = scene.status();
      if (nextStatus !== statusRef.current) {
        const previousStatus = statusRef.current;
        statusRef.current = nextStatus;
        setStatus(nextStatus);

        if (
          previousStatus === "playing" &&
          nextStatus === "over" &&
          !submittedRunRef.current
        ) {
          submittedRunRef.current = true;
          submitScore(scene.score());
        }
      }
      scene.render();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [resize, submitScore]);

  useEffect(() => {
    const storedHighScore = window.localStorage.getItem(
      DINO_HIGH_SCORE_STORAGE_KEY,
    );
    const parsedHighScore = Number(storedHighScore);

    if (Number.isFinite(parsedHighScore) && parsedHighScore > 0) {
      setHighScoreValue(parsedHighScore);
    }
  }, [setHighScoreValue]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isInteractive) return;

      if (isActionKey(event.code)) {
        event.preventDefault();
        if (event.repeat) return;
        actionHeldRef.current = true;
        trigger();
      } else if (event.code === "Escape") {
        event.preventDefault();
        reset();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isInteractive) return;
      if (!isActionKey(event.code)) return;

      event.preventDefault();
      actionHeldRef.current = false;
      releaseAction();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isInteractive, releaseAction, reset, trigger]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;

      actionHeldRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      trigger();
    },
    [trigger],
  );

  const handlePointerRelease = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      actionHeldRef.current = false;
      releaseAction();
    },
    [releaseAction],
  );

  return (
    <button
      type="button"
      aria-label={
        !isInteractive
          ? "Pixel canvas cover"
          : status === "playing"
            ? "Jump in the pixel canvas game"
            : "Start the pixel canvas game"
      }
      aria-disabled={!isInteractive}
      tabIndex={isInteractive ? 0 : -1}
      className={cn(
        "group relative block h-[250px] w-full overflow-hidden bg-black text-left outline-none",
        isInteractive ? "cursor-pointer" : "cursor-default",
        className,
      )}
      onPointerCancel={handlePointerRelease}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerRelease}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-manipulation"
        role="img"
      />
      {isInteractive && status === "cover" && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded bg-[#191919]/80 px-2 py-1 text-xs font-semibold text-[#d9d9d7] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          click or press space
        </span>
      )}
      {isInteractive && status === "playing" && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded bg-[#191919]/80 px-2 py-1 text-xs font-semibold text-[#d9d9d7] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          esc to exit
        </span>
      )}
      {isInteractive && status === "over" && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded bg-[#191919]/80 px-2 py-1 text-xs font-semibold text-[#d9d9d7] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          click to restart
        </span>
      )}
    </button>
  );
}

function isActionKey(code: string) {
  return (
    code === "Space" ||
    code === "ArrowUp" ||
    code === "KeyW" ||
    code === "Enter"
  );
}

function isRunResponse(
  value: unknown,
): value is { highScore: number; runToken: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "highScore" in value &&
    "runToken" in value &&
    typeof value.highScore === "number" &&
    typeof value.runToken === "string"
  );
}

function isScoreResponse(value: unknown): value is {
  highScore: number;
  isNewHighScore: boolean;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "highScore" in value &&
    "isNewHighScore" in value &&
    typeof value.highScore === "number" &&
    typeof value.isNewHighScore === "boolean"
  );
}
