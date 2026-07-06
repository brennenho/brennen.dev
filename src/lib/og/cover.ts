import {
  CACTUS_SMALL_GROUPS,
  CACTUS_TALL_GROUPS,
  CLOUD,
  DINO,
  type Sprite,
} from "@/components/pixel/games/dino/assets";

const CSS_DOT_SIZE = 1.5;
const CSS_CELL_SIZE = 3;
const SCALE = 2;
const BACKGROUND_COLOR = "#050505";
const OFF_COLOR = "#252525";
const ON_COLOR = "#d8d8d4";
const CLOUD_BRIGHTNESS = 104;
const CACTUS_BRIGHTNESS = 238;
// Deterministic stand-ins for the live scene's randomized cloud placement.
const CLOUD_COLUMN_RATIOS = [0.48, 0.78];

/**
 * Renders the home page's dot-matrix dino cover as an SVG data URI so the
 * Open Graph image can embed a static frame of the same scene the live
 * pixel canvas shows in its cover state.
 */
export function renderPixelCoverDataUri(width: number, height: number) {
  const cellSize = CSS_CELL_SIZE * SCALE;
  const dotRadius = (CSS_DOT_SIZE * SCALE) / 2;
  const columns = Math.max(1, Math.floor(width / cellSize));
  const rows = Math.max(1, Math.floor(height / cellSize));
  const originX = (width - columns * cellSize) / 2;
  const originY = (height - rows * cellSize) / 2;
  const cells = new Map<number, number>();

  function set(column: number, row: number, value = 255) {
    const x = Math.round(column);
    const y = Math.round(row);

    if (x < 0 || x >= columns || y < 0 || y >= rows) return;

    const index = y * columns + x;
    cells.set(index, Math.max(cells.get(index) ?? 0, value));
  }

  function sprite(column: number, row: number, lines: Sprite, value = 255) {
    lines.forEach((line, y) => {
      Array.from(line).forEach((cell, x) => {
        if (cell !== " ") set(column + x, row + y, value);
      });
    });
  }

  const compact = columns < 120;
  const groundRow = Math.max(15, Math.round(rows * (compact ? 0.54 : 0.72)));
  const playerX = Math.max(
    8,
    Math.min(columns - 18, Math.round(columns * 0.21)),
  );
  const playerY = groundRow - DINO.length + 2;

  if (columns >= 140) {
    const cloudTop = Math.max(4, Math.round(rows * 0.08));
    const cloudBottom = Math.max(
      cloudTop,
      Math.min(
        Math.round(rows * 0.32),
        playerY - CLOUD.length - 4,
        groundRow - CLOUD.length - 18,
      ),
    );
    CLOUD_COLUMN_RATIOS.forEach((ratio, index) => {
      const cloudRow = index % 2 === 0 ? cloudTop : cloudBottom;
      sprite(Math.round(columns * ratio), cloudRow, CLOUD, CLOUD_BRIGHTNESS);
    });
  }

  for (let x = 0; x < columns; x++) {
    const noise = terrainNoise(x);
    const detailNoise = terrainNoise(x * 7 + 13);
    const offset = noise > 0.89 ? -1 : noise < 0.11 ? 1 : 0;
    const brightness = offset === 0 ? 235 : detailNoise > 0.62 ? 205 : 178;

    set(x, groundRow + offset, brightness);

    if (offset !== 0 && detailNoise > 0.86) {
      set(x, groundRow, 185);
    }
  }

  sprite(playerX, playerY, DINO, 255);

  const cactus = compact ? CACTUS_SMALL_GROUPS[0] : CACTUS_TALL_GROUPS[0];
  sprite(
    Math.round(columns * (compact ? 0.6 : 0.7)),
    groundRow - cactus.sprite.length + 1,
    cactus.sprite,
    CACTUS_BRIGHTNESS,
  );

  const dots = [...cells.entries()]
    .map(([index, value]) => {
      const cx = originX + (index % columns) * cellSize + cellSize / 2;
      const cy =
        originY + Math.floor(index / columns) * cellSize + cellSize / 2;
      // Cover the off-dot pattern underneath so translucent dots blend
      // against the background like the canvas renderer does.
      const mask = `<circle cx="${cx}" cy="${cy}" r="${dotRadius}" fill="${BACKGROUND_COLOR}"/>`;
      const opacity =
        value === 255 ? "" : ` opacity="${(value / 255).toFixed(3)}"`;

      return `${mask}<circle cx="${cx}" cy="${cy}" r="${dotRadius}" fill="${ON_COLOR}"${opacity}/>`;
    })
    .join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="${BACKGROUND_COLOR}"/>` +
    `<defs><pattern id="off" x="${originX}" y="${originY}" width="${cellSize}" height="${cellSize}" patternUnits="userSpaceOnUse">` +
    `<circle cx="${cellSize / 2}" cy="${cellSize / 2}" r="${dotRadius}" fill="${OFF_COLOR}"/>` +
    `</pattern></defs>` +
    `<rect x="${originX}" y="${originY}" width="${columns * cellSize}" height="${rows * cellSize}" fill="url(#off)"/>` +
    dots +
    `</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function terrainNoise(value: number) {
  const x = Math.sin(value * 12.9898 + 78.233) * 43758.5453;

  return x - Math.floor(x);
}
