"use client";

import { useEffect, useState } from "react";
import { type CharCell, TerminalWindow } from "./terminalWindow";
import { RandomOffsetFibTree, type TreeOptions } from "./tree";

const WIDTH = 80; // characters
const HEIGHT = 40; // rows

export function Bonsai() {
  const [grid, setGrid] = useState<CharCell[][] | null>(null);

  useEffect(() => {
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

    const win = new TerminalWindow(WIDTH, HEIGHT, options);

    // Root position in "plane" coords (x across, y up)
    const rootX = WIDTH / 2;
    const rootY = 0; // bottom

    // Choose one:
    // const tree = new ClassicTree(win, [rootX, rootY], options);
    const tree = new RandomOffsetFibTree(win, [rootX, rootY], options);

    tree.draw();

    setGrid(win.getChars());
  }, []);

  if (!grid) return <div className="font-mono text-sm">Growing bonsai…</div>;

  return (
    <div className="inline-block rounded-lg bg-black p-4">
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
    </div>
  );
}
