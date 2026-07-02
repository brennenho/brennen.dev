import {
  CACTUS_SMALL,
  CACTUS_SPRITES,
  CACTUS_TALL,
  DINO,
  DINO_HEIGHT,
  DINO_WIDTH,
  DINO_RUN_1,
  DINO_RUN_2,
  type Sprite,
} from "./assets";

export type DinoMode = "cover" | "playing" | "over";

export type DinoObstacle = {
  followingObstacleCreated: boolean;
  gap: number;
  sprite: Sprite;
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
const CHROME_RUN_FRAME_INTERVAL = 1000 / 12;
const TREX_X_SCALE = DINO_WIDTH / CHROME_TREX_WIDTH;
const TREX_Y_SCALE = DINO_HEIGHT / CHROME_TREX_HEIGHT;
const START_SPEED = chromeFrameSpeedToColumns(CHROME_START_SPEED);
const MAX_SPEED = chromeFrameSpeedToColumns(CHROME_MAX_SPEED);
const MOBILE_START_SPEED = START_SPEED * 0.82;
const MOBILE_MAX_SPEED = MAX_SPEED * 0.82;
const SPEED_ACCELERATION =
  chromeFrameAccelerationToColumns(CHROME_ACCELERATION);
const MOBILE_SPEED_ACCELERATION = SPEED_ACCELERATION * 0.82;

export class DinoEngine {
  elapsed = 0;
  mode: DinoMode = "cover";
  obstacles: DinoObstacle[] = [];
  playerOffset = 0;
  score = 0;
  speed = START_SPEED;
  worldOffset = 0;

  private columns = 1;
  private groundRowValue = 15;
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
    this.playerOffset = 0;
    this.score = 0;
    this.speed = this.startSpeed();
    this.elapsed = 0;
    this.worldOffset = 0;
    this.reachedMinJumpHeight = false;
    this.velocity = 0;
  }

  start() {
    this.mode = "playing";
    this.obstacles = [this.coverCactus()];
    this.playerOffset = 0;
    this.score = 0;
    this.speed = this.startSpeed();
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

    const distance = this.speed * delta;
    this.worldOffset += distance;
    this.score += delta * 0.012;
    this.speed = Math.min(
      this.maxSpeed(),
      this.speed + this.speedAcceleration() * delta,
    );
    this.updateJump(delta);
    this.updateObstacles(distance);

    if (this.hasCollision()) {
      this.mode = "over";
    }
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
    const sprite = compact ? CACTUS_SMALL : CACTUS_TALL;

    return {
      followingObstacleCreated: false,
      gap: this.obstacleGap(sprite),
      sprite,
      x: Math.round(this.columns * (compact ? 0.68 : 0.79)),
    };
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
      .filter((obstacle) => obstacle.x > -18);

    const lastObstacle = this.obstacles.at(-1);

    if (!lastObstacle) {
      this.spawnObstacle();
      return;
    }

    if (
      !lastObstacle.followingObstacleCreated &&
      lastObstacle.x + obstacleWidth(lastObstacle) + lastObstacle.gap <
        this.columns
    ) {
      this.spawnObstacle();
      lastObstacle.followingObstacleCreated = true;
    }
  }

  private spawnObstacle() {
    const difficulty = this.difficulty();
    const sprite = weightedRandomCactus(difficulty);

    this.obstacles.push({
      followingObstacleCreated: false,
      gap: this.obstacleGap(sprite),
      sprite,
      x: this.columns + obstacleWidth({ sprite }),
    });
  }

  private difficulty() {
    return Math.min(
      1,
      Math.sqrt(this.score / (this.isCompact() ? 2200 : 1400)),
    );
  }

  private obstacleGap(sprite: Sprite) {
    const width = obstacleWidth({ sprite }) / TREX_X_SCALE;
    const minGap =
      width * this.chromeSpeed() +
      CHROME_OBSTACLE_MIN_GAP * CHROME_GAP_COEFFICIENT;
    const maxGap = minGap * CHROME_MAX_GAP_COEFFICIENT;

    return randomBetween(minGap, maxGap) * TREX_X_SCALE;
  }

  private speedProgress() {
    return Math.min(
      1,
      Math.max(
        0,
        (this.speed - this.startSpeed()) /
          (this.maxSpeed() - this.startSpeed()),
      ),
    );
  }

  private chromeSpeed() {
    return (
      CHROME_START_SPEED +
      (CHROME_MAX_SPEED - CHROME_START_SPEED) * this.speedProgress()
    );
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
        sprite: obstacle.sprite,
        x: Math.round(obstacle.x),
        y: this.groundRow() - obstacle.sprite.length + 1,
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
      -(CHROME_INITIAL_JUMP_VELOCITY + this.chromeSpeed() / 10),
    );
  }

  private maxSpeed() {
    return this.isCompact() ? MOBILE_MAX_SPEED : MAX_SPEED;
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

  private speedAcceleration() {
    return this.isCompact() ? MOBILE_SPEED_ACCELERATION : SPEED_ACCELERATION;
  }

  private startSpeed() {
    return this.isCompact() ? MOBILE_START_SPEED : START_SPEED;
  }

  private isGrounded() {
    return this.playerOffset >= 0 && this.velocity >= 0;
  }
}

function obstacleWidth(obstacle: Pick<DinoObstacle, "sprite">) {
  return obstacle.sprite[0]?.length ?? 0;
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

function chromeFrameAccelerationToColumns(value: number) {
  return (value * TREX_X_SCALE) / (FRAME_MS * FRAME_MS);
}

function spritesOverlap(first: PositionedSprite, second: PositionedSprite) {
  const left = Math.max(Math.round(first.x), Math.round(second.x));
  const right = Math.min(
    Math.round(first.x) + obstacleWidth(first),
    Math.round(second.x) + obstacleWidth(second),
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

function weightedRandomCactus(difficulty: number) {
  if (Math.random() < 0.68 - difficulty * 0.28) return CACTUS_SMALL;

  return (
    CACTUS_SPRITES[Math.floor(Math.random() * CACTUS_SPRITES.length)] ??
    CACTUS_SMALL
  );
}

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
}
