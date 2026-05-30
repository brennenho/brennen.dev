import { PixelDisplay } from "../display";

export type PixelScene = {
  action: () => void;
  render: () => void;
  resize: (width: number, height: number, scale: number) => void;
  start: () => void;
  update: (delta: number) => void;
};

type Obstacle = {
  height: number;
  width: number;
  x: number;
};

const DINO = [
  "        ###### ",
  "       ########",
  "       ## # ###",
  "       ########",
  "       ####### ",
  "#      #####   ",
  "##    #######  ",
  "###  ######### ",
  "############   ",
  " ##########    ",
  "  ########     ",
  "   ######      ",
  "    ####       ",
  "    ## ##      ",
  "    ##  ##     ",
  "    ##         ",
] as const;

const DINO_RUN_1 = [
  "        ###### ",
  "       ########",
  "       ## # ###",
  "       ########",
  "       ####### ",
  "#      #####   ",
  "##    #######  ",
  "###  ######### ",
  "############   ",
  " ##########    ",
  "  ########     ",
  "   ######      ",
  "    ####       ",
  "    ##  ##     ",
  "    ##         ",
  "        ##     ",
] as const;

const DINO_RUN_2 = [
  "        ###### ",
  "       ########",
  "       ## # ###",
  "       ########",
  "       ####### ",
  "#      #####   ",
  "##    #######  ",
  "###  ######### ",
  "############   ",
  " ##########    ",
  "  ########     ",
  "   ######      ",
  "    ####       ",
  "     ## ##     ",
  "     ##        ",
  "    ##         ",
] as const;

const DINO_WIDTH = DINO[0].length;
const DINO_HEIGHT = DINO.length;

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
      const tall = Math.random() > 0.52;

      obstacles.push({
        height: tall ? 14 : 10,
        width: tall ? 7 : 5,
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
      height: Math.min(16, Math.max(12, Math.round(display.rows * 0.28))),
      width: 7,
      x: Math.round(display.columns * 0.79),
    });
    display.text(display.columns - 32, groundRow() + 6, "BRENNEN", 165);
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
    const y = groundRow() - obstacle.height + 1;
    const trunk = x + Math.floor(obstacle.width / 2);

    display.rect(trunk, y, 1, obstacle.height);
    display.rect(trunk - 1, y + obstacle.height - 2, 3, 2);
    display.rect(x, y + 4, 1, 5);
    display.rect(x + 1, y + 8, Math.max(2, trunk - x), 1);
    display.rect(x + obstacle.width, y + 5, 1, 5);
    display.rect(
      trunk,
      y + 9,
      obstacle.width - Math.floor(obstacle.width / 2),
      1,
    );
  }

  function drawScore() {
    if (display.columns < 46) return;

    const text =
      mode === "cover" ? "HI" : String(Math.floor(score)).padStart(5, "0");
    display.text(display.columns - text.length * 4 - 2, 2, text, 230);
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
        y: groundRow() - obstacle.height + 1,
        width: obstacle.width + 1,
        height: obstacle.height,
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
