export const SITE_URL = "https://brennen.dev";
export const SITE_NAME = "Brennen Ho";
export const SITE_DESCRIPTION =
  "I create intuitive products that simplify, accelerate, and personalize — with an emphasis on applied AI.";

export const SOCIAL_PROFILE_URLS = [
  "https://www.linkedin.com/in/brennenho/",
  "https://github.com/brennenho",
  "https://x.com/brennenho_",
] as const;

export const PROFILE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: SITE_URL,
  mainEntity: {
    "@id": `${SITE_URL}/#person`,
    "@type": "Person",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    sameAs: SOCIAL_PROFILE_URLS,
    knowsAbout: [
      "Applied artificial intelligence",
      "Product engineering",
      "Software engineering",
      "Computer engineering",
    ],
  },
} as const;

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
