import { PixelDisplay } from "../display";

export type PixelScene = {
  action: () => void;
  render: () => void;
  resize: (width: number, height: number, scale: number) => void;
  start: () => void;
  update: (delta: number) => void;
};

type Obstacle = {
  sprite: readonly string[];
  x: number;
};

const DINO_WIDTH = 20;
const DINO = bitmapToSprite(
  [
    "00000000011111111110",
    "00000000110111111111",
    "00000000111111111111",
    "00000000111111111111",
    "00000000111111111111",
    "00000000111111100000",
    "10000001111111111100",
    "10000001111111000000",
    "110000111111110000000",
    "11100111111111110000",
    "11111111111111010000",
    "11111111111111000000",
    "01111111111111000000",
    "00111111111110000000",
    "00011111111100000000",
    "00001111111000000000",
    "00000111011000000000",
    "00000110001000000000",
    "00000110001000000000",
    "00000100001000000000",
    "00000110001100000000",
  ],
  DINO_WIDTH,
);

const DINO_RUN_1 = DINO;
const DINO_RUN_2 = DINO;
const DINO_HEIGHT = DINO.length;
const CACTUS_SMALL = bitmapToSprite(
  [
    "000111000",
    "000111000",
    "000111000",
    "000111011",
    "000111011",
    "110111011",
    "110111011",
    "110111011",
    "110111011",
    "110111111",
    "110111110",
    "111111000",
    "111111000",
    "001111000",
    "000111000",
    "000111000",
    "000111000",
    "000111000",
    "000111000",
    "000111000",
  ],
  9,
);
const CACTUS_TALL = bitmapToSprite(
  [
    "000011110000",
    "000011110000",
    "000011110000",
    "000011110000",
    "000011110010",
    "110011110111",
    "111011110111",
    "111011110111",
    "111011110111",
    "111011110111",
    "111011110111",
    "111111111111",
    "111111111110",
    "011111111100",
    "001111110000",
    "000011110000",
    "000011110000",
    "000011110000",
    "000011110000",
    "000011110000",
    "000011110000",
    "000011110000",
  ],
  12,
);
const CACTUS_SPRITES = [CACTUS_SMALL, CACTUS_TALL] as const;

export function createRunnerScene(
  context: CanvasRenderingContext2D,
): PixelScene {
  const display = new PixelDisplay(context);

  let elapsed = 0;
  let mode: "cover" | "playing" | "over" = "cover";
  let dinoOffset = 0;
  let velocity = 0;
  let speed = 0.018;
  let score = 0;
  let nextObstacle = 0;
  let obstacles: Obstacle[] = [];

  function resize(width: number, height: number, scale: number) {
    context.imageSmoothingEnabled = false;
    display.resize(width, height, scale);
  }

  function start() {
    mode = "playing";
    dinoOffset = 0;
    velocity = 0;
    speed = 0.018;
    score = 0;
    nextObstacle = display.columns * 0.56;
    obstacles = [];
  }

  function action() {
    if (mode !== "playing") {
      start();
      return;
    }

    if (dinoOffset === 0) {
      velocity = -0.13;
    }
  }

  function update(delta: number) {
    elapsed += delta;

    if (mode !== "playing") return;

    score += delta * 0.012;
    speed = Math.min(0.04, speed + delta * 0.0000008);

    if (dinoOffset < 0 || velocity < 0) {
      dinoOffset += velocity * delta;
      velocity += 0.0005 * delta;

      if (dinoOffset > 0) {
        dinoOffset = 0;
        velocity = 0;
      }
    }

    nextObstacle -= speed * delta;
    if (nextObstacle <= 0) {
      const sprite =
        CACTUS_SPRITES[Math.floor(Math.random() * CACTUS_SPRITES.length)] ??
        CACTUS_SMALL;

      obstacles.push({
        sprite,
        x: display.columns + 4,
      });
      nextObstacle = 24 + Math.random() * 22;
    }

    obstacles = obstacles
      .map((obstacle) => ({ ...obstacle, x: obstacle.x - speed * delta }))
      .filter((obstacle) => obstacle.x > -12);

    if (hasCollision()) {
      mode = "over";
    }
  }

  function render() {
    display.clear();

    drawGround();
    drawAmbientCover();
    drawDino();
    obstacles.forEach(drawCactus);
    drawScore();

    if (mode === "over") {
      display.text(
        centerText("GAME OVER"),
        Math.max(2, groundRow() - 16),
        "GAME OVER",
      );
    }

    display.render();
  }

  function drawGround() {
    const y = groundRow();

    for (let x = 0; x < display.columns; x++) {
      const wave = Math.sin((x + elapsed * 0.009) * 0.45);
      display.set(x, y + (wave > 0.96 ? -1 : 0), 235);
    }
  }

  function drawAmbientCover() {
    if (mode !== "cover") return;

    drawCactus({
      sprite: CACTUS_TALL,
      x: Math.round(display.columns * 0.79),
    });
    const time = getLocalTimeLabel();
    display.text(
      Math.max(1, display.columns - display.measureText(time) - 28),
      groundRow() + 6,
      time,
      165,
    );
  }

  function drawDino() {
    const frame =
      mode === "playing"
        ? Math.floor(elapsed / 110) % 2 === 0
          ? DINO_RUN_1
          : DINO_RUN_2
        : DINO;

    display.sprite(playerX(), playerY(), frame, 255);
  }

  function drawCactus(obstacle: Obstacle) {
    const x = Math.round(obstacle.x);
    const y = groundRow() - obstacle.sprite.length + 1;

    display.sprite(x, y, obstacle.sprite, 238);
  }

  function drawScore() {
    if (display.columns < 46) return;

    const text =
      mode === "cover" ? "HI" : String(Math.floor(score)).padStart(5, "0");
    display.text(display.columns - display.measureText(text) - 2, 2, text, 230);
  }

  function hasCollision() {
    const dino = {
      x: playerX(),
      y: playerY(),
      width: DINO_WIDTH,
      height: DINO_HEIGHT,
    };

    return obstacles.some((obstacle) => {
      const cactus = {
        x: Math.round(obstacle.x),
        y: groundRow() - obstacle.sprite.length + 1,
        width: obstacle.sprite[0]?.length ?? 0,
        height: obstacle.sprite.length,
      };

      return (
        dino.x + 4 < cactus.x + cactus.width &&
        dino.x + dino.width - 3 > cactus.x &&
        dino.y + 2 < cactus.y + cactus.height &&
        dino.y + dino.height - 1 > cactus.y
      );
    });
  }

  function playerX() {
    return Math.max(
      8,
      Math.min(display.columns - 18, Math.round(display.columns * 0.34)),
    );
  }

  function playerY() {
    return Math.round(groundRow() - DINO_HEIGHT + 2 + dinoOffset);
  }

  function groundRow() {
    return Math.max(15, Math.round(display.rows * 0.67));
  }

  function centerText(value: string) {
    return Math.max(1, Math.round((display.columns - value.length * 4) / 2));
  }

  return {
    action,
    render,
    resize,
    start,
    update,
  };
}

function bitmapToSprite(rows: readonly string[], width: number) {
  return rows.map((row) =>
    row
      .slice(0, width)
      .padEnd(width, "0")
      .replaceAll("0", " ")
      .replaceAll("1", "#"),
  );
}

function getLocalTimeLabel() {
  const now = new Date();
  const hours = now.getHours();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours.toString()}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")} ${period}`;
}
