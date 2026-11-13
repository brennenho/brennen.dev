import { isLocalPagePath } from "@/lib/local-page-id";

export const LOCAL_PAGE_CREATED_EVENT = "local_page_created";

const CURRENT_LOCATION_PROPERTIES = ["$current_url", "$pathname"] as const;
const PRIVATE_LOCATION_PROPERTIES = [
  ...CURRENT_LOCATION_PROPERTIES,
  "$referrer",
  "$prev_pageview_pathname",
  "$prev_pageview_url",
  "$initial_current_url",
  "$initial_pathname",
  "$initial_referrer",
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
  if (eventName === LOCAL_PAGE_CREATED_EVENT) {
    // PostHog also adds page titles, initial referrers, and persisted properties.
    // Keep only the transport fields and the aggregate creation source.
    const properties: Record<string, unknown> = {
      $process_person_profile: false,
    };
    for (const key of ["token", "distinct_id", "source"]) {
      if (key in eventProperties) properties[key] = eventProperties[key];
    }
    return properties;
  }

  const properties = { ...eventProperties };
  const originatedOnLocalPage = CURRENT_LOCATION_PROPERTIES.some((key) =>
    containsLocalPagePath(properties[key]),
  );

  if (originatedOnLocalPage) {
    return null;
  }

  for (const key of PRIVATE_LOCATION_PROPERTIES) {
    if (containsLocalPagePath(properties[key])) delete properties[key];
  }

  for (const key of ["$set", "$set_once"]) {
    const value = properties[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      properties[key] = sanitizeLocalPageAnalytics(
        "$set",
        value as Record<string, unknown>,
      );
    }
  }

  return properties;
}

export function sanitizeLocalPageEvent<
  T extends {
    event: string;
    properties: Record<string, unknown>;
    $set?: Record<string, unknown>;
    $set_once?: Record<string, unknown>;
  },
>(event: T): T | null {
  const properties = sanitizeLocalPageAnalytics(event.event, event.properties);
  if (!properties) return null;

  const sanitized = { ...event, properties };
  for (const key of ["$set", "$set_once"] as const) {
    const value = event[key];
    if (!value) continue;
    const next =
      event.event === LOCAL_PAGE_CREATED_EVENT
        ? null
        : sanitizeLocalPageAnalytics("$set", value);
    if (next) sanitized[key] = next;
    else delete sanitized[key];
  }
  return sanitized;
}
