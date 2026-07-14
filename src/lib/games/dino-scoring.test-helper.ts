import { DinoEngine } from "@/components/pixel/games/dino/engine";

export function simulateDinoScore(elapsedSeconds: number) {
  const framesPerSecond = 60;
  const game = new DinoEngine();

  game.configure({ columns: 200, groundRow: 60, playerX: 20 });
  game.start();

  for (let frame = 0; frame < elapsedSeconds * framesPerSecond; frame += 1) {
    game.obstacles = [];
    game.update(1000 / framesPerSecond);
    game.obstacles = [];
  }

  return Math.floor(game.score);
}
