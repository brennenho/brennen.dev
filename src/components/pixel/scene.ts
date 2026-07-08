import type { PixelPalette } from "./display";

export type PixelSceneStatus = "cover" | "playing" | "over";

export type PixelScene = {
  action: () => void;
  render: () => void;
  reset: () => void;
  releaseAction: () => void;
  resize: (width: number, height: number, scale: number) => void;
  score: () => number;
  setHighScore: (score: number) => void;
  setPalette: (palette: PixelPalette) => void;
  start: () => void;
  status: () => PixelSceneStatus;
  update: (delta: number) => void;
};
