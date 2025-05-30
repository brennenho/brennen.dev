import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface ProjectCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

export function ProjectCard({
  icon,
  title,
  description,
  link,
}: ProjectCardProps) {
  return (
    <Link href={link} target="_blank">
      <Card className="w-full p-4 transition-all duration-300 lg:w-64 lg:hover:-translate-y-1 lg:hover:scale-105 lg:hover:-rotate-2">
        <CardContent className="flex flex-col items-center gap-2 p-0">
          <div className="bg-primary/20 text-primary flex aspect-square h-10 w-10 flex-col items-center justify-center rounded-full">
            {icon}
          </div>
          <div className="flex w-full flex-col leading-none">
            <div className="w-full text-center text-xl font-semibold">
              {title}
            </div>
            <div className="text-muted-foreground w-full text-center text-sm">
              {description}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
