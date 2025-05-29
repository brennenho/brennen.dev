import { PeaceIcon, PostItIcon, ShipIt, VectorIcon } from "@/components/icons";
import { ProjectCard } from "@/components/projects/card";
import { Mic } from "lucide-react";
import { ProjectCarousel } from "./carousel";

interface ConnectionLineProps {
  svg: string;
  className?: string;
}

function ConnectionLine({ svg, className }: ConnectionLineProps) {
  return (
    <div className={className}>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

export interface Project {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

export function Projects() {
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

  return (
    <>
      <div className="relative hidden w-full flex-col items-center lg:flex">
        <div className="relative h-[555px] w-[1030px] max-md:flex max-md:h-auto max-md:w-full max-md:flex-col max-md:items-center max-md:gap-5">
          <div className="absolute top-[32px] left-[424px]">
            <ShipIt />
          </div>

          <div className="relative">
            {projects.map((project, index) => (
              <div
                key={index}
                className={`absolute ${getProjectPosition(index)}`}
              >
                <ProjectCard {...project} />
              </div>
            ))}
          </div>

          {connectionLines.map((line, index) => (
            <ConnectionLine key={index} {...line} />
          ))}
        </div>
      </div>

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
  return positions[index] || "";
}
