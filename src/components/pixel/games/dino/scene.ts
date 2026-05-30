import { PixelDisplay } from "../../display";
import type { PixelScene } from "../../scene";
import { DINO, DINO_RUN_1, DINO_RUN_2 } from "./assets";
import { DinoEngine, type DinoObstacle } from "./engine";

const CLOCK_COLON = ["##", "##", "  ", "  ", "  ", "##", "##"] as const;
const CLOCK_COLON_GAP = 2;
const CLOCK_PERIOD_GAP = 4;

export function createDinoScene(context: CanvasRenderingContext2D): PixelScene {
  const display = new PixelDisplay(context);
  const game = new DinoEngine();

  function resize(width: number, height: number, scale: number) {
    context.imageSmoothingEnabled = false;
    display.resize(width, height, scale);
    configureGame();
  }

  function start() {
    configureGame();
    game.start();
  }

  function reset() {
    game.reset();
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
  }

  function render() {
    display.clear();

    drawGround();
    drawAmbientCover();
    drawScore();

    if (game.mode === "over") {
      display.text(
        centerText("GAME OVER"),
        Math.max(2, game.groundRow() - 16),
        "GAME OVER",
      );
    } else {
      drawDino();
      game.obstacles.forEach(drawCactus);
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

    drawClock(game.groundRow() + 6);
  }

  function drawDino() {
    const frame =
      game.mode === "playing"
        ? Math.floor(game.elapsed / 110) % 2 === 0
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

    const text = String(Math.floor(game.score)).padStart(5, "0");
    display.text(display.columns - display.measureText(text) - 2, 2, text, 230);
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
    let cursor = Math.max(1, display.columns - totalWidth - 28);

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
    return Math.max(15, Math.round(display.rows * 0.67));
  }

  function playerX() {
    return Math.max(
      8,
      Math.min(display.columns - 18, Math.round(display.columns * 0.24)),
    );
  }

  function centerText(value: string) {
    return Math.max(
      1,
      Math.round((display.columns - display.measureText(value)) / 2),
    );
  }

  return {
    action,
    render,
    reset,
    resize,
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
