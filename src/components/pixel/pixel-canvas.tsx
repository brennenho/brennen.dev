"use client";

import { getGameConfig } from "@/lib/games/config";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { createDinoScene } from "./games/dino/scene";
import type { PixelScene, PixelSceneStatus } from "./scene";

const DINO_CONFIG = getGameConfig("dino");

type PixelCanvasProps = {
  className?: string;
};

export function PixelCanvas({ className }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<PixelScene | null>(null);
  const frameRef = useRef<number | null>(null);
  const isStartingRunRef = useRef(false);
  const lastTimeRef = useRef<number>(0);
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

    return body.runToken;
  }, []);

  const start = useCallback(() => {
    if (isStartingRunRef.current) return;

    isStartingRunRef.current = true;

    void startRun()
      .then((runToken) => {
        if (!runToken) return;

        runTokenRef.current = runToken;
        sceneRef.current?.start();
        submittedRunRef.current = false;
        statusRef.current = "playing";
        setStatus("playing");
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Unable to start Dino run", error);
        }
      })
      .finally(() => {
        isStartingRunRef.current = false;
      });
  }, [startRun]);

  const reset = useCallback(() => {
    runTokenRef.current = null;
    isStartingRunRef.current = false;
    submittedRunRef.current = false;
    sceneRef.current?.reset();
    statusRef.current = "cover";
    setStatus("cover");
  }, []);

  const submitScore = useCallback((score: number) => {
    const runToken = runTokenRef.current;

    if (!runToken) return;

    runTokenRef.current = null;
    const body = JSON.stringify({ runToken, score });

    void fetch(DINO_CONFIG.scoreEndpoint, {
      body,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      method: "POST",
    }).catch((error: unknown) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("Unable to submit Dino score", error);
      }
    });
  }, []);

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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isInteractive) return;

      if (
        event.code === "Space" ||
        event.code === "ArrowUp" ||
        event.code === "KeyW"
      ) {
        event.preventDefault();
        trigger();
      } else if (event.code === "Escape") {
        event.preventDefault();
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInteractive, reset, trigger]);

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
      onClick={trigger}
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

function isRunResponse(value: unknown): value is { runToken: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "runToken" in value &&
    typeof value.runToken === "string"
  );
}
