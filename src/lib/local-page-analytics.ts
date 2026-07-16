import { isLocalPagePath } from "@/lib/local-page-id";

export const LOCAL_PAGE_CREATED_EVENT = "local_page_created";

const CURRENT_LOCATION_PROPERTIES = ["$current_url", "$pathname"] as const;
const PRIVATE_LOCATION_PROPERTIES = [
  ...CURRENT_LOCATION_PROPERTIES,
  "$referrer",
  "$prev_pageview_pathname",
  "$prev_pageview_url",
] as const;

function containsLocalPagePath(value: unknown) {
  if (typeof value !== "string") return false;

  try {
    return isLocalPagePath(new URL(value, "https://brennen.dev").pathname);
  } catch {
    return false;
  }
}

export function sanitizeLocalPageAnalytics(
  eventName: string,
  eventProperties: Record<string, unknown>,
) {
  const properties = { ...eventProperties };
  const originatedOnLocalPage = CURRENT_LOCATION_PROPERTIES.some((key) =>
    containsLocalPagePath(properties[key]),
  );

  if (originatedOnLocalPage && eventName !== LOCAL_PAGE_CREATED_EVENT) {
    return null;
  }

  for (const key of PRIVATE_LOCATION_PROPERTIES) {
    if (containsLocalPagePath(properties[key])) delete properties[key];
  }

  return properties;
}
