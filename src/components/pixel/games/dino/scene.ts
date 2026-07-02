import { PixelDisplay } from "../../display";
import type { PixelScene } from "../../scene";
import { CLOUD, DINO, DINO_RUN_1, DINO_RUN_2 } from "./assets";
import { DinoEngine, type DinoObstacle } from "./engine";

const CLOCK_COLON = ["##", "##", "  ", "  ", "  ", "##", "##"] as const;
const CLOCK_COLON_GAP = 2;
const CLOCK_HEIGHT = CLOCK_COLON.length;
const CLOCK_PERIOD_GAP = 4;
const CLOUD_BRIGHTNESS = 104;
const CLOUD_MAX_COUNT = 3;
const CLOUD_SPEED_COEFFICIENT = 0.13;

type Cloud = {
  gap: number;
  x: number;
  y: number;
};

export function createDinoScene(context: CanvasRenderingContext2D): PixelScene {
  const display = new PixelDisplay(context);
  const game = new DinoEngine();
  let clouds: Cloud[] = [];
  let highScore = 0;

  function resize(width: number, height: number, scale: number) {
    context.imageSmoothingEnabled = false;
    display.resize(width, height, scale);
    configureGame();
    seedClouds();
  }

  function start() {
    configureGame();
    game.start();
  }

  function reset() {
    game.reset();
  }

  function releaseAction() {
    game.releaseAction();
  }

  function score() {
    return currentScore();
  }

  function setHighScore(score: number) {
    highScore = Math.max(0, Math.floor(score), currentScore());
  }

  function action() {
    configureGame();
    game.action();
  }

  function status() {
    return game.mode;
  }

  function update(delta: number) {
    game.update(delta);
    updateClouds(delta);
    highScore = Math.max(highScore, currentScore());
  }

  function render() {
    display.clear();

    drawClouds();
    drawGround();
    drawAmbientCover();
    drawHighScore();
    drawScore();
    drawClockOverlay();

    drawDino();
    game.obstacles.forEach(drawCactus);

    if (game.mode === "over") {
      display.text(
        centerText("GAME OVER"),
        Math.max(2, game.groundRow() - 16),
        "GAME OVER",
      );
    }

    display.render();
  }

  function configureGame() {
    game.configure({
      columns: display.columns,
      groundRow: groundRow(),
      playerX: playerX(),
    });
  }

  function seedClouds() {
    if (clouds.length > 0 || display.columns < 140) return;

    clouds = [
      createCloud(randomBetween(display.columns * 0.42, display.columns * 0.7)),
    ];
  }

  function updateClouds(delta: number) {
    if (display.columns < 140 || game.mode === "over") return;

    const speed = game.speed * CLOUD_SPEED_COEFFICIENT;
    clouds = clouds
      .map((cloud) => ({ ...cloud, x: cloud.x - speed * delta }))
      .filter((cloud) => cloud.x > -cloudWidth());

    const lastCloud = clouds.at(-1);

    if (!lastCloud) {
      clouds.push(createCloud(display.columns + randomBetween(0, 24)));
      return;
    }

    if (
      clouds.length < CLOUD_MAX_COUNT &&
      display.columns - lastCloud.x > lastCloud.gap
    ) {
      clouds.push(createCloud(display.columns + randomBetween(0, 24)));
    }
  }

  function drawClouds() {
    clouds.forEach((cloud) => {
      display.sprite(Math.round(cloud.x), cloud.y, CLOUD, CLOUD_BRIGHTNESS);
    });
  }

  function drawGround() {
    const y = game.groundRow();

    for (let x = 0; x < display.columns; x++) {
      const worldX = Math.floor(x + game.worldOffset);
      const noise = terrainNoise(worldX);
      const detailNoise = terrainNoise(worldX * 7 + 13);
      const offset = noise > 0.89 ? -1 : noise < 0.11 ? 1 : 0;
      const brightness = offset === 0 ? 235 : detailNoise > 0.62 ? 205 : 178;

      display.set(x, y + offset, brightness);

      if (offset !== 0 && detailNoise > 0.86) {
        display.set(x, y, 185);
      }
    }
  }

  function drawAmbientCover() {
    if (game.mode !== "cover") return;

    drawCactus(game.coverCactus());
  }

  function drawClockOverlay() {
    const clockRow = Math.max(
      1,
      Math.min(game.groundRow() + 6, display.rows - CLOCK_HEIGHT - 2),
    );
    drawClock(clockRow);
  }

  function drawDino() {
    const shouldRun = game.mode === "playing" && game.playerOffset === 0;
    const frame = shouldRun
      ? Math.floor(game.elapsed / game.runFrameInterval()) % 2 === 0
        ? DINO_RUN_1
        : DINO_RUN_2
      : DINO;

    display.sprite(game.playerX(), game.playerY(), frame, 255);
  }

  function drawCactus(obstacle: DinoObstacle) {
    const x = Math.round(obstacle.x);
    const y = game.groundRow() - obstacle.sprite.length + 1;

    display.sprite(x, y, obstacle.sprite, 238);
  }

  function drawScore() {
    if (game.mode === "cover" || display.columns < 46) return;

    const text = String(currentScore()).padStart(5, "0");
    display.text(display.columns - display.measureText(text) - 2, 2, text, 230);
  }

  function drawHighScore() {
    if (game.mode === "cover" || display.columns < 72) return;

    const text = `HI:${String(highScore).padStart(5, "0")}`;
    display.text(2, 2, text, 230);
  }

  function currentScore() {
    return Math.floor(game.score);
  }

  function drawClock(row: number) {
    const time = getLocalTimeParts();
    const hourWidth = display.measureText(time.hour);
    const minuteWidth = display.measureText(time.minute);
    const periodWidth = display.measureText(time.period);
    const totalWidth =
      hourWidth +
      CLOCK_COLON_GAP +
      CLOCK_COLON[0].length +
      CLOCK_COLON_GAP +
      minuteWidth +
      CLOCK_PERIOD_GAP +
      periodWidth;
    const rightInset = display.columns < 120 ? 6 : 28;
    let cursor = Math.max(1, display.columns - totalWidth - rightInset);

    display.text(cursor, row, time.hour, 165);
    cursor += hourWidth + CLOCK_COLON_GAP;

    if (Math.floor(Date.now() / 1000) % 2 === 0) {
      display.sprite(cursor, row, CLOCK_COLON, 165);
    }
    cursor += CLOCK_COLON[0].length + CLOCK_COLON_GAP;

    display.text(cursor, row, time.minute, 165);
    cursor += minuteWidth + CLOCK_PERIOD_GAP;
    display.text(cursor, row, time.period, 165);
  }

  function groundRow() {
    const ratio = display.columns < 120 ? 0.54 : 0.72;

    return Math.max(15, Math.round(display.rows * ratio));
  }

  function playerX() {
    return Math.max(
      8,
      Math.min(display.columns - 18, Math.round(display.columns * 0.21)),
    );
  }

  function centerText(value: string) {
    return Math.max(
      1,
      Math.round((display.columns - display.measureText(value)) / 2),
    );
  }

  function createCloud(x: number): Cloud {
    return {
      gap: randomBetween(cloudMinGap(), cloudMaxGap()),
      x,
      y: randomSkyRow(),
    };
  }

  function randomSkyRow() {
    const top = 13;
    const bottom = Math.max(top, Math.min(32, game.groundRow() - 34));

    return Math.round(randomBetween(top, bottom));
  }

  function cloudMinGap() {
    return Math.max(54, display.columns * 0.2);
  }

  function cloudMaxGap() {
    return Math.max(cloudMinGap() + 34, display.columns * 0.52);
  }

  return {
    action,
    render,
    reset,
    releaseAction,
    resize,
    score,
    setHighScore,
    start,
    status,
    update,
  };
}

function getLocalTimeParts() {
  const now = new Date();
  const hours = now.getHours();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return {
    hour: displayHours.toString(),
    minute: now.getMinutes().toString().padStart(2, "0"),
    period,
  };
}

function terrainNoise(value: number) {
  const x = Math.sin(value * 12.9898 + 78.233) * 43758.5453;

  return x - Math.floor(x);
}

function cloudWidth() {
  return CLOUD[0]?.length ?? 0;
}

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
}
