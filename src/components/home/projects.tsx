"use client";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";
import projects from "~/data/projects.json";

import Link from "next/link";
import { Icons } from "~/components/icons";
import { AnimationWrapper } from "~/components/site";
import {
  Card,
  CardContent,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui";

type IconName = keyof typeof Icons;

export function Projects() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  );

  return (
    <AnimationWrapper className="flex justify-center">
      <div className="w-3/4">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {Object.entries(projects).map(([key, data]) => {
              const CustomIcon = Icons[data.icon as IconName] ?? Icons.img;
              return (
                <CarouselItem key={key} className="md:basis-1/2 lg:basis-1/3">
                  <Link href={data.link} target="_blank">
                    <div className="p-1">
                      <Card className="transition-all duration-300 hover:border-foreground/50 hover:shadow-lg">
                        <CardContent className="flex p-6">
                          <div className="flex w-full flex-col items-center gap-6 py-4 text-center">
                            <div className="flex aspect-square h-20 w-20 items-center justify-center rounded-full bg-muted pl-1 text-primary">
                              <CustomIcon className="h-9 w-9" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="text-2xl font-semibold">
                                {data.name}
                              </div>
                              <div className="text-sm opacity-70">
                                {data.description}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="lg:hidden" />
          <CarouselNext className="lg:hidden" />
        </Carousel>
      </div>
    </AnimationWrapper>
  );
}
