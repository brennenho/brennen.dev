import { CalendarDays, MapPin, Trophy, UserRound } from "lucide-react";

import { Table, type TableColumn } from "@/components/blocks";

type LeaderboardRow = {
  id: string;
  countryFlag?: string;
  isCurrentPlayer?: boolean;
  name: string;
  score: number;
  date: string;
  location: string;
};

export type { LeaderboardRow };

const leaderboardColumns = [
  {
    id: "name",
    label: "Name",
    icon: UserRound,
    headerClassName: "w-[230px]",
    render: (row) => row.name,
  },
  {
    id: "score",
    label: "Score",
    icon: Trophy,
    headerClassName: "w-[140px]",
    render: (row) => row.score.toLocaleString(),
  },
  {
    id: "date",
    label: "Date",
    icon: CalendarDays,
    headerClassName: "w-[190px]",
    render: (row) => row.date,
  },
  {
    id: "location",
    label: "Location",
    icon: MapPin,
    render: (row) => (
      <span className="flex items-center gap-2">
        {row.countryFlag ? (
          <span
            aria-label={`${row.location} flag`}
            className="text-[15px] leading-none"
            title={row.location}
          >
            {row.countryFlag}
          </span>
        ) : null}
        <span>{row.location}</span>
      </span>
    ),
  },
] satisfies TableColumn<LeaderboardRow>[];

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <Table
      columns={leaderboardColumns}
      getRowKey={(row) => row.id}
      emptyState="No scores yet"
      minWidthClassName="min-w-[720px]"
      newButtonLabel={null}
      newPageLabel={null}
      rowClassName={(row) =>
        row.isCurrentPlayer
          ? "bg-[#edf3ec] shadow-[inset_3px_0_0_#448361] hover:bg-[#e3ede1] dark:bg-[#25382f] dark:shadow-[inset_3px_0_0_#4EC38A] dark:hover:bg-[#2d4438]"
          : undefined
      }
      rows={rows}
    />
  );
}
