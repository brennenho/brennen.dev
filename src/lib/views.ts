const POSTHOG_API_HOST = "https://us.posthog.com";

export async function getViewCount(pathname: string): Promise<number | null> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!apiKey || !projectId) return null;

  try {
    const response = await fetch(
      `${POSTHOG_API_HOST}/api/projects/${projectId}/query/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query:
              "SELECT count() FROM events WHERE event = '$pageview' AND properties.$pathname = {pathname} AND properties.$host = 'brennen.dev'",
            values: { pathname },
          },
        }),
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { results?: [[number]] };
    const count = data.results?.[0]?.[0];
    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
}

export function formatViewCount(count: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(count)
    .toLowerCase();
}
