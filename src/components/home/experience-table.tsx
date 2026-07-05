"use client";

import { Table, type TableColumn } from "@/components/blocks";
import experiences from "@/content/experience.json";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Plus,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type Experience = (typeof experiences)[keyof typeof experiences];
type ExperienceRow = Experience & {
  id: string;
};

const experienceRows = Object.entries(experiences).map(([id, data]) => ({
  id,
  ...data,
}));

const experienceColumns = [
  {
    id: "company",
    label: "Company",
    icon: Briefcase,
    headerClassName: "w-[210px]",
    render: (data) => (
      <a
        className="inline-flex items-center gap-2 rounded-sm focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
        href={data.link}
        rel="noreferrer"
        target="_blank"
      >
        <span
          className={`relative h-6 w-6 shrink-0 overflow-hidden rounded-sm ${
            "transparent" in data && data.transparent ? "bg-white" : ""
          }`}
        >
          <Image
            alt=""
            className="object-contain"
            fill
            src={`/img/${data.id}.png`}
          />
        </span>
        <span>{data.name.toLowerCase()}</span>
      </a>
    ),
  },
  {
    id: "role",
    label: "Role",
    icon: UserRound,
    render: (data) => data.title.toLowerCase(),
  },
  {
    id: "date",
    label: "Date",
    icon: CalendarDays,
    headerClassName: "w-[220px]",
    render: (data) => (
      <span className="inline-flex items-center gap-2">
        {data.start}
        <ArrowRight className="h-4 w-4" />
        {data.end}
      </span>
    ),
  },
  {
    id: "more",
    label: "...",
    icon: Plus,
    headerClassName: "w-[90px]",
    render: () => null,
  },
] satisfies TableColumn<ExperienceRow>[];

export function ExperienceTable() {
  const showActionToast = () => {
    toast("Want to define my next chapter?", {
      action: {
        label: "LinkedIn",
        onClick: () => {
          window.open(
            "https://www.linkedin.com/in/brennenho/",
            "_blank",
            "noopener,noreferrer",
          );
        },
      },
    });
  };

  return (
    <Table
      columns={experienceColumns}
      getRowKey={(data) => data.id}
      newButtonAction={{
        ariaLabel: "Show action toast",
        onClick: showActionToast,
      }}
      newPageAction={{
        ariaLabel: "Show action toast",
        onClick: showActionToast,
      }}
      rows={experienceRows}
    />
  );
}
