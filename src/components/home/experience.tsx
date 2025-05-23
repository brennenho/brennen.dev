import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui";
import experiences from "~/data/experience.json";
import { AnimationWrapper } from "../site";

export function Experience() {
  return (
    <AnimationWrapper className="contents justify-center md:flex">
      <div className="flex h-full w-full flex-col items-center gap-8 md:w-3/4 md:flex-row">
        <AnimationWrapper className="md:contents">
          <Card className="w-full flex-shrink-0 md:w-1/2">
            <CardContent className="flex flex-col gap-3">
              {Object.entries(experiences).map(([key, data], i, a) => (
                <Link href={data.link} key={key} target="_blank">
                  <div
                    className={`flex w-full flex-row items-center gap-2 ${i !== a.length - 1 ? "border-b border-dashed pb-3" : ""}`}
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border bg-white md:h-10 md:w-10">
                      <Image
                        src={`/img/${key}.png`}
                        alt={data.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex w-full justify-between">
                        <div className="font-heading text-sm font-semibold">
                          {data.name}
                        </div>
                        <div className="text-xs opacity-50">
                          {data.duration}
                        </div>
                      </div>
                      <div className="text-xs opacity-70">{data.title}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </AnimationWrapper>
        <AnimationWrapper className="md:contents">
          <div className="flex flex-1 justify-center p-4 text-center text-sm md:text-left md:text-lg">
            <div>
              <p>
                I am currently building pro-bono software for local non-profits
                as a developer at{" "}
                <span className="italic">Code The Change</span>. Additionally, I
                am serving as the Director of Finance for Makers @ USC, managing
                a $15,000+ budget.
                <br />
                <br />
                Previously, I've interned at{" "}
                <span className="italic">Chipstack AI</span>, a startup
                innovating at the intersection of Large Language Models and
                hardware semi-conductors. I am experienced shipping
                high-quality, robust software in dynamic environments.
              </p>
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </AnimationWrapper>
  );
}
