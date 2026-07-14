export const DINO_FRAMES_PER_SECOND = 60;
export const DINO_FRAME_MS = 1000 / DINO_FRAMES_PER_SECOND;
export const DINO_START_SPEED = 6;
export const DINO_MAX_SPEED = 13;
export const DINO_SPEED_ACCELERATION_PER_FRAME = 0.001;

const DINO_DISTANCE_COEFFICIENT = 0.025;
const DISTANCE_ROUNDING_TOLERANCE = 1e-6;

export function getDinoScoreForDistance(distanceRan: number) {
  return Math.round(Math.ceil(distanceRan) * DINO_DISTANCE_COEFFICIENT);
}

export function getMaxDinoScoreForElapsed(elapsedMs: number) {
  const elapsedFrames =
    (Math.max(0, elapsedMs) / 1000) * DINO_FRAMES_PER_SECOND;
  const framesUntilMaxSpeed =
    (DINO_MAX_SPEED - DINO_START_SPEED) / DINO_SPEED_ACCELERATION_PER_FRAME;
  const acceleratingFrames = Math.min(elapsedFrames, framesUntilMaxSpeed);
  const acceleratingDistance =
    DINO_START_SPEED * acceleratingFrames +
    (DINO_SPEED_ACCELERATION_PER_FRAME * acceleratingFrames ** 2) / 2;
  const maxSpeedDistance =
    DINO_MAX_SPEED * Math.max(0, elapsedFrames - framesUntilMaxSpeed);

  // The engine integrates speed once per animation frame. The continuous
  // curve is a conservative upper bound at every frame rate, and the tiny
  // tolerance prevents floating-point rounding from excluding its endpoint.
  return getDinoScoreForDistance(
    acceleratingDistance + maxSpeedDistance + DISTANCE_ROUNDING_TOLERANCE,
  );
}
