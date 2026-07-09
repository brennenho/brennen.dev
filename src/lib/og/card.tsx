import { renderPixelCoverDataUri } from "@/lib/og/cover";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = { height: 630, width: 1200 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

const COVER_HEIGHT = 264;
const HORIZONTAL_PADDING = 100;
const EMOJI_SIZE = 148;
const PRIMARY_GREEN = "#059669";

const geistBold = readFile(
  path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "src/lib/og/geist-bold.ttf",
  ),
);

type OgCardOptions = {
  cover?: "pixel" | "solid";
  coverColor?: string;
  emoji: string;
  footer?: string;
  title: string;
};

export async function renderOgCard({
  cover,
  coverColor = PRIMARY_GREEN,
  emoji,
  footer = "brennen.dev",
  title,
}: OgCardOptions) {
  const hasCover = Boolean(cover);

  return new ImageResponse(
    <div
      style={{
        backgroundColor: "#191919",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {cover === "pixel" ? (
        // eslint-disable-next-line @next/next/no-img-element -- satori renders plain elements, not next/image
        <img
          alt=""
          height={COVER_HEIGHT}
          src={renderPixelCoverDataUri(OG_IMAGE_SIZE.width, COVER_HEIGHT)}
          width={OG_IMAGE_SIZE.width}
        />
      ) : cover === "solid" ? (
        <div
          style={{
            backgroundColor: coverColor,
            height: COVER_HEIGHT,
            width: OG_IMAGE_SIZE.width,
          }}
        />
      ) : null}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: hasCover ? "flex-start" : "center",
          padding: `0 ${HORIZONTAL_PADDING}px`,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: EMOJI_SIZE,
            lineHeight: 1,
            ...(hasCover
              ? {
                  left: HORIZONTAL_PADDING,
                  position: "absolute",
                  top: -EMOJI_SIZE / 2,
                }
              : {}),
          }}
        >
          {emoji}
        </div>
        <div
          style={{
            color: "#f1f1ef",
            display: "block",
            fontSize: 68,
            fontWeight: 700,
            lineClamp: 1,
            lineHeight: 1.2,
            marginTop: hasCover ? EMOJI_SIZE / 2 + 44 : 48,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#858582",
            display: "block",
            fontSize: 32,
            fontWeight: 700,
            lineClamp: 1,
            lineHeight: 1.2,
            marginTop: 20,
          }}
        >
          {footer}
        </div>
      </div>
    </div>,
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        {
          data: await geistBold,
          name: "Geist",
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
