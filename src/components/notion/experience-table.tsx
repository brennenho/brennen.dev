import experiences from "@/content/experience.json";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Plus,
  Table2,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ExperienceTable() {
  return (
    <div className="text-[14px] leading-normal text-[#d4d4d1]">
      <div className="mb-3 flex items-center justify-between">
        <button className="inline-flex h-8 items-center gap-2 rounded-full bg-[#30302f] px-4 text-[14px] font-semibold text-[#f1f1ef]">
          <Table2 className="h-4 w-4" />
          Table
        </button>
        <button className="h-7 w-[70px] rounded-sm bg-[#2883DF] text-[14px] font-medium text-white">
          New
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse font-medium">
          <thead>
            <tr className="border-b border-[#30302f] text-left text-[14px] text-[#a7a7a4]">
              <th className="w-[210px] px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Company
                </span>
              </th>
              <th className="border-l border-[#30302f] px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  Role
                </span>
              </th>
              <th className="w-[220px] border-l border-[#30302f] px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Date
                </span>
              </th>
              <th className="w-[90px] border-l border-[#30302f] px-2 py-1.5">
                <span className="flex items-center gap-4">
                  <Plus className="h-4 w-4" />
                  ...
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(experiences).map(([key, data]) => (
              <tr
                key={key}
                className="relative border-b border-[#30302f] text-[#f1f1ef] hover:bg-[#242423]"
              >
                <td className="px-2 py-1.5">
                  <Link
                    aria-label={`${data.name} website`}
                    className="absolute inset-y-0 left-0 right-[90px] z-10 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                    href={data.link}
                    rel="noreferrer"
                    target="_blank"
                  />
                  <span className="relative z-0 flex items-center gap-2">
                    <span
                      className={`relative h-6 w-6 shrink-0 overflow-hidden rounded-sm ${
                        "transparent" in data && data.transparent
                          ? "bg-white"
                          : ""
                      }`}
                    >
                      <Image
                        alt=""
                        className="object-contain"
                        fill
                        src={`/img/${key}.png`}
                      />
                    </span>
                    <span>{data.name.toLowerCase()}</span>
                  </span>
                </td>
                <td className="border-l border-[#30302f] px-2 py-1.5">
                  {data.title.toLowerCase()}
                </td>
                <td className="border-l border-[#30302f] px-2 py-1.5">
                  <span className="inline-flex items-center gap-2">
                    {data.start}
                    <ArrowRight className="h-4 w-4" />
                    {data.end}
                  </span>
                </td>
                <td className="border-l border-[#30302f] px-2 py-1.5" />
              </tr>
            ))}
            <tr>
              <td
                className="px-2 py-2.5 text-[14px] font-medium text-[#81817e]"
                colSpan={4}
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New page
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
