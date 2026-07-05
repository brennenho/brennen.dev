import {
<<<<<<< Updated upstream
  CACTUS_SMALL,
  CACTUS_SPRITES,
  CACTUS_TALL,
  DINO_HEIGHT,
  DINO_WIDTH,
=======
  CACTUS_SMALL_GROUPS,
  CACTUS_TALL_GROUPS,
  DINO,
  DINO_DUCK_1,
  DINO_DUCK_2,
  DINO_HEIGHT,
  DINO_WIDTH,
  DINO_RUN_1,
  DINO_RUN_2,
  PTERODACTYL_GROUPS,
  type ObstacleType,
  type ObstacleVariant,
>>>>>>> Stashed changes
  type Sprite,
} from "./assets";

export type DinoMode = "cover" | "playing" | "over";

export type DinoObstacle = {
<<<<<<< Updated upstream
  sprite: Sprite;
=======
  // Rows above the ground line (pterodactyls fly; cacti sit at 0).
  flightRows: number;
  followingObstacleCreated: boolean;
  // Chrome pixels. Rendering converts these into pixel-canvas columns.
  gap: number;
  // Chrome px/frame relative to the world (pterodactyls drift by ±0.8).
  speedOffset: number;
  variant: ObstacleVariant;
>>>>>>> Stashed changes
  x: number;
};

type DinoEngineOptions = {
  columns: number;
  groundRow: number;
  playerX: number;
};

<<<<<<< Updated upstream
const START_SPEED = 0.073;
const MAX_SPEED = 0.135;
const MOBILE_START_SPEED = 0.055;
const MOBILE_MAX_SPEED = 0.104;
const JUMP_VELOCITY = -0.24;
const MOBILE_JUMP_VELOCITY = -0.265;
const GRAVITY = 0.00095;
const MOBILE_GRAVITY = 0.00082;
const MIN_SPAWN_GAP = 88;
const MAX_SPAWN_GAP = 168;
const MOBILE_MIN_SPAWN_GAP = 112;
const MOBILE_MAX_SPAWN_GAP = 196;
=======
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
const CHROME_SPEED_DROP_COEFFICIENT = 3;
const CHROME_SPEED_DROP_VELOCITY = 1;
const CHROME_MIN_JUMP_HEIGHT = 30;
const CHROME_MAX_JUMP_HEIGHT = 63;
const CHROME_START_SPEED = 6;
const CHROME_MAX_SPEED = 13;
const CHROME_GAP_COEFFICIENT = 0.6;
const CHROME_MAX_GAP_COEFFICIENT = 1.5;
const CHROME_ACCELERATION = 0.001;
const CHROME_PTERO_FLAP_INTERVAL = 1000 / 6;
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
>>>>>>> Stashed changes

export class DinoEngine {
  elapsed = 0;
  mode: DinoMode = "cover";
  obstacles: DinoObstacle[] = [];
  playerOffset = 0;
  score = 0;
  speed = START_SPEED;
  worldOffset = 0;

  private columns = 1;
<<<<<<< Updated upstream
  private groundRowValue = 15;
  private nextSpawnDistance = 0;
=======
  private currentSpeed = CHROME_START_SPEED;
  private distanceRan = 0;
  private duckIntent = false;
  private ducking = false;
  private groundRowValue = 15;
  private obstacleHistory: ObstacleType[] = [];
  private reachedMinJumpHeight = false;
>>>>>>> Stashed changes
  private playerXValue = 8;
  private speedDropActive = false;
  private velocity = 0;

  configure(options: DinoEngineOptions) {
    this.columns = options.columns;
    this.groundRowValue = options.groundRow;
    this.playerXValue = options.playerX;
  }

  reset() {
    this.mode = "cover";
    this.obstacles = [];
    this.playerOffset = 0;
    this.score = 0;
    this.speed = this.startSpeed();
    this.worldOffset = 0;
    this.velocity = 0;
<<<<<<< Updated upstream
    this.nextSpawnDistance = 0;
=======
    this.duckIntent = false;
    this.ducking = false;
    this.speedDropActive = false;
>>>>>>> Stashed changes
  }

  start() {
    this.mode = "playing";
    this.obstacles = [this.coverCactus()];
    this.playerOffset = 0;
    this.score = 0;
    this.speed = this.startSpeed();
    this.worldOffset = 0;
    this.velocity = 0;
<<<<<<< Updated upstream
    this.nextSpawnDistance = randomBetween(
      this.minSpawnGap(),
      this.maxSpawnGap(),
    );
=======
    this.duckIntent = false;
    this.ducking = false;
    this.speedDropActive = false;
>>>>>>> Stashed changes
  }

  action() {
    if (this.mode !== "playing") {
      this.start();
      return;
    }

    if (this.playerOffset === 0) {
      this.velocity = this.jumpVelocity();
<<<<<<< Updated upstream
    }
  }

=======
      this.reachedMinJumpHeight = false;
      this.ducking = false;
    }
  }

  releaseAction() {
    this.endJump();
  }

  // Chrome's Trex.setDuck / setSpeedDrop: ducking on the ground, or a fast
  // drop when airborne. Holding duck through a landing resumes the duck.
  setDuck(active: boolean) {
    this.duckIntent = active;

    if (!active) {
      this.ducking = false;
      this.speedDropActive = false;
      return;
    }

    if (this.mode !== "playing") return;

    if (this.isGrounded()) {
      this.ducking = true;
    } else if (!this.speedDropActive) {
      this.speedDropActive = true;
      this.velocity = chromeFrameVelocityToRows(CHROME_SPEED_DROP_VELOCITY);
    }
  }

  runFrameInterval() {
    return CHROME_RUN_FRAME_INTERVAL;
  }

>>>>>>> Stashed changes
  update(delta: number) {
    this.elapsed += delta;

    if (this.mode !== "playing") return;

    const distance = this.speed * delta;
    this.worldOffset += distance;
    this.score += delta * 0.012;
    this.speed = this.currentTargetSpeed();
    this.updateJump(delta);
    this.updateObstacles(delta);

    if (this.hasCollision()) {
      this.mode = "over";
    }
  }

  playerY() {
    return Math.round(
      this.groundRowValue - this.dinoSprite().length + 2 + this.playerOffset,
    );
  }

  dinoSprite() {
    if (this.mode !== "playing" || !this.isGrounded()) return DINO;

    const runFrame =
      Math.floor(this.elapsed / this.runFrameInterval()) % 2 === 0;

    if (this.ducking) return runFrame ? DINO_DUCK_1 : DINO_DUCK_2;

    return runFrame ? DINO_RUN_1 : DINO_RUN_2;
  }

  playerX() {
    return this.playerXValue;
  }

  groundRow() {
    return this.groundRowValue;
  }

  coverCactus() {
    const compact = this.isCompact();

    return {
<<<<<<< Updated upstream
      sprite: compact ? CACTUS_SMALL : CACTUS_TALL,
      x: Math.round(this.columns * (compact ? 0.68 : 0.79)),
    };
  }

=======
      flightRows: 0,
      followingObstacleCreated: false,
      gap: this.obstacleGap(variant),
      speedOffset: 0,
      variant,
      x: this.columnsToChrome(Math.round(this.columns * (compact ? 0.6 : 0.7))),
    };
  }

  obstacleX(obstacle: DinoObstacle) {
    return this.chromeToColumns(obstacle.x);
  }

  obstacleY(obstacle: DinoObstacle) {
    return (
      this.groundRowValue -
      this.obstacleSprite(obstacle).length +
      1 -
      obstacle.flightRows
    );
  }

  obstacleSprite(obstacle: DinoObstacle) {
    const frames = obstacle.variant.frames;

    if (frames.length === 1) return frames[0] ?? [];

    return (
      frames[
        Math.floor(this.elapsed / CHROME_PTERO_FLAP_INTERVAL) % frames.length
      ] ?? []
    );
  }

>>>>>>> Stashed changes
  private updateJump(delta: number) {
    if (this.playerOffset >= 0 && this.velocity >= 0) return;

    const dropCoefficient = this.speedDropActive
      ? CHROME_SPEED_DROP_COEFFICIENT
      : 1;

    this.playerOffset += this.velocity * dropCoefficient * delta;
    this.velocity += this.gravity() * delta;

<<<<<<< Updated upstream
=======
    if (this.playerOffset <= -this.minJumpHeight() || this.speedDropActive) {
      this.reachedMinJumpHeight = true;
    }

    if (this.playerOffset <= -this.maxJumpHeight()) {
      this.endJump();
    }

>>>>>>> Stashed changes
    if (this.playerOffset > 0) {
      this.playerOffset = 0;
      this.velocity = 0;
      this.speedDropActive = false;
      this.ducking = this.duckIntent;
    }
  }

<<<<<<< Updated upstream
  private updateObstacles(distance: number) {
    this.nextSpawnDistance -= distance;

    if (this.nextSpawnDistance <= 0) {
      this.spawnObstacle();
    }

    this.obstacles = this.obstacles
      .map((obstacle) => ({ ...obstacle, x: obstacle.x - distance }))
      .filter((obstacle) => obstacle.x > -18);
  }

  private spawnObstacle() {
    const difficulty = this.difficulty();
    const sprite = weightedRandomCactus(difficulty);

    this.obstacles.push({
      sprite,
      x: this.columns + 4,
=======
  private updateObstacles(delta: number) {
    const scale = this.worldScale();

    this.obstacles = this.obstacles
      .map((obstacle) => ({
        ...obstacle,
        x:
          obstacle.x -
          ((this.currentSpeed + obstacle.speedOffset) * scale * delta) /
            CHROME_MS_PER_FRAME,
      }))
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
    const variant = randomObstacle(this.currentSpeed, this.obstacleHistory);
    const flightHeight =
      variant.flightHeights[
        randomInteger(0, variant.flightHeights.length - 1)
      ] ?? 0;

    this.obstacles.push({
      flightRows: Math.round(flightHeight * TREX_Y_SCALE),
      followingObstacleCreated: false,
      gap: this.obstacleGap(variant),
      speedOffset: variant.speedOffset
        ? Math.random() > 0.5
          ? variant.speedOffset
          : -variant.speedOffset
        : 0,
      variant,
      x: this.chromeViewportWidth() + variant.chromeBaseWidth,
>>>>>>> Stashed changes
    });

    const minGap =
      this.minSpawnGap() - difficulty * (this.isCompact() ? 14 : 24);
    const maxGap =
      this.maxSpawnGap() - difficulty * (this.isCompact() ? 30 : 52);
    this.nextSpawnDistance = randomBetween(minGap, maxGap);
  }

<<<<<<< Updated upstream
  private currentTargetSpeed() {
    return (
      this.startSpeed() +
      (this.maxSpeed() - this.startSpeed()) * this.difficulty()
=======
  private obstacleGap(variant: ObstacleVariant) {
    const chromeWidth = chromeObstacleWidth(variant);
    const scale = this.worldScale();
    const ceiling = this.chromeViewportWidth() * GAP_MAX_VIEWPORT_FRACTION;
    const minGap = Math.min(
      Math.round(
        (chromeWidth * this.currentSpeed +
          variant.chromeMinGap * CHROME_GAP_COEFFICIENT) *
          scale,
      ),
      ceiling * GAP_CEILING_SPREAD,
>>>>>>> Stashed changes
    );
  }

  private difficulty() {
    return Math.min(
      1,
      Math.sqrt(this.score / (this.isCompact() ? 2200 : 1400)),
    );
  }

  private hasCollision() {
    const dino = {
<<<<<<< Updated upstream
      height: DINO_HEIGHT,
      width: DINO_WIDTH,
=======
      sprite: this.dinoSprite(),
>>>>>>> Stashed changes
      x: this.playerX(),
      y: this.playerY(),
    };

    const forgiveness = this.isCompact() ? 3 : 0;

    return this.obstacles.some((obstacle) => {
<<<<<<< Updated upstream
      const cactus = {
        height: obstacle.sprite.length,
        width: obstacle.sprite[0]?.length ?? 0,
        x: Math.round(obstacle.x),
        y: this.groundRow() - obstacle.sprite.length + 1,
      };

      return (
        dino.x + 5 + forgiveness < cactus.x + cactus.width - 1 &&
        dino.x + dino.width - 4 - forgiveness > cactus.x + 1 &&
        dino.y + 3 + forgiveness < cactus.y + cactus.height &&
        dino.y + dino.height - 2 - forgiveness > cactus.y + 2
      );
=======
      const positioned = {
        sprite: this.obstacleSprite(obstacle),
        x: Math.round(this.obstacleX(obstacle)),
        y: this.obstacleY(obstacle),
      };

      return spritesOverlap(dino, positioned);
>>>>>>> Stashed changes
    });
  }

  private gravity() {
    return this.isCompact() ? MOBILE_GRAVITY : GRAVITY;
  }

  private isCompact() {
    return this.columns < 120;
  }

  private jumpVelocity() {
    return this.isCompact() ? MOBILE_JUMP_VELOCITY : JUMP_VELOCITY;
  }

  private maxSpawnGap() {
    return this.isCompact() ? MOBILE_MAX_SPAWN_GAP : MAX_SPAWN_GAP;
  }

  private maxSpeed() {
    return this.isCompact() ? MOBILE_MAX_SPEED : MAX_SPEED;
  }

  private minSpawnGap() {
    return this.isCompact() ? MOBILE_MIN_SPAWN_GAP : MIN_SPAWN_GAP;
  }

  private startSpeed() {
    return this.isCompact() ? MOBILE_START_SPEED : START_SPEED;
  }
}

<<<<<<< Updated upstream
function weightedRandomCactus(difficulty: number) {
  if (Math.random() < 0.68 - difficulty * 0.28) return CACTUS_SMALL;

  return (
    CACTUS_SPRITES[Math.floor(Math.random() * CACTUS_SPRITES.length)] ??
    CACTUS_SMALL
  );
}

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
=======
function chromeObstacleWidth(variant: ObstacleVariant) {
  return variant.chromeBaseWidth * variant.chromeSize;
}

function visualChromeWidth(variant: ObstacleVariant) {
  return spriteWidth(variant.frames[0] ?? []) / TREX_X_SCALE;
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

// Chrome's Horizon.addNewObstacle: pick a random type and reroll while it is
// blocked by the duplication rule or the current speed is below its minimum.
function randomObstacle(
  chromeSpeed: number,
  obstacleHistory: readonly ObstacleType[],
): ObstacleVariant {
  const obstacleGroups = [
    CACTUS_SMALL_GROUPS,
    CACTUS_TALL_GROUPS,
    PTERODACTYL_GROUPS,
  ] as const;

  const allowedGroups = obstacleGroups.filter(
    (group) =>
      chromeSpeed >= group[0].minSpeed &&
      !isDuplicateObstacle(group[0].type, obstacleHistory),
  );
  const group =
    allowedGroups[randomInteger(0, allowedGroups.length - 1)] ??
    obstacleGroups[0];
  const firstVariant = group[0];

  if (chromeSpeed < firstVariant.multipleSpeed) return firstVariant;

  const chromeSize = randomInteger(1, 3) as ObstacleVariant["chromeSize"];
  const variantsForSize = group.filter(
    (variant) => variant.chromeSize === chromeSize,
  );

  return (
    variantsForSize[randomInteger(0, variantsForSize.length - 1)] ??
    firstVariant
  );
}

function isDuplicateObstacle(
  obstacleType: ObstacleType,
  obstacleHistory: readonly ObstacleType[],
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
>>>>>>> Stashed changes
}
