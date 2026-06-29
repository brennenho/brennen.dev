const ADJECTIVES = [
  "Brave",
  "Bright",
  "Calm",
  "Clever",
  "Cosmic",
  "Daring",
  "Electric",
  "Fuzzy",
  "Gentle",
  "Happy",
  "Lucky",
  "Mighty",
  "Nimble",
  "Pixel",
  "Quick",
  "Sunny",
  "Tiny",
  "Turbo",
  "Velvet",
  "Witty",
] as const;

const NOUNS = [
  "Comet",
  "Dino",
  "Echo",
  "Fern",
  "Glider",
  "Hero",
  "Jumper",
  "Lantern",
  "Meteor",
  "Noodle",
  "Orbit",
  "Pebble",
  "Quest",
  "Rocket",
  "Spark",
  "Sprout",
  "Trail",
  "Voyager",
  "Widget",
  "Zest",
] as const;

export function generatePlayerName(attempt: number) {
  const adjective = randomItem(ADJECTIVES);
  const noun = randomItem(NOUNS);
  const baseName = `${adjective} ${noun}`;

  return attempt === 0 ? baseName : `${baseName} ${randomNumber(1000, 9999)}`;
}

function randomItem<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function randomNumber(minimum: number, maximum: number) {
  return minimum + Math.floor(Math.random() * (maximum - minimum + 1));
}
