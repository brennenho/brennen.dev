"use client";

import { type CharCell, DrawWindow } from "@/lib/bonsai/draw";
import { OffsetFibTree, type TreeOptions } from "@/lib/bonsai/tree";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const WIDTH = 80; // characters
const HEIGHT = 40; // rows

function createTreeGrid(): CharCell[][] {
  const options: TreeOptions = {
    initial_len: 20,
    num_layers: 6,
    angle_mean: 0.5, // radians ~ 30 degrees
    leaf_len: 6,
    leaf_chars: ["*", "+", "."],
    instant: true,
    wait_time: 0,

    fixed_window: true,
    branch_chars: ["|", "/", "\\", "_"],
  };

  const win = new DrawWindow(WIDTH, HEIGHT, options);

  // Root position in "plane" coords (x across, y up)
  const rootX = WIDTH / 2;
  const rootY = 10; // bottom

  const tree = new OffsetFibTree(win, [rootX, rootY], options);
  tree.draw();

  return win.getChars();
}

export function Bonsai() {
  const [grid, setGrid] = useState<CharCell[][]>(createTreeGrid);

  return (
    <div className="flex flex-col gap-8 rounded-lg bg-slate-800 p-4">
      <pre className="font-mono text-[10px] leading-none">
        {grid.map((row, i) => (
          <div key={i}>
            {row.map((cell, j) => (
              <span
                key={j}
                style={{
                  color: cell.colour
                    ? `rgb(${cell.colour[0]}, ${cell.colour[1]}, ${cell.colour[2]})`
                    : "rgb(200,200,200)",
                }}
              >
                {cell.char}
              </span>
            ))}
          </div>
        ))}
      </pre>
      <Button
        onClick={() => setGrid(createTreeGrid())}
        variant="default"
        className="cursor-pointer"
      >
        <RefreshCw />
        New Tree
      </Button>
    </div>
  );
}
