import {
  CACTUS_SMALL_GROUPS,
  CACTUS_TALL_GROUPS,
  DINO,
  DINO_HEIGHT,
  DINO_WIDTH,
  DINO_RUN_1,
  DINO_RUN_2,
  type CactusType,
  type CactusVariant,
  type Sprite,
} from "./assets";

export type DinoMode = "cover" | "playing" | "over";

export type DinoObstacle = {
  followingObstacleCreated: boolean;
  // Chrome pixels. Rendering converts these into pixel-canvas columns.
  gap: number;
  variant: CactusVariant;
  x: number;
};

type DinoEngineOptions = {
  columns: number;
  groundRow: number;
  playerX: number;
};

type PositionedSprite = {
  sprite: Sprite;
  x: number;
  y: number;
};

const FRAME_MS = 1000 / 60;
const CHROME_FPS = 60;
const CHROME_MS_PER_FRAME = 1000 / CHROME_FPS;
const CHROME_DEFAULT_WIDTH = 600;
const CHROME_TREX_WIDTH = 44;
const CHROME_TREX_HEIGHT = 47;
const CHROME_GRAVITY = 0.6;
const CHROME_INITIAL_JUMP_VELOCITY = 10;
const CHROME_DROP_VELOCITY = 5;
const CHROME_MIN_JUMP_HEIGHT = 30;
const CHROME_MAX_JUMP_HEIGHT = 63;
const CHROME_START_SPEED = 6;
const CHROME_MAX_SPEED = 13;
const CHROME_GAP_COEFFICIENT = 0.6;
const CHROME_MAX_GAP_COEFFICIENT = 1.5;
const CHROME_OBSTACLE_MIN_GAP = 120;
const CHROME_ACCELERATION = 0.001;
const CHROME_MOBILE_SPEED_COEFFICIENT = 1.2;
const CHROME_MAX_OBSTACLE_DUPLICATION = 2;
const CHROME_DISTANCE_COEFFICIENT = 0.025;
// Chrome's late-game gaps can exceed the viewport, leaving the screen briefly
// cactus-free. Cap gaps below one screen so the next cactus always enters
// before the previous one exits.
const GAP_MAX_VIEWPORT_FRACTION = 0.85;
const GAP_CEILING_SPREAD = 0.8;
const CHROME_RUN_FRAME_INTERVAL = 1000 / 12;
const TREX_X_SCALE = DINO_WIDTH / CHROME_TREX_WIDTH;
const TREX_Y_SCALE = DINO_HEIGHT / CHROME_TREX_HEIGHT;

export class DinoEngine {
  elapsed = 0;
  mode: DinoMode = "cover";
  obstacles: DinoObstacle[] = [];
  playerOffset = 0;
  score = 0;
  speed = chromeFrameSpeedToColumns(CHROME_START_SPEED);
  worldOffset = 0;

  private columns = 1;
  private currentSpeed = CHROME_START_SPEED;
  private distanceRan = 0;
  private groundRowValue = 15;
  private obstacleHistory: CactusType[] = [];
  private reachedMinJumpHeight = false;
  private playerXValue = 8;
  private velocity = 0;

  configure(options: DinoEngineOptions) {
    this.columns = options.columns;
    this.groundRowValue = options.groundRow;
    this.playerXValue = options.playerX;
  }

  reset() {
    this.mode = "cover";
    this.obstacles = [];
    this.obstacleHistory = [];
    this.playerOffset = 0;
    this.score = 0;
    this.distanceRan = 0;
    this.currentSpeed = CHROME_START_SPEED;
    this.syncDisplaySpeed();
    this.elapsed = 0;
    this.worldOffset = 0;
    this.reachedMinJumpHeight = false;
    this.velocity = 0;
  }

  start() {
    const firstObstacle = this.coverCactus();

    this.mode = "playing";
    this.obstacles = [firstObstacle];
    this.obstacleHistory = [firstObstacle.variant.type];
    this.playerOffset = 0;
    this.score = 0;
    this.distanceRan = 0;
    this.currentSpeed = CHROME_START_SPEED;
    this.syncDisplaySpeed();
    this.elapsed = 0;
    this.worldOffset = 0;
    this.reachedMinJumpHeight = false;
    this.velocity = 0;
  }

  action() {
    if (this.mode !== "playing") {
      this.start();
      return;
    }

    if (this.isGrounded()) {
      this.velocity = this.jumpVelocity();
      this.reachedMinJumpHeight = false;
    }
  }

  releaseAction() {
    this.endJump();
  }

  runFrameInterval() {
    return CHROME_RUN_FRAME_INTERVAL;
  }

  update(delta: number) {
    this.elapsed += delta;

    if (this.mode !== "playing") return;

    const distance = this.frameDistance(delta);
    this.worldOffset += distance * TREX_X_SCALE;
    this.distanceRan += (this.currentSpeed * delta) / CHROME_MS_PER_FRAME;
    this.score = chromeScore(this.distanceRan);
    this.updateJump(delta);
    this.updateObstacles(distance);

    if (this.hasCollision()) {
      this.mode = "over";
      return;
    }

    this.accelerate(delta);
  }

  playerY() {
    return Math.round(
      this.groundRowValue - DINO_HEIGHT + 2 + this.playerOffset,
    );
  }

  playerX() {
    return this.playerXValue;
  }

  groundRow() {
    return this.groundRowValue;
  }

  coverCactus() {
    const compact = this.isCompact();
    const variant = compact ? CACTUS_SMALL_GROUPS[0] : CACTUS_TALL_GROUPS[0];

    return {
      followingObstacleCreated: false,
      gap: this.obstacleGap(variant),
      variant,
      x: this.columnsToChrome(Math.round(this.columns * (compact ? 0.6 : 0.7))),
    };
  }

  obstacleX(obstacle: DinoObstacle) {
    return this.chromeToColumns(obstacle.x);
  }

  private updateJump(delta: number) {
    if (this.isGrounded()) return;

    this.playerOffset += this.velocity * delta;
    this.velocity += this.gravity() * delta;

    if (this.playerOffset <= -this.minJumpHeight()) {
      this.reachedMinJumpHeight = true;
    }

    if (this.playerOffset <= -this.maxJumpHeight()) {
      this.endJump();
    }

    if (this.playerOffset > 0) {
      this.playerOffset = 0;
      this.reachedMinJumpHeight = false;
      this.velocity = 0;
    }
  }

  private updateObstacles(distance: number) {
    this.obstacles = this.obstacles
      .map((obstacle) => ({ ...obstacle, x: obstacle.x - distance }))
      .filter((obstacle) => isObstacleVisible(obstacle));

    const lastObstacle = this.obstacles.at(-1);

    if (!lastObstacle) {
      this.spawnObstacle();
      return;
    }

    if (
      !lastObstacle.followingObstacleCreated &&
      isObstacleVisible(lastObstacle) &&
      lastObstacle.x +
        chromeObstacleWidth(lastObstacle.variant) +
        lastObstacle.gap <
        this.chromeViewportWidth()
    ) {
      this.spawnObstacle();
      lastObstacle.followingObstacleCreated = true;
    }
  }

  private spawnObstacle() {
    const variant = randomCactus(this.currentSpeed, this.obstacleHistory);

    this.obstacles.push({
      followingObstacleCreated: false,
      gap: this.obstacleGap(variant),
      variant,
      x: this.chromeViewportWidth() + variant.chromeBaseWidth,
    });
    this.obstacleHistory.unshift(variant.type);
    this.obstacleHistory.splice(CHROME_MAX_OBSTACLE_DUPLICATION);
  }

  private obstacleGap(variant: CactusVariant) {
    const chromeWidth = chromeObstacleWidth(variant);
    const scale = this.worldScale();
    const ceiling = this.chromeViewportWidth() * GAP_MAX_VIEWPORT_FRACTION;
    const minGap = Math.min(
      Math.round(
        (chromeWidth * this.currentSpeed +
          CHROME_OBSTACLE_MIN_GAP * CHROME_GAP_COEFFICIENT) *
          scale,
      ),
      ceiling * GAP_CEILING_SPREAD,
    );
    const maxGap = Math.min(
      Math.round(minGap * CHROME_MAX_GAP_COEFFICIENT),
      ceiling,
    );

    return randomInteger(minGap, maxGap);
  }

  private endJump() {
    const dropVelocity = this.dropVelocity();

    if (this.reachedMinJumpHeight && this.velocity < dropVelocity) {
      this.velocity = dropVelocity;
    }
  }

  private hasCollision() {
    const dino = {
      sprite: this.currentDinoSprite(),
      x: this.playerX(),
      y: this.playerY(),
    };

    return this.obstacles.some((obstacle) => {
      const cactus = {
        sprite: obstacle.variant.sprite,
        x: Math.round(this.obstacleX(obstacle)),
        y: this.groundRow() - obstacle.variant.sprite.length + 1,
      };

      return spritesOverlap(dino, cactus);
    });
  }

  private currentDinoSprite() {
    const shouldRun = this.mode === "playing" && this.isGrounded();

    if (!shouldRun) return DINO;

    return Math.floor(this.elapsed / this.runFrameInterval()) % 2 === 0
      ? DINO_RUN_1
      : DINO_RUN_2;
  }

  private gravity() {
    return chromeFrameGravityToRows(CHROME_GRAVITY);
  }

  private isCompact() {
    return this.columns < 120;
  }

  private jumpVelocity() {
    return chromeFrameVelocityToRows(
      -(CHROME_INITIAL_JUMP_VELOCITY + this.currentSpeed / 10),
    );
  }

  private maxJumpHeight() {
    return CHROME_MAX_JUMP_HEIGHT * TREX_Y_SCALE;
  }

  private minJumpHeight() {
    return CHROME_MIN_JUMP_HEIGHT * TREX_Y_SCALE;
  }

  private dropVelocity() {
    return chromeFrameVelocityToRows(-CHROME_DROP_VELOCITY);
  }

  private isGrounded() {
    return this.playerOffset >= 0 && this.velocity >= 0;
  }

  private accelerate(delta: number) {
    if (this.currentSpeed >= CHROME_MAX_SPEED) return;

    this.currentSpeed = Math.min(
      CHROME_MAX_SPEED,
      this.currentSpeed + CHROME_ACCELERATION * (delta / FRAME_MS),
    );
    this.syncDisplaySpeed();
  }

  private frameDistance(delta: number) {
    return (this.effectiveSpeed() * delta) / CHROME_MS_PER_FRAME;
  }

  private syncDisplaySpeed() {
    this.speed = chromeFrameSpeedToColumns(this.effectiveSpeed());
  }

  // Chrome always simulates a fixed 600px-wide world and scales the rendering.
  // Our world width follows the canvas, so speed and gap distances scale with
  // it to keep wall-clock pacing identical to Chrome at any width. Below 600px
  // this matches Chrome's mobile speed formula.
  private worldScale() {
    const width = this.chromeViewportWidth();

    if (width >= CHROME_DEFAULT_WIDTH) return width / CHROME_DEFAULT_WIDTH;

    return Math.min(
      1,
      (width * CHROME_MOBILE_SPEED_COEFFICIENT) / CHROME_DEFAULT_WIDTH,
    );
  }

  private effectiveSpeed() {
    return this.currentSpeed * this.worldScale();
  }

  private chromeViewportWidth() {
    return this.columns / TREX_X_SCALE;
  }

  private chromeToColumns(value: number) {
    return value * TREX_X_SCALE;
  }

  private columnsToChrome(value: number) {
    return value / TREX_X_SCALE;
  }
}

function chromeObstacleWidth(variant: CactusVariant) {
  return variant.chromeBaseWidth * variant.chromeSize;
}

function visualChromeWidth(variant: CactusVariant) {
  return spriteWidth(variant.sprite) / TREX_X_SCALE;
}

function spriteWidth(sprite: Sprite) {
  return sprite[0]?.length ?? 0;
}

function chromeFrameVelocityToRows(value: number) {
  return (value * TREX_Y_SCALE) / FRAME_MS;
}

function chromeFrameGravityToRows(value: number) {
  return (value * TREX_Y_SCALE) / (FRAME_MS * FRAME_MS);
}

function chromeFrameSpeedToColumns(value: number) {
  return (value * TREX_X_SCALE) / FRAME_MS;
}

function spritesOverlap(first: PositionedSprite, second: PositionedSprite) {
  const left = Math.max(Math.round(first.x), Math.round(second.x));
  const right = Math.min(
    Math.round(first.x) + spriteWidth(first.sprite),
    Math.round(second.x) + spriteWidth(second.sprite),
  );
  const top = Math.max(Math.round(first.y), Math.round(second.y));
  const bottom = Math.min(
    Math.round(first.y) + first.sprite.length,
    Math.round(second.y) + second.sprite.length,
  );

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      if (
        spriteHasCell(
          first.sprite,
          x - Math.round(first.x),
          y - Math.round(first.y),
        ) &&
        spriteHasCell(
          second.sprite,
          x - Math.round(second.x),
          y - Math.round(second.y),
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

function spriteHasCell(sprite: Sprite, x: number, y: number) {
  return sprite[y]?.[x] !== " " && sprite[y]?.[x] !== undefined;
}

function randomCactus(
  chromeSpeed: number,
  obstacleHistory: readonly CactusType[],
): CactusVariant {
  const cactusGroups = [CACTUS_SMALL_GROUPS, CACTUS_TALL_GROUPS] as const;
  const allowedGroups = cactusGroups.filter(
    (group) => !isDuplicateObstacle(group[0].type, obstacleHistory),
  );
  const groups =
    allowedGroups[randomInteger(0, allowedGroups.length - 1)] ??
    cactusGroups[0];
  const firstGroup = groups[0];

  if (chromeSpeed < firstGroup.multipleSpeed) return firstGroup;

  const chromeSize = randomInteger(1, 3) as CactusVariant["chromeSize"];
  const variantsForSize = groups.filter(
    (variant) => variant.chromeSize === chromeSize,
  );

  return (
    variantsForSize[randomInteger(0, variantsForSize.length - 1)] ?? firstGroup
  );
}

function isDuplicateObstacle(
  obstacleType: CactusType,
  obstacleHistory: readonly CactusType[],
) {
  let duplicateCount = 0;

  for (const previousObstacleType of obstacleHistory) {
    duplicateCount =
      previousObstacleType === obstacleType ? duplicateCount + 1 : 0;

    if (duplicateCount >= CHROME_MAX_OBSTACLE_DUPLICATION) return true;
  }

  return false;
}

function randomInteger(minimum: number, maximum: number) {
  return Math.floor(minimum + Math.random() * (maximum - minimum + 1));
}

function chromeScore(distanceRan: number) {
  return Math.round(Math.ceil(distanceRan) * CHROME_DISTANCE_COEFFICIENT);
}

function isObstacleVisible(obstacle: DinoObstacle) {
  const width = Math.max(
    chromeObstacleWidth(obstacle.variant),
    visualChromeWidth(obstacle.variant),
  );

  return obstacle.x + width > 0;
}
