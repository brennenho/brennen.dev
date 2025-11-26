import type { AsciiWindow, TreeOptions } from "./tree";
import { randInt } from "./utils";

const CHAR_THRESHOLD = 0.3;

export interface CharCell {
  char: string;
  colour: [number, number, number] | null;
}

class Line {
  m: number = 0;
  b: number = 0;
  is_vertical: boolean = false;
  private x_const: number = 0;

  set_end_points(start: [number, number], end: [number, number]): void {
    const [x1, y1] = start;
    const [x2, y2] = end;

    if (Math.abs(x1 - x2) < 1e-9) {
      this.is_vertical = true;
      this.x_const = x1;
    } else {
      this.is_vertical = false;
      this.m = (y2 - y1) / (x2 - x1);
      this.b = y1 - this.m * x1;
    }
  }

  get_theta(): number {
    if (this.is_vertical) return Math.PI / 2;
    return Math.atan(this.m); // angle from x-axis
  }

  get_x(y: number): number {
    if (this.is_vertical) return this.x_const;
    // y = m x + b => x = (y - b)/m
    return (y - this.b) / this.m;
  }

  get_y(x: number): number {
    if (this.is_vertical) return NaN;
    return this.m * x + this.b;
  }
}

export class DrawWindow implements AsciiWindow {
  static CHAR_WIDTH = 1;
  static CHAR_HEIGHT = 2;
  static BACKGROUND_CHAR = " ";

  width: number;
  height: number;
  options: TreeOptions;
  chars: CharCell[][];

  constructor(width: number, height: number, options: TreeOptions) {
    this.width = width;
    this.height = height;
    this.options = options;

    this.chars = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => ({
        char: DrawWindow.BACKGROUND_CHAR,
        colour: null,
      })),
    );
  }

  // browser version: no ANSI; we just keep RGB separately
  private colour_char(char: string, r: number, g: number, b: number): CharCell {
    return { char, colour: [r, g, b] };
  }

  clear_chars(): void {
    this.chars = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => ({
        char: DrawWindow.BACKGROUND_CHAR,
        colour: null,
      })),
    );
  }

  plane_to_screen(x: number, y: number): [number, number] {
    const scaled_x = x / DrawWindow.CHAR_WIDTH;
    const scaled_y = y / DrawWindow.CHAR_HEIGHT;

    const inx1 = Math.round(this.height - scaled_y);
    const inx2 = Math.round(scaled_x);

    return [inx1, inx2];
  }

  screen_to_plane(x: number, y: number): [number, number] {
    const swapped_x = y;
    const swapped_y = this.height - x;

    const scaled_x = swapped_x * DrawWindow.CHAR_WIDTH;
    const scaled_y = swapped_y * DrawWindow.CHAR_HEIGHT;

    return [scaled_x, scaled_y];
  }

  increase_height(delta_height: number): boolean {
    if (this.options.fixed_window) {
      return false;
    }

    this.height += delta_height;

    for (let i = 0; i < delta_height; i++) {
      this.chars.unshift(
        Array.from({ length: this.width }, () => ({
          char: DrawWindow.BACKGROUND_CHAR,
          colour: null,
        })),
      );
    }

    return true;
  }

  set_char_instant(
    x: number,
    y: number,
    char: string,
    colour: [number, number, number],
    is_screen_coords: boolean,
  ): void {
    if (!is_screen_coords) {
      [x, y] = this.plane_to_screen(x, y);
    }

    if (x < 0) {
      const height_changed = this.increase_height(Math.abs(x));
      if (height_changed) {
        x = 0;
      }
    }

    if (x < 0 || x >= this.height || y < 0 || y >= this.width) {
      return;
    }

    const coloured = this.colour_char(char, colour[0], colour[1], colour[2]);
    this.chars[x]![y] = coloured;
  }

  set_char_wait(
    x: number,
    y: number,
    char: string,
    colour: [number, number, number],
    is_screen_coords: boolean,
    _wait_time: number,
  ): void {
    // For web, just draw immediately; ignore animation timing
    this.set_char_instant(x, y, char, colour, is_screen_coords);
  }

  private get_line_char(line: Line): string {
    const theta = line.get_theta();

    const upper = (Math.PI / 2) * (2 / 3);
    const lower = (Math.PI / 2) * (1 / 3);

    if (Math.abs(theta) > upper) {
      return "|";
    } else if (Math.abs(theta) < lower) {
      return "_";
    } else if (theta > 0) {
      return "/";
    } else {
      return "\\";
    }
  }

  private choose_colour(
    colour:
      | [number, number, number]
      | [[number, number], [number, number], [number, number]],
  ): [number, number, number] {
    if (typeof colour[0] === "number") {
      // fixed RGB
      return colour as [number, number, number];
    }

    // range for each channel
    const rng = colour as [
      [number, number],
      [number, number],
      [number, number],
    ];
    const rand_colour: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const [lower, upper] = rng[i]!;
      rand_colour[i] = randInt(lower, upper);
    }
    return rand_colour;
  }

  private draw_steep_line(
    start: [number, number],
    end: [number, number],
    colour:
      | [number, number, number]
      | [[number, number], [number, number], [number, number]],
    width: number,
    char: string,
    mid_line: Line,
  ): void {
    let [start_inx, _] = this.plane_to_screen(...start);
    let [end_inx, __] = this.plane_to_screen(...end);

    const step = end_inx > start_inx ? 1 : -1;

    for (let inx1 = start_inx; inx1 !== end_inx + step; inx1 += step) {
      const dists: { dist: number; inx2: number }[] = [];

      for (let inx2 = 0; inx2 < this.width; inx2++) {
        const [x, y] = this.screen_to_plane(inx1, inx2);
        const desired_x = mid_line.get_x(y);
        const dist = Math.abs(desired_x - x);
        dists.push({ dist, inx2 });
      }

      dists.sort((a, b) => a.dist - b.dist);

      for (let i = 0; i < width && i < dists.length; i++) {
        const chosen_char =
          Math.random() < CHAR_THRESHOLD
            ? (this.options.branch_chars[
                randInt(0, this.options.branch_chars.length - 1)
              ] as string)
            : char;

        const chosen_colour = this.choose_colour(colour);

        if (this.options.instant) {
          this.set_char_instant(
            inx1,
            dists[i]!.inx2,
            chosen_char,
            chosen_colour,
            true,
          );
        } else {
          this.set_char_wait(
            inx1,
            dists[i]!.inx2,
            chosen_char,
            chosen_colour,
            true,
            this.options.wait_time as number,
          );
        }
      }
    }
  }

  private draw_shallow_line(
    start: [number, number],
    end: [number, number],
    colour:
      | [number, number, number]
      | [[number, number], [number, number], [number, number]],
    width: number,
    char: string,
    mid_line: Line,
  ): void {
    let [_, start_inx] = this.plane_to_screen(...start);
    let [__, end_inx] = this.plane_to_screen(...end);

    const step = end_inx > start_inx ? 1 : -1;

    for (let inx2 = start_inx; inx2 !== end_inx + step; inx2 += step) {
      const dists: { dist: number; inx1: number }[] = [];

      for (let inx1 = 0; inx1 < this.height; inx1++) {
        const [x, y] = this.screen_to_plane(inx1, inx2);
        const desired_y = mid_line.get_y(x);
        const dist = Math.abs(desired_y - y);
        dists.push({ dist, inx1 });
      }

      dists.sort((a, b) => a.dist - b.dist);

      for (let i = 0; i < width && i < dists.length; i++) {
        const chosen_char =
          Math.random() < CHAR_THRESHOLD
            ? (this.options.branch_chars[
                randInt(0, this.options.branch_chars.length - 1)
              ] as string)
            : char;

        const chosen_colour = this.choose_colour(colour);

        if (this.options.instant) {
          this.set_char_instant(
            dists[i]!.inx1,
            inx2,
            chosen_char,
            chosen_colour,
            true,
          );
        } else {
          this.set_char_wait(
            dists[i]!.inx1,
            inx2,
            chosen_char,
            chosen_colour,
            true,
            this.options.wait_time as number,
          );
        }
      }
    }
  }

  private check_line_bounds(
    start: [number, number],
    end: [number, number],
  ): void {
    const [h1, _] = this.plane_to_screen(...start);
    const [h2, __] = this.plane_to_screen(...end);

    const room_from_top = Math.min(h1, h2);

    if (room_from_top < 0) {
      this.increase_height(Math.abs(room_from_top));
    }
  }

  draw_line(
    start: [number, number],
    end: [number, number],
    colour:
      | [number, number, number]
      | [[number, number], [number, number], [number, number]],
    width: number,
  ): void {
    const mid_line = new Line();
    mid_line.set_end_points(start, end);

    const char = this.get_line_char(mid_line);
    this.check_line_bounds(start, end);

    if (mid_line.is_vertical || Math.abs(mid_line.m) >= 1) {
      this.draw_steep_line(start, end, colour, width, char, mid_line);
    } else {
      this.draw_shallow_line(start, end, colour, width, char, mid_line);
    }
  }

  getChars(): CharCell[][] {
    return this.chars;
  }
}
