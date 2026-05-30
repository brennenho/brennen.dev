"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type SpotifyTrack = {
  item: {
    uri: string;
    name: string;
    external_urls?: {
      spotify?: string;
    };
    album: {
      name: string;
      images: Array<{ url: string; width: number; height: number }>;
    };
    artists: Array<{ name: string }>;
  };
  is_playing: boolean;
};

export function SpotifyMention() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchTrack() {
      try {
        const response = await fetch("/api/spotify");
        if (!response.ok) return;
        const data = (await response.json()) as SpotifyTrack;
        if (mounted) setTrack(data);
      } finally {
        if (mounted) setLoaded(true);
      }
    }

    void fetchTrack();
    const id = window.setInterval(fetchTrack, 15000);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const image = track?.item.album.images
    ?.slice()
    .sort((a, b) => b.width - a.width)[0];
  const song = track?.item.name ?? "Landslide";
  const artist =
    track?.item.artists.map((entry) => entry.name).join(", ") ??
    "Fleetwood Mac";
  const href =
    track?.item.external_urls?.spotify ??
    track?.item.uri?.replace(
      "spotify:track:",
      "https://open.spotify.com/track/",
    );

  return (
    <span ref={ref} className="group relative inline-flex align-middle">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-[#333332] px-2 py-1 text-[15px] leading-none font-bold text-[#f1f1ef] transition-colors hover:bg-[#3d3d3c]"
      >
        <SpotifyLogo className="h-5 w-5 text-[#1ed760]" />
        <span className="text-[#a9a9a7]">Spotify</span>
        {loaded ? <span>{song}</span> : <Skeleton className="h-4 w-20" />}
      </a>

      <span className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden w-[360px] rounded-xl bg-[#555] p-4 text-white shadow-2xl group-focus-within:block group-hover:block">
        <span className="flex gap-5">
          <span className="relative block h-[116px] w-[116px] shrink-0 overflow-hidden rounded-lg bg-[#f1f1ef]">
            {image ? (
              <Image
                src={image.url}
                alt={track?.item.album.name ?? song}
                fill
                className="object-cover"
              />
            ) : null}
          </span>
          <span className="flex min-w-0 flex-1 flex-col pt-4">
            <span className="mb-3 flex items-start justify-between gap-4">
              <span className="min-w-0">
                <span className="block truncate text-[20px] font-bold">
                  {song}
                </span>
                <span className="mt-3 block truncate text-[20px] text-[#d4d4d4]">
                  {artist}
                </span>
              </span>
              <SpotifyLogo className="h-8 w-8 shrink-0 text-white" />
            </span>
            <span className="mt-auto flex items-center justify-between">
              <span className="flex items-center gap-3 text-[16px]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-white text-2xl leading-none font-bold">
                  +
                </span>
                Save on Spotify
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#555]">
                <span className="ml-1 h-0 w-0 border-y-[13px] border-l-[18px] border-y-transparent border-l-[#555]" />
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}

function SpotifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.508 17.308a.747.747 0 0 1-1.028.247c-2.817-1.722-6.363-2.111-10.536-1.156a.748.748 0 1 1-.333-1.458c4.568-1.045 8.488-.596 11.65 1.336.352.215.463.677.247 1.031Zm1.47-3.273a.936.936 0 0 1-1.287.308c-3.224-1.982-8.139-2.557-11.95-1.399a.937.937 0 1 1-.545-1.794c4.355-1.322 9.771-.681 13.474 1.596.44.271.578.848.308 1.289Zm.126-3.409C15.237 8.33 8.862 8.118 5.175 9.238a1.125 1.125 0 1 1-.654-2.153c4.233-1.286 11.276-1.037 15.731 1.608a1.125 1.125 0 0 1-1.148 1.933Z" />
    </svg>
  );
}
