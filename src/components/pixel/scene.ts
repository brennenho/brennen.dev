export type PixelSceneStatus = "cover" | "playing" | "over";

export type PixelScene = {
  action: () => void;
  render: () => void;
  reset: () => void;
  resize: (width: number, height: number, scale: number) => void;
  score: () => number;
  start: () => void;
  status: () => PixelSceneStatus;
  update: (delta: number) => void;
};
