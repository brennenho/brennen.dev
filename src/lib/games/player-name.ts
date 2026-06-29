import playerNameBanks from "@/lib/games/name-bank.json";

const ADJECTIVES = playerNameBanks.adjectives;
const NOUNS = playerNameBanks.nouns;

export const PLAYER_NAME_COUNT = ADJECTIVES.length * NOUNS.length;

export function generatePlayerNameCandidates() {
  const names = ADJECTIVES.flatMap((adjective) =>
    NOUNS.map((noun) => `${adjective} ${noun}`),
  );

  return shuffle(names);
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = shuffled[index];
    const swapItem = shuffled[swapIndex];

    if (currentItem === undefined || swapItem === undefined) continue;

    shuffled[index] = swapItem;
    shuffled[swapIndex] = currentItem;
  }

  return shuffled;
}
