import {
  CACTUS_SMALL,
  CACTUS_SPRITES,
  CACTUS_TALL,
  DINO_HEIGHT,
  DINO_WIDTH,
  type Sprite,
} from "./assets";

export type DinoMode = "cover" | "playing" | "over";

export type DinoObstacle = {
  sprite: Sprite;
  x: number;
};

type DinoEngineOptions = {
  columns: number;
  groundRow: number;
  playerX: number;
};

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
  private nextSpawnDistance = 0;
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
    this.worldOffset = 0;
    this.velocity = 0;
    this.nextSpawnDistance = 0;
  }

  start() {
    this.mode = "playing";
    this.obstacles = [this.coverCactus()];
    this.playerOffset = 0;
    this.score = 0;
    this.speed = this.startSpeed();
    this.worldOffset = 0;
    this.velocity = 0;
    this.nextSpawnDistance = randomBetween(
      this.minSpawnGap(),
      this.maxSpawnGap(),
    );
  }

  action() {
    if (this.mode !== "playing") {
      this.start();
      return;
    }

    if (this.playerOffset === 0) {
      this.velocity = this.jumpVelocity();
    }
  }

  update(delta: number) {
    this.elapsed += delta;

    if (this.mode !== "playing") return;

    const distance = this.speed * delta;
    this.worldOffset += distance;
    this.score += delta * 0.012;
    this.speed = this.currentTargetSpeed();
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

    return {
      sprite: compact ? CACTUS_SMALL : CACTUS_TALL,
      x: Math.round(this.columns * (compact ? 0.68 : 0.79)),
    };
  }

  private updateJump(delta: number) {
    if (this.playerOffset >= 0 && this.velocity >= 0) return;

    this.playerOffset += this.velocity * delta;
    this.velocity += this.gravity() * delta;

    if (this.playerOffset > 0) {
      this.playerOffset = 0;
      this.velocity = 0;
    }
  }

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
    });

    const minGap =
      this.minSpawnGap() - difficulty * (this.isCompact() ? 14 : 24);
    const maxGap =
      this.maxSpawnGap() - difficulty * (this.isCompact() ? 30 : 52);
    this.nextSpawnDistance = randomBetween(minGap, maxGap);
  }

  private currentTargetSpeed() {
    return (
      this.startSpeed() +
      (this.maxSpeed() - this.startSpeed()) * this.difficulty()
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
      height: DINO_HEIGHT,
      width: DINO_WIDTH,
      x: this.playerX(),
      y: this.playerY(),
    };

    const forgiveness = this.isCompact() ? 3 : 0;

    return this.obstacles.some((obstacle) => {
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
