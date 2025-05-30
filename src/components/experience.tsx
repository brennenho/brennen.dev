import { ScrollAnimation } from "@/components/scroll-animation";
import { Card, CardContent } from "@/components/ui/card";
import experiences from "@/content/experience.json";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Experience() {
  return (
    <ScrollAnimation>
      <Card className="py-2">
        <CardContent className="flex flex-col px-4">
          {Object.entries(experiences).map(([key, data], i, a) => (
            <ScrollAnimation key={key}>
              <Link href={data.link} target="_blank">
                <div
                  className={`flex w-full flex-row items-center gap-2 py-2 ${i !== a.length - 1 ? "border-b-2 border-dashed" : ""}`}
                >
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <Image
                      src={`/img/${key}.png`}
                      alt={data.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex w-full flex-row items-center justify-between">
                    <div className="flex flex-1 flex-col items-start sm:flex-row sm:items-center">
                      <div className="flex w-full flex-row justify-between sm:w-fit">
                        <div className="text-lg font-medium sm:w-48">
                          {data.name}
                        </div>

                        <div className="text-muted-foreground flex flex-row items-center gap-1 text-sm italic sm:hidden">
                          {data.start} <ArrowRight className="h-4 w-4" />{" "}
                          {data.end}
                        </div>
                      </div>

                      <div className="text-muted-foreground text-sm italic">
                        {data.title}
                      </div>
                    </div>

                    <div className="text-muted-foreground hidden flex-row items-center gap-1 text-sm italic sm:flex">
                      {data.start} <ArrowRight className="h-4 w-4" /> {data.end}
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollAnimation>
          ))}
        </CardContent>
      </Card>
    </ScrollAnimation>
  );
}
