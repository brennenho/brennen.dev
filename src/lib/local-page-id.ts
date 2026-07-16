export const LOCAL_PAGE_ID_PATTERN = /^[a-z0-9]{8}$/;

const LOCAL_PAGE_PATH_PATTERN = /^\/musings\/([a-z0-9]{8})\/?$/;
const LOCAL_PAGE_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function isLocalPageId(value: string) {
  return LOCAL_PAGE_ID_PATTERN.test(value);
}

export function isLocalPagePath(pathname: string) {
  return LOCAL_PAGE_PATH_PATTERN.test(pathname);
}

export function generateLocalPageId() {
  const values = new Uint8Array(8);
  crypto.getRandomValues(values);

  return Array.from(
    values,
    (value) =>
      LOCAL_PAGE_ID_ALPHABET[value % LOCAL_PAGE_ID_ALPHABET.length] ?? "a",
  ).join("");
}
