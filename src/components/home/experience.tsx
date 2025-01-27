import Image from "next/image";
import Link from "next/link";
import { Section } from "~/components";
import experiences from "~/data/experience.json";

export function Experience() {
  return (
    <div className="mb-16 flex h-full w-full flex-col items-center gap-8 md:w-3/4 md:flex-row">
      <Section className="w-full flex-shrink-0 md:w-1/2">
        <div className="flex flex-col gap-3">
          {Object.entries(experiences).map(([key, data], i, a) => (
            <Link href={data.link} key={key} target="_blank">
              <div
                className={`flex w-full flex-row gap-2 ${i !== a.length - 1 ? "border-b border-dashed pb-3" : ""}`}
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-full border bg-white">
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
                    <div className="text-xs opacity-50">{data.duration}</div>
                  </div>
                  <div className="text-xs opacity-70">{data.title}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <div className="flex flex-1 justify-center p-4 text-center text-lg md:text-left">
        <div>
          <p>
            I am currently building pro-bono software for local non-profits as a
            developer at <span className="italic">Code The Change</span>.
            Additionally, I am serving as the Director of Finance for Makers @
            USC, managing a $15,000+ budget.
            <br />
            <br />
            Previously, I've interned at{" "}
            <span className="italic">Chipstack AI</span>, a startup innovating
            at the intersection of Large Language Models and hardware
            semi-conductors. I am experienced shipping high-quality, robust
            software in dynamic environments.
          </p>
        </div>
      </div>
    </div>
  );
}
