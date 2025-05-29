"use client";

import { PeaceIcon, PostItIcon, ShipIt, VectorIcon } from "@/components/icons";
import { ProjectCard } from "@/components/projects/card";
import { ProjectCarousel } from "@/components/projects/carousel";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mic } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface Project {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

type ParsedLine = {
  viewBox: string;
  width: string;
  height: string;
  d: string;
  stroke: string;
  strokeWidth: string;
  strokeDasharray: string;
  className: string;
};

export function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const linePhase = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);
  const cardOpacity = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);

  const projects: Project[] = [
    {
      icon: <VectorIcon className="h-4 w-4 pl-[1px]" />,
      title: "Vector",
      description: "AI co-pilot for instant in-app support",
      link: "https://usevector.app",
    },
    {
      icon: <Mic className="h-5 w-5" />,
      title: "Delphi",
      description: "Voice-driven browsing for the visually impaired",
      link: "https://github.com/brennenho/delphi",
    },
    {
      icon: <PostItIcon className="h-5 w-5 pt-[1px] pl-0.5" />,
      title: "Post-It",
      description: "An extensible pretraining framework for ML training",
      link: "https://github.com/brennenho/post-it",
    },
    {
      icon: <PeaceIcon className="h-5 w-5 pl-0.5" />,
      title: "Conquest",
      description:
        "A Chrome extension to help USC students with course registration",
      link: "https://github.com/brennenho/conquest",
    },
  ];

  const connectionLines = [
    {
      svg: `<svg width="146" height="231" viewBox="0 0 146 231" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M144.5 0V160.5H1.5V231" stroke="#059669" stroke-width="3" stroke-dasharray="6 6"></path>
      </svg>`,
      className: "absolute flex-shrink-0 left-[303px] top-[170px]",
    },
    {
      svg: `<svg width="298" height="99" viewBox="0 0 298 99" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M298 1.5H1.5V99" stroke="#059669" stroke-width="3" stroke-dasharray="6 6"></path>
      </svg>`,
      className: "absolute flex-shrink-0 left-[125px] top-[87px]",
    },
    {
      svg: `<svg width="114" height="207" viewBox="0 0 114 207" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 0V89H112.5V206.5" stroke="#059669" stroke-width="3" stroke-dasharray="6 6"></path>
      </svg>`,
      className: "absolute flex-shrink-0 left-[579px] top-[171px]",
    },
    {
      svg: `<svg width="148" height="3" viewBox="0 0 148 3" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.5 1.5H147.5" stroke="#059669" stroke-width="3" stroke-dasharray="6 6"></path>
      </svg>`,
      className: "absolute flex-shrink-0 left-[623px] top-[114px]",
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const parsed = connectionLines
      .map(({ svg, className }) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, "image/svg+xml");
        const svgElement = doc.querySelector("svg");
        const pathElement = doc.querySelector("path");

        if (!svgElement || !pathElement) return null;

        return {
          viewBox: svgElement.getAttribute("viewBox") || "0 0 100 100",
          width: svgElement.getAttribute("width") || "100",
          height: svgElement.getAttribute("height") || "100",
          d: pathElement.getAttribute("d") || "",
          stroke: pathElement.getAttribute("stroke") || "#000",
          strokeWidth: pathElement.getAttribute("stroke-width") || "1",
          strokeDasharray:
            pathElement.getAttribute("stroke-dasharray") || "none",
          className,
        };
      })
      .filter((line): line is ParsedLine => line !== null);

    setParsedLines(parsed);
  }, []);

  return (
    <>
      <motion.div
        ref={containerRef}
        className="relative hidden w-full flex-col items-center lg:flex"
      >
        <div className="relative h-[555px] w-[1030px] max-md:flex max-md:h-auto max-md:w-full max-md:flex-col max-md:items-center max-md:gap-5">
          <Link href="https://github.com/brennenho" target="_blank">
            <div className="absolute top-[32px] left-[424px] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:-rotate-2">
              <ShipIt />
            </div>
          </Link>

          {parsedLines.map((line, i) => (
            <motion.svg
              key={i}
              className={line.className}
              viewBox={line.viewBox}
              width={line.width}
              height={line.height}
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: "visible" }}
            >
              <motion.path
                style={{ pathLength: linePhase }}
                d={line.d}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                strokeDasharray={line.strokeDasharray}
                fill="none"
              />
            </motion.svg>
          ))}

          <div className="relative">
            {projects.map((proj, idx) => (
              <motion.div
                key={idx}
                className={`absolute ${getProjectPosition(idx)}`}
                style={{ opacity: cardOpacity }}
              >
                <ProjectCard {...proj} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <ProjectCarousel projects={projects} />
    </>
  );
}

function getProjectPosition(index: number): string {
  const positions = [
    "left-[0px] top-[184px]",
    "left-[180px] top-[401px]",
    "left-[565px] top-[378px]",
    "left-[770px] top-[41px]",
  ];
  return positions[index] ?? "";
}
