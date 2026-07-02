import bitmapFont from "./bitmap-font.json";

type MatrixOptions = {
  offColor?: string;
  onColor?: string;
};

type BitmapGlyph = {
  data: string[];
};

const CSS_DOT_SIZE = 1.5;
const CSS_CELL_SIZE = 3;

export class PixelDisplay {
  private cells = new Uint8Array(0);
  private cellSize = CSS_CELL_SIZE;
  private dotSize = CSS_DOT_SIZE;
  private originX = 0;
  private originY = 0;
  private width = 1;
  private height = 1;

  columns = 1;
  rows = 1;

  constructor(
    private readonly context: CanvasRenderingContext2D,
    private readonly options: MatrixOptions = {},
  ) {}

  resize(width: number, height: number, scale: number) {
    this.width = width;
    this.height = height;
    this.cellSize = CSS_CELL_SIZE * scale;
    this.dotSize = CSS_DOT_SIZE * scale;
    this.columns = Math.max(1, Math.floor(width / this.cellSize));
    this.rows = Math.max(1, Math.floor(height / this.cellSize));
    this.originX = (width - this.columns * this.cellSize) / 2;
    this.originY = (height - this.rows * this.cellSize) / 2;
    this.cells = new Uint8Array(this.columns * this.rows);
  }

  clear() {
    this.cells.fill(0);
  }

  set(column: number, row: number, value = 255) {
    const x = Math.round(column);
    const y = Math.round(row);

    if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) return;

    this.cells[y * this.columns + x] = Math.max(
      this.cells[y * this.columns + x] ?? 0,
      value,
    );
  }

  rect(
    column: number,
    row: number,
    width: number,
    height: number,
    value = 255,
  ) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.set(column + x, row + y, value);
      }
    }
  }

  eraseRect(column: number, row: number, width: number, height: number) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.erase(column + x, row + y);
      }
    }
  }

  line(
    startColumn: number,
    startRow: number,
    endColumn: number,
    endRow: number,
    value = 255,
  ) {
    const dx = Math.abs(endColumn - startColumn);
    const dy = Math.abs(endRow - startRow);
    const sx = startColumn < endColumn ? 1 : -1;
    const sy = startRow < endRow ? 1 : -1;
    let error = dx - dy;
    let x = startColumn;
    let y = startRow;

    while (true) {
      this.set(x, y, value);
      if (x === endColumn && y === endRow) break;

      const e2 = 2 * error;
      if (e2 > -dy) {
        error -= dy;
        x += sx;
      }
      if (e2 < dx) {
        error += dx;
        y += sy;
      }
    }
  }

  sprite(column: number, row: number, rows: readonly string[], value = 255) {
    rows.forEach((line, y) => {
      Array.from(line).forEach((cell, x) => {
        if (cell !== " ") this.set(column + x, row + y, value);
      });
    });
  }

  text(
    column: number,
    row: number,
    value: string,
    brightness = 255,
    charSpacing = 1,
  ) {
    let cursor = column;

    for (const character of value.toUpperCase()) {
      const glyph = getGlyph(character);
      this.sprite(cursor, row, glyph.data, brightness);
      cursor += glyph.width + charSpacing;
    }
  }

  measureText(value: string, charSpacing = 1) {
    return Array.from(value.toUpperCase()).reduce((width, character, index) => {
      const glyph = getGlyph(character);
      return (
        width + glyph.width + (index === value.length - 1 ? 0 : charSpacing)
      );
    }, 0);
  }

  render() {
    const offColor = this.options.offColor ?? "#252525";
    const onColor = this.options.onColor ?? "#d8d8d4";

    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = "#050505";
    this.context.fillRect(0, 0, this.width, this.height);

    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const value = this.cells[row * this.columns + column] ?? 0;
        const x = this.originX + column * this.cellSize + this.cellSize / 2;
        const y = this.originY + row * this.cellSize + this.cellSize / 2;

        this.context.beginPath();
        this.context.arc(x, y, this.dotSize / 2, 0, Math.PI * 2);
        this.context.fillStyle = value > 0 ? onColor : offColor;
        this.context.globalAlpha = value > 0 ? value / 255 : 1;
        this.context.fill();
      }
    }

    this.context.globalAlpha = 1;
  }

  private erase(column: number, row: number) {
    const x = Math.round(column);
    const y = Math.round(row);

    if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) return;

    this.cells[y * this.columns + x] = 0;
  }
}

function getGlyph(character: string) {
  const chars = bitmapFont.chars as Record<string, BitmapGlyph>;
  const data = chars[character]?.data ?? chars.DEFAULT?.data ?? ["00000"];
  const width = data[0]?.length ?? 0;

  return {
    data: data.map((row) => row.replaceAll("0", " ").replaceAll("1", "#")),
    width,
  };
}
