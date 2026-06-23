import { CalendarDays, MapPin, Trophy, UserRound } from "lucide-react";

import {
  NotionTable,
  type NotionTableColumn,
} from "@/components/notion/notion-table";

type LeaderboardRow = {
  id: string;
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
    render: (row) => row.location,
  },
] satisfies NotionTableColumn<LeaderboardRow>[];

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <NotionTable
      columns={leaderboardColumns}
      getRowKey={(row) => row.id}
      emptyState="No scores yet"
      minWidthClassName="min-w-[720px]"
      newButtonLabel={null}
      newPageLabel={null}
      rows={rows}
    />
  );
}
