"use client";

import dockApps from "@/content/dock.json";
import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type DockApp = {
  id: string;
  name: string;
  href?: string;
  image: string;
  running?: boolean;
};

type MousePosition = {
  x: number;
  y: number;
};

const apps = dockApps as DockApp[];
const MAX_BUTTON_SIZE = 64;
const MIN_BUTTON_SIZE = 18;
const DEFAULT_INITIAL_WIDTH = 360;
const NEIGHBOR_SCALE_FACTORS = [1, 0.44, 0.12];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getResponsiveButtonSize(availableWidth: number) {
  const estimatedPadding = 8;
  const preliminarySize = clamp(
    Math.floor((availableWidth - estimatedPadding) / apps.length),
    MIN_BUTTON_SIZE,
    MAX_BUTTON_SIZE,
  );
  const padding = clamp(Math.round(preliminarySize * 0.1), 3, 6);
  const fittingSize = Math.floor((availableWidth - padding * 2) / apps.length);

  return clamp(fittingSize, MIN_BUTTON_SIZE, MAX_BUTTON_SIZE);
}

function DockIcon({ app }: { app: DockApp }) {
  return (
    <Image
      alt=""
      className="object-contain"
      draggable={false}
      fill
      sizes="80px"
      src={app.image}
    />
  );
}

function useElementRect<TElement extends HTMLElement>() {
  const ref = useRef<TElement>(null);
  const [rect, setRect] = useState<DOMRect>();

  const updateRect = useCallback(() => {
    const nextRect = ref.current?.getBoundingClientRect();
    if (nextRect) setRect(nextRect);
  }, []);

  useEffect(() => {
    updateRect();

    const element = ref.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateRect)
        : null;
    if (element) resizeObserver?.observe(element);
    window.addEventListener("resize", updateRect);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateRect);
    };
  }, [updateRect]);

  return { rect, ref, updateRect };
}

function DockItem({
  app,
  baseButtonSize,
  hoveredIndex,
  index,
  maxDistance,
  maxScale,
  mousePosition,
  setHoveredIndex,
}: {
  app: DockApp;
  baseButtonSize: number;
  hoveredIndex: number | null;
  index: number;
  maxDistance: number;
  maxScale: number;
  mousePosition: MousePosition | null;
  setHoveredIndex: (index: number) => void;
}) {
  const { rect, ref, updateRect } = useElementRect<HTMLLIElement>();

  const iconStyle = useMemo(() => {
    const centerX = rect ? rect.left + rect.width / 2 : 0;
    const distance =
      rect && mousePosition ? Math.abs(mousePosition.x - centerX) : maxDistance;
    const pointerProgress =
      rect && mousePosition ? Math.max(0, 1 - distance / maxDistance) : 0;
    const pointerScale = 1 + Math.pow(pointerProgress, 2.2) * (maxScale - 1);

    const fallbackScale =
      hoveredIndex === null
        ? 1
        : 1 +
          (maxScale - 1) *
            (NEIGHBOR_SCALE_FACTORS[Math.abs(index - hoveredIndex)] ?? 0);
    const scale = Math.max(pointerScale, fallbackScale);

    return {
      transform: `translateY(${-(scale - 1) * baseButtonSize * 0.18}px) scale(${scale})`,
      transition: "transform 190ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      zIndex: Math.round(scale * 100),
    } satisfies CSSProperties;
  }, [
    baseButtonSize,
    hoveredIndex,
    index,
    maxDistance,
    maxScale,
    mousePosition,
    rect,
  ]);

  const itemStyle = {
    height: `${baseButtonSize}px`,
    width: `${baseButtonSize}px`,
  } satisfies CSSProperties;
  const itemClassName =
    "group/dock relative flex h-full w-full origin-bottom cursor-default items-center justify-center border-0 bg-transparent p-0 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none";
  const itemContent = (
    <>
      <span className="pointer-events-none absolute top-[-2.18rem] left-1/2 hidden -translate-x-1/2 items-center justify-center rounded-[6px] border border-white/10 bg-[#2f2f2f]/72 px-2 py-1 text-[11px] leading-none font-medium whitespace-nowrap text-[#f4f4f3] opacity-0 shadow-[0_8px_18px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-[opacity,transform] duration-150 ease-out group-hover/dock:-translate-y-0.5 group-hover/dock:opacity-100 group-focus-visible/dock:-translate-y-0.5 group-focus-visible/dock:opacity-100 min-[700px]:flex">
        {app.name}
        <span className="absolute bottom-[-4px] h-[7px] w-[7px] rotate-45 border-r border-b border-white/10 bg-[#2f2f2f]/72" />
      </span>
      <span className="relative block h-full w-full transition-[filter] duration-150 ease-out group-hover/dock:drop-shadow-[0_7px_9px_rgba(0,0,0,0.2)] group-focus-visible/dock:drop-shadow-[0_7px_9px_rgba(0,0,0,0.2)]">
        <DockIcon app={app} />
      </span>
      {app.running ? (
        <span
          className="absolute left-1/2 -translate-x-1/2 translate-y-full rounded-full bg-white/70"
          style={{
            bottom: `${baseButtonSize * 0.015}px`,
            height: `${baseButtonSize * 0.075}px`,
            width: `${baseButtonSize * 0.075}px`,
          }}
        />
      ) : null}
    </>
  );

  const interactiveProps = {
    "aria-label": app.name,
    className: itemClassName,
    onFocus: updateRect,
    onMouseEnter: () => {
      updateRect();
      setHoveredIndex(index);
    },
    onPointerEnter: () => {
      updateRect();
      setHoveredIndex(index);
    },
    style: { ...iconStyle, cursor: "default" },
  };

  return (
    <li
      ref={ref}
      className="relative flex shrink-0 items-center justify-center"
      style={itemStyle}
    >
      {app.href ? (
        <Link
          {...interactiveProps}
          href={app.href}
          rel="noreferrer"
          target="_blank"
        >
          {itemContent}
        </Link>
      ) : (
        <span {...interactiveProps}>{itemContent}</span>
      )}
    </li>
  );
}

export function MacDock() {
  const { rect, ref, updateRect } = useElementRect<HTMLDivElement>();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(
    null,
  );

  const baseButtonSize = useMemo(() => {
    const availableWidth = rect?.width ?? DEFAULT_INITIAL_WIDTH;

    return getResponsiveButtonSize(availableWidth);
  }, [rect]);
  const dockPadding = clamp(Math.round(baseButtonSize * 0.1), 3, 6);
  const dockHeight = baseButtonSize + dockPadding * 2;
  const dockRadius = clamp(baseButtonSize * 0.22, 8, 18);
  const maxScale = baseButtonSize < 44 ? 1.045 : 1.08;
  const maxDistance = baseButtonSize * 2.2;

  function handlePointerMove(
    event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement>,
  ) {
    updateRect();
    setMousePosition({
      x: event.clientX || 0,
      y: event.clientY || 0,
    });
  }

  return (
    <div ref={ref} className="w-full max-w-full overflow-visible pt-5 pb-3">
      <nav
        aria-label="Mac dock"
        className="mx-auto flex w-fit max-w-full justify-center shadow-[0_0_0.1rem_rgba(0,0,0,0.8)]"
        onPointerLeave={() => {
          setHoveredIndex(null);
          setMousePosition(null);
        }}
        onMouseLeave={() => {
          setHoveredIndex(null);
          setMousePosition(null);
        }}
        onMouseMove={handlePointerMove}
        onPointerMove={handlePointerMove}
        style={{
          borderRadius: `${dockRadius}px`,
          height: `${dockHeight}px`,
        }}
      >
        <ul
          className="flex h-full list-none items-end gap-0 border border-white/18 bg-[rgba(83,83,83,0.25)] backdrop-blur-[1.8rem]"
          style={{
            borderRadius: `${dockRadius}px`,
            padding: `${dockPadding}px`,
          }}
        >
          {apps.map((app, index) => (
            <DockItem
              app={app}
              baseButtonSize={baseButtonSize}
              hoveredIndex={hoveredIndex}
              index={index}
              key={app.name}
              maxDistance={maxDistance}
              maxScale={maxScale}
              mousePosition={mousePosition}
              setHoveredIndex={setHoveredIndex}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}
