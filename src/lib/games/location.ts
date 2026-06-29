const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-nf-country",
  "fastly-client-country-code",
  "x-country-code",
  "x-appengine-country",
  "x-geo-country",
] as const;
const UNKNOWN_COUNTRY_CODES = new Set(["", "XX", "ZZ", "UNKNOWN"]);
const REGION_DISPLAY_NAMES = new Intl.DisplayNames(["en"], {
  type: "region",
});

type Country = {
  code: string;
  name: string;
};

export type { Country };

export function getCountry(requestHeaders: Headers): Country | null {
  for (const header of COUNTRY_HEADERS) {
    const country = getCountryFromHeader(requestHeaders.get(header));

    if (country) return country;
  }

  return null;
}

function getCountryFromHeader(value: string | null): Country | null {
  const candidates = value
    ?.split(",")
    .map((candidate) => candidate.trim().toUpperCase())
    .filter(Boolean);

  for (const countryCode of candidates ?? []) {
    if (UNKNOWN_COUNTRY_CODES.has(countryCode)) continue;
    if (!/^[A-Z]{2}$/.test(countryCode)) continue;

    try {
      return {
        code: countryCode,
        name: REGION_DISPLAY_NAMES.of(countryCode) ?? countryCode,
      };
    } catch {
      return {
        code: countryCode,
        name: countryCode,
      };
    }
  }

  return null;
}
