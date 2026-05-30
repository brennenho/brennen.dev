"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { createDinoScene } from "./games/dino/scene";
import type { PixelScene, PixelSceneStatus } from "./scene";

type PixelCanvasProps = {
  className?: string;
};

export function PixelCanvas({ className }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<PixelScene | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const statusRef = useRef<PixelSceneStatus>("cover");
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

  const start = useCallback(() => {
    sceneRef.current?.start();
    statusRef.current = "playing";
    setStatus("playing");
  }, []);

  const reset = useCallback(() => {
    sceneRef.current?.reset();
    statusRef.current = "cover";
    setStatus("cover");
  }, []);

  const trigger = useCallback(() => {
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
  }, [reset, start]);

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
        statusRef.current = nextStatus;
        setStatus(nextStatus);
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
  }, [resize]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
  }, [reset, trigger]);

  return (
    <button
      type="button"
      aria-label={
        status === "playing"
          ? "Jump in the pixel canvas game"
          : "Start the pixel canvas game"
      }
      className={cn(
        "group relative block h-[250px] w-full cursor-pointer overflow-hidden bg-black text-left outline-none",
        className,
      )}
      onClick={trigger}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-manipulation"
        role="img"
      />
      {status === "cover" && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded bg-[#191919]/80 px-2 py-1 text-xs font-semibold text-[#d9d9d7] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          click or press space
        </span>
      )}
      {status === "playing" && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded bg-[#191919]/80 px-2 py-1 text-xs font-semibold text-[#d9d9d7] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          esc to exit
        </span>
      )}
      {status === "over" && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded bg-[#191919]/80 px-2 py-1 text-xs font-semibold text-[#d9d9d7] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          click to restart
        </span>
      )}
    </button>
  );
}
