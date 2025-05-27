import { Card, CardContent } from "@/components/ui/card";
import experiences from "@/data/experience.json";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Experience() {
  return (
    <Card className="py-2">
      <CardContent className="flex flex-col px-4">
        {Object.entries(experiences).map(([key, data], i, a) => (
          <Link href={data.link} key={key} target="_blank">
            <div
              className={`flex w-full flex-row items-center gap-2 py-2 ${i !== a.length - 1 ? "border-b-2 border-dashed" : ""}`}
            >
              <div className="relative h-8 w-8 overflow-hidden md:h-10 md:w-10">
                <Image
                  src={`/img/${key}.png`}
                  alt={data.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex w-full flex-row items-center justify-between">
                <div className="flex flex-row items-center">
                  <div className="w-48 text-lg font-medium">{data.name}</div>
                  <div className="text-muted-foreground text-sm italic">
                    {data.title}
                  </div>
                </div>
                <div className="text-muted-foreground flex flex-row items-center gap-1 text-sm italic">
                  {data.start} <ArrowRight className="h-4 w-4" /> {data.end}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
