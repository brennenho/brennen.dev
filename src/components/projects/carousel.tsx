"use client";

import type { Project } from "@/components/projects/map";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectCard } from "./card";

interface ProjectCarouselProps {
  projects: Project[];
}

export function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateCarouselState = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
    };

    updateCarouselState();
    api.on("select", updateCarouselState);

    window.addEventListener("resize", updateCarouselState);

    return () => {
      window.removeEventListener("resize", updateCarouselState);
    };
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  return (
    <div className="flex w-full flex-col gap-1 lg:hidden">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {Object.entries(projects).map(([key, data]) => {
            return (
              <CarouselItem
                key={key}
                className="basis-full pr-2 pb-2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <ProjectCard {...data} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {count > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              className={`h-2 w-2 cursor-pointer rounded-full transition-colors ${
                index + 1 === current
                  ? "bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
