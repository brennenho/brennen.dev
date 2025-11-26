import {
  randInt,
  randNormal,
  randUniform,
  shuffleInPlace,
  Vector,
} from "./utils";

export interface TreeOptions {
  initial_len: number;
  num_layers: number;
  angle_mean: number; // radians
  leaf_len: number;
  leaf_chars: string[];
  instant: boolean;
  wait_time: number;

  // extras used by TerminalWindow
  fixed_window: boolean;
  branch_chars: string[];
  [key: string]: unknown;
}

export interface AsciiWindow {
  width: number;

  plane_to_screen(x: number, y: number): [number, number];
  screen_to_plane(x: number, y: number): [number, number];

  set_char_instant(
    x: number,
    y: number,
    char: string,
    colour: [number, number, number],
    is_screen_coords: boolean,
  ): void;

  set_char_wait(
    x: number,
    y: number,
    char: string,
    colour: [number, number, number],
    is_screen_coords: boolean,
    wait_time: number,
  ): void;

  draw_line(
    start: [number, number],
    end: [number, number],
    colour:
      | [number, number, number]
      | [[number, number], [number, number], [number, number]],
    width: number,
  ): void;
}

abstract class BaseTree {
  static BOX_HEIGHT = 3;
  static MAX_TOP_WIDTH = 35;

  static MOUND_THRESHOLD = 0.1;
  static SOIL_CHAR_THRESHOLD = 0.1;

  static SOIL_CHARS = ".~*";

  static MOUND_WIDTH_MEAN = 2;
  static MOUND_WIDTH_STD_DEV = 1;

  static SOIL_COLOUR: [number, number, number] = [0, 150, 0];
  static BOX_COLOUR: [number, number, number] = [200, 200, 200];

  // range of rgb values
  static BRANCH_COLOUR: [[number, number], [number, number], [number, number]] =
    [
      [200, 255],
      [150, 255],
      [0, 0],
    ];

  protected window: AsciiWindow;
  protected root_x: number;
  protected root_y: number;
  protected options: TreeOptions;

  protected box_top_width: number;

  constructor(
    window: AsciiWindow,
    root_pos: [number, number],
    options: TreeOptions,
  ) {
    this.window = window;
    [this.root_x, this.root_y] = root_pos;
    this.options = options;

    this.box_top_width = this.get_box_width();
  }

  protected get_box_width(): number {
    let width = Math.min(
      Math.floor(this.window.width / 3),
      BaseTree.MAX_TOP_WIDTH,
    );

    if (width % 2 === 0) {
      width += 1; // width should be odd to allow tree to go in middle
    }

    return width;
  }

  draw_box(): void {
    const [root_inx1, root_inx2] = this.window.plane_to_screen(
      this.root_x,
      this.root_y,
    );

    for (let i = 0; i < BaseTree.BOX_HEIGHT; i++) {
      const inx1 = root_inx1 + i;
      const width = this.box_top_width - i * 2;

      for (let x = 0; x < width; x++) {
        const inx2 = root_inx2 - Math.floor(width / 2) + x;

        let char: string;
        let colour: [number, number, number];

        if (x === 0) {
          char = "\\";
          colour = BaseTree.BOX_COLOUR;
        } else if (x === width - 1) {
          char = "/";
          colour = BaseTree.BOX_COLOUR;
        } else if (i === 0) {
          char = "_";
          colour = BaseTree.SOIL_COLOUR;
        } else if (i === BaseTree.BOX_HEIGHT - 1) {
          char = "_";
          colour = BaseTree.BOX_COLOUR;
        } else {
          if (Math.random() < BaseTree.SOIL_CHAR_THRESHOLD) {
            const idx = randInt(0, BaseTree.SOIL_CHARS.length - 1);
            char = BaseTree.SOIL_CHARS[idx]!;
          } else {
            char = " ";
          }

          colour = BaseTree.SOIL_COLOUR;
        }

        this.window.set_char_instant(inx1, inx2, char, colour, true);
      }
    }

    this.draw_box_feet(root_inx1, root_inx2);
    this.draw_all_mounds(root_inx1, root_inx2);
  }

  protected draw_box_feet(root_inx1: number, root_inx2: number): void {
    const inx1 = root_inx1 + BaseTree.BOX_HEIGHT;
    const offset = Math.floor(this.box_top_width / 2) - BaseTree.BOX_HEIGHT - 1;

    for (let sign = -1; sign <= 1; sign += 2) {
      const inx2 = root_inx2 + sign * offset;
      this.window.set_char_instant(inx1, inx2, "‾", BaseTree.BOX_COLOUR, true);
    }
  }

  protected draw_all_mounds(root_inx1: number, root_inx2: number): void {
    let num_drawn = 0;

    for (let i = 1; i < this.box_top_width; i++) {
      const inx2 = root_inx2 - Math.floor(this.box_top_width / 2) + i;

      if (Math.random() < BaseTree.MOUND_THRESHOLD / (num_drawn + 1)) {
        num_drawn += 1;
        const max_width = this.box_top_width - i - 1;

        this.draw_mound(root_inx1, inx2, max_width);
      }
    }
  }

  protected draw_mound(
    inx1: number,
    start_inx2: number,
    max_width: number,
  ): void {
    let top_width = Math.round(
      randNormal(BaseTree.MOUND_WIDTH_MEAN, BaseTree.MOUND_WIDTH_STD_DEV),
    );
    top_width = Math.min(top_width, max_width - 2);

    if (top_width <= 0) return;

    for (let i = 0; i < top_width + 2; i++) {
      const inx2 = start_inx2 + i;
      const char = i === 0 || i === top_width + 1 ? "." : "-";

      this.window.set_char_instant(
        inx1,
        inx2,
        char,
        BaseTree.SOIL_COLOUR,
        true,
      );
    }
  }

  draw_tree_base(trunk_width: number): void {
    const [inx1, inx2] = this.window.plane_to_screen(this.root_x, this.root_y);

    const left_x = inx2 - Math.floor(trunk_width / 2);
    let right_x = inx2 + Math.floor(trunk_width / 2);

    if (trunk_width % 2 === 0) {
      right_x -= 1;
    }

    this.window.set_char_instant(inx1, left_x - 2, ".", [255, 255, 0], true);
    this.window.set_char_instant(inx1, left_x - 1, "/", [255, 255, 0], true);
    this.window.set_char_instant(inx1, right_x + 1, "\\", [255, 255, 0], true);
    this.window.set_char_instant(inx1, right_x + 2, ".", [255, 255, 0], true);
  }
}

// based off fractal canopy
export class RecursiveTree extends BaseTree {
  static ANGLE_STD_DEV = (8 * Math.PI) / 180;
  static LEN_SCALE = 0.75;
  static MAX_INITIAL_WIDTH = 6;

  constructor(
    window: AsciiWindow,
    root_pos: [number, number],
    options: TreeOptions,
  ) {
    super(window, root_pos, options);
  }

  protected get_end_coords(
    start_x: number,
    start_y: number,
    length: number,
    theta: number,
  ): [number, number] {
    const x = start_x + length * Math.sin(theta);
    const y = start_y + length * Math.cos(theta);
    return [x, y];
  }

  protected get_initial_params(): [number, number] {
    let initial_width = Math.floor(this.options.initial_len / 5);
    const initial_angle = randNormal(0, RecursiveTree.ANGLE_STD_DEV);

    initial_width = Math.max(0, initial_width);
    initial_width = Math.min(RecursiveTree.MAX_INITIAL_WIDTH, initial_width);

    return [initial_width, initial_angle];
  }
}

export class ClassicTree extends RecursiveTree {
  static MEAN_BRANCHES = 2;
  static BRANCHES_STD_DEV = 0.5;

  constructor(
    window: AsciiWindow,
    root_pos: [number, number],
    options: TreeOptions,
  ) {
    super(window, root_pos, options);
  }

  draw_branch(
    x: number,
    y: number,
    layer: number,
    length: number,
    width: number,
    theta: number,
  ): void {
    if (layer >= this.options.num_layers) {
      const leaves = new Leaves(this.window, [x, y], this.options);
      leaves.draw();
      return;
    }

    const [end_x, end_y] = this.get_end_coords(x, y, length, theta);
    this.window.draw_line(
      [x, y],
      [end_x, end_y],
      BaseTree.BRANCH_COLOUR,
      Math.round(width),
    );

    this.draw_end_branches(x, y, layer, length, width, theta);
  }

  protected draw_end_branches(
    start_x: number,
    start_y: number,
    layer: number,
    length: number,
    width: number,
    theta: number,
  ): void {
    let sign = 1;
    const num_branches = Math.max(
      0,
      Math.round(
        randNormal(ClassicTree.MEAN_BRANCHES, ClassicTree.BRANCHES_STD_DEV),
      ),
    );
    const step = num_branches !== 0 ? length / num_branches : 0;

    const new_width = Math.max(1, width - 1);
    const new_length = length * ClassicTree.LEN_SCALE;

    for (let i = 0; i < num_branches; i++) {
      const dist_up_branch = (i + 1) * step;
      const new_theta =
        theta +
        sign * randNormal(this.options.angle_mean, RecursiveTree.ANGLE_STD_DEV);

      const [x, y] = this.get_end_coords(
        start_x,
        start_y,
        dist_up_branch,
        theta,
      );
      this.draw_branch(x, y, layer + 1, new_length, new_width, new_theta);

      sign *= -1;
    }
  }

  draw(): void {
    const [initial_width, initial_angle] = this.get_initial_params();

    this.draw_box();
    this.draw_tree_base(initial_width);

    this.draw_branch(
      this.root_x,
      this.root_y,
      1,
      this.options.initial_len,
      initial_width,
      initial_angle,
    );
  }
}

export class FibonacciTree extends RecursiveTree {
  protected fib: number[];
  protected branch_nums: number[][];

  constructor(
    window: AsciiWindow,
    root_pos: [number, number],
    options: TreeOptions,
  ) {
    super(window, root_pos, options);
    this.fib = this.fib_nums();
    this.branch_nums = this.generate_branch_nums();
  }

  protected fib_nums(): number[] {
    const fib = [1, 1];
    for (let i = 0; i < this.options.num_layers; i++) {
      fib.push(fib[fib.length - 1]! + fib[fib.length - 2]!);
    }
    return fib;
  }

  protected generate_branch_nums(): number[][] {
    const branch_nums: number[][] = [[1]];

    for (let i = 0; i < this.options.num_layers; i++) {
      const num_branches = this.fib[i + 2]!;
      const num_parents = branch_nums[branch_nums.length - 1]!.reduce(
        (a, b) => a + b,
        0,
      );

      const base = Math.floor(num_branches / num_parents);
      const diff = num_branches - base * num_parents;

      const current_nums: number[] = [];
      for (let x = 0; x < num_parents; x++) {
        current_nums.push(x < diff ? base + 1 : base);
      }

      shuffleInPlace(current_nums);
      branch_nums.push(current_nums);
    }

    return branch_nums;
  }

  protected get_child_start_index(
    layer_inx: number,
    branch_inx: number,
  ): number {
    const layer = this.branch_nums[layer_inx]!;
    let sum = 0;
    for (let i = 0; i < branch_inx; i++) {
      sum += layer[i]!;
    }
    return sum;
  }

  draw_branch(
    x: number,
    y: number,
    layer_inx: number,
    branch_inx: number,
    length: number,
    width: number,
    theta: number,
  ): void {
    if (layer_inx > this.options.num_layers) {
      const leaf = new Leaves(this.window, [x, y], this.options);
      leaf.draw();
      return;
    }

    const [end_x, end_y] = this.get_end_coords(x, y, length, theta);
    this.window.draw_line(
      [x, y],
      [end_x, end_y],
      BaseTree.BRANCH_COLOUR,
      Math.round(width),
    );

    this.draw_end_branches(x, y, layer_inx, branch_inx, length, width, theta);
  }

  protected draw_end_branches(
    start_x: number,
    start_y: number,
    layer_inx: number,
    branch_inx: number,
    length: number,
    width: number,
    theta: number,
  ): void {
    let sign = 1;
    const num_branches = this.branch_nums[layer_inx]![branch_inx]!;
    const new_width = Math.max(1, width - 1);
    const child_start_index = this.get_child_start_index(layer_inx, branch_inx);

    const [x, y] = this.get_end_coords(start_x, start_y, length, theta);

    for (let i = 0; i < num_branches; i++) {
      const angle = randNormal(
        this.options.angle_mean,
        RecursiveTree.ANGLE_STD_DEV,
      );
      const new_theta = theta + sign * angle;
      const new_len = length * RecursiveTree.LEN_SCALE;

      this.draw_branch(
        x,
        y,
        layer_inx + 1,
        child_start_index + i,
        new_len,
        new_width,
        new_theta,
      );

      sign *= -1;
    }
  }

  draw(): void {
    const [initial_width, initial_angle] = this.get_initial_params();

    this.draw_box();
    this.draw_tree_base(initial_width);

    this.draw_branch(
      this.root_x,
      this.root_y,
      1,
      0,
      this.options.initial_len,
      initial_width,
      initial_angle,
    );
  }
}

export class OffsetFibTree extends FibonacciTree {
  constructor(
    window: AsciiWindow,
    root_pos: [number, number],
    options: TreeOptions,
  ) {
    super(window, root_pos, options);
  }

  protected draw_end_branches(
    start_x: number,
    start_y: number,
    layer_inx: number,
    branch_inx: number,
    length: number,
    width: number,
    theta: number,
  ): void {
    let sign = 1;
    const num_branches = this.branch_nums[layer_inx]![branch_inx]!;
    const child_start_index = this.get_child_start_index(layer_inx, branch_inx);

    const step = num_branches !== 0 ? length / num_branches : 0;

    const new_width = Math.max(1, width - 1);
    const new_length = length * ClassicTree.LEN_SCALE;

    for (let i = 0; i < num_branches; i++) {
      const dist_up_branch = (i + 1) * step;
      const new_theta =
        theta +
        sign * randNormal(this.options.angle_mean, RecursiveTree.ANGLE_STD_DEV);

      const [x, y] = this.get_end_coords(
        start_x,
        start_y,
        dist_up_branch,
        theta,
      );

      this.draw_branch(
        x,
        y,
        layer_inx + 1,
        child_start_index + i,
        new_length,
        new_width,
        new_theta,
      );

      sign *= -1;
    }
  }
}

export class RandomOffsetFibTree extends FibonacciTree {
  static GROW_END_THRESHOLD = 0.5;
  static NON_END_MIN = 0.3;
  static NON_END_MAX = 0.9;

  constructor(
    window: AsciiWindow,
    root_pos: [number, number],
    options: TreeOptions,
  ) {
    super(window, root_pos, options);
  }

  protected draw_end_branches(
    start_x: number,
    start_y: number,
    layer_inx: number,
    branch_inx: number,
    length: number,
    width: number,
    theta: number,
  ): void {
    let sign = 1;
    const num_branches = this.branch_nums[layer_inx]![branch_inx]!;
    const child_start_index = this.get_child_start_index(layer_inx, branch_inx);

    const new_width = Math.max(1, width - 1);
    const new_length = length * ClassicTree.LEN_SCALE;

    let need_leaves = true;

    for (let i = 0; i < num_branches; i++) {
      const grow_at_end =
        Math.random() < RandomOffsetFibTree.GROW_END_THRESHOLD;

      let dist_up_branch: number;
      if (grow_at_end) {
        need_leaves = false;
        dist_up_branch = length;
      } else {
        dist_up_branch = randUniform(
          length * RandomOffsetFibTree.NON_END_MIN,
          length * RandomOffsetFibTree.NON_END_MAX,
        );
      }

      const new_theta =
        theta +
        sign * randNormal(this.options.angle_mean, RecursiveTree.ANGLE_STD_DEV);

      const [x, y] = this.get_end_coords(
        start_x,
        start_y,
        dist_up_branch,
        theta,
      );

      this.draw_branch(
        x,
        y,
        layer_inx + 1,
        child_start_index + i,
        new_length,
        new_width,
        new_theta,
      );

      sign *= -1;
    }

    if (need_leaves) {
      const end_pos = this.get_end_coords(start_x, start_y, length, theta);
      const leaves = new Leaves(this.window, end_pos, this.options);
      leaves.draw();
    }
  }
}

export class Leaves {
  static NUM_LEAVES = 4;

  private window: AsciiWindow;
  private branch_x: number;
  private branch_y: number;
  private options: TreeOptions;

  constructor(
    window: AsciiWindow,
    branch_end: [number, number],
    options: TreeOptions,
  ) {
    this.window = window;
    [this.branch_x, this.branch_y] = branch_end;
    this.options = options;
  }

  draw(): void {
    const g = new Vector(0, -1);

    for (let _ = 0; _ < Leaves.NUM_LEAVES; _++) {
      const vel = new Vector(randUniform(-1, 1), randUniform(-1, 1));
      vel.normalise();
      let pos = new Vector(this.branch_x, this.branch_y);

      for (let i = 0; i < this.options.leaf_len; i++) {
        pos = pos.add(vel);

        const colour: [number, number, number] = [0, randInt(75, 255), 0];
        const leaf_chars = this.options.leaf_chars;
        const char = leaf_chars[randInt(0, leaf_chars.length - 1)];

        if (this.options.instant) {
          this.window.set_char_instant(pos.x, pos.y, char!, colour, false);
        } else {
          this.window.set_char_wait(
            pos.x,
            pos.y,
            char!,
            colour,
            false,
            this.options.wait_time,
          );
        }

        const weight = i / this.options.leaf_len;
        const gravity = g.scale(weight);
        const newVel = vel.add(gravity);
        vel.x = newVel.x;
        vel.y = newVel.y;
      }
    }
  }
}
