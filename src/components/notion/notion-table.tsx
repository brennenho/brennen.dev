import { Plus, Table2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { HTMLAttributeAnchorTarget, Key, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type NotionTableColumn<Row> = {
  id: string;
  label: ReactNode;
  icon?: LucideIcon;
  headerClassName?: string;
  cellClassName?: string | ((row: Row, index: number) => string | undefined);
  render: (row: Row) => ReactNode;
};

export type NotionTableRowLink = {
  href: string;
  ariaLabel: string;
  className?: string;
  rel?: string;
  target?: HTMLAttributeAnchorTarget;
};

export type NotionTableProps<Row> = {
  columns: NotionTableColumn<Row>[];
  rows: Row[];
  getRowKey: (row: Row, index: number) => Key;
  className?: string;
  emptyState?: ReactNode;
  getRowLink?: (row: Row, index: number) => NotionTableRowLink | undefined;
  minWidthClassName?: string;
  newButtonLabel?: ReactNode;
  newButtonLink?: NotionTableRowLink;
  newPageLabel?: ReactNode;
  newPageLink?: NotionTableRowLink;
  rowClassName?: string | ((row: Row, index: number) => string | undefined);
  tableClassName?: string;
  viewLabel?: ReactNode;
};

export function NotionTable<Row>({
  columns,
  rows,
  getRowKey,
  className,
  emptyState,
  getRowLink,
  minWidthClassName = "min-w-[760px]",
  newButtonLabel = "New",
  newButtonLink,
  newPageLabel = "New page",
  newPageLink,
  rowClassName,
  tableClassName,
  viewLabel = "Table",
}: NotionTableProps<Row>) {
  const hasToolbar = viewLabel != null || newButtonLabel != null;

  return (
    <div className={cn("text-[14px] leading-normal text-[#d4d4d1]", className)}>
      {hasToolbar ? (
        <div className="mb-3 flex items-center justify-between">
          {viewLabel != null ? (
            <button
              className="inline-flex h-8 items-center gap-2 rounded-full bg-[#30302f] px-4 text-[14px] font-semibold text-[#f1f1ef]"
              type="button"
            >
              <Table2 className="h-4 w-4" />
              {viewLabel}
            </button>
          ) : (
            <span />
          )}
          {newButtonLabel != null ? (
            newButtonLink ? (
              <Link
                aria-label={newButtonLink.ariaLabel}
                className={cn(
                  "inline-flex h-7 w-[70px] items-center justify-center rounded-sm bg-[#2883DF] text-[14px] font-medium text-white focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none",
                  newButtonLink.className,
                )}
                href={newButtonLink.href}
                rel={newButtonLink.rel}
                target={newButtonLink.target}
              >
                {newButtonLabel}
              </Link>
            ) : (
              <button
                className="h-7 w-[70px] rounded-sm bg-[#2883DF] text-[14px] font-medium text-white focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                type="button"
              >
                {newButtonLabel}
              </button>
            )
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full border-collapse font-medium",
            minWidthClassName,
            tableClassName,
          )}
        >
          <thead>
            <tr className="border-b border-[#30302f] text-left text-[14px] text-[#a7a7a4]">
              {columns.map((column, index) => {
                const Icon = column.icon;

                return (
                  <th
                    className={cn(
                      index > 0 && "border-l border-[#30302f]",
                      "px-2 py-1.5",
                      column.headerClassName,
                    )}
                    key={column.id}
                  >
                    <span className="flex items-center gap-2">
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      {column.label}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0
              ? rows.map((row, index) => {
                  const rowLink = getRowLink?.(row, index);
                  const resolvedRowClassName =
                    typeof rowClassName === "function"
                      ? rowClassName(row, index)
                      : rowClassName;

                  return (
                    <tr
                      className={cn(
                        "relative border-b border-[#30302f] text-[#f1f1ef] hover:bg-[#242423]",
                        resolvedRowClassName,
                      )}
                      key={getRowKey(row, index)}
                    >
                      {columns.map((column, columnIndex) => (
                        <td
                          className={cn(
                            columnIndex > 0 && "border-l border-[#30302f]",
                            "px-2 py-1.5",
                            typeof column.cellClassName === "function"
                              ? column.cellClassName(row, index)
                              : column.cellClassName,
                          )}
                          key={column.id}
                        >
                          {columnIndex === 0 && rowLink ? (
                            <Link
                              aria-label={rowLink.ariaLabel}
                              className={cn(
                                "absolute inset-y-0 right-0 left-0 z-10 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none",
                                rowLink.className,
                              )}
                              href={rowLink.href}
                              rel={rowLink.rel}
                              target={rowLink.target}
                            />
                          ) : null}
                          {column.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              : null}
            {rows.length === 0 && emptyState != null ? (
              <tr>
                <td
                  className="px-2 py-2.5 text-[14px] font-medium text-[#81817e]"
                  colSpan={columns.length}
                >
                  {emptyState}
                </td>
              </tr>
            ) : null}
            {newPageLabel != null ? (
              <tr>
                <td
                  className="px-2 py-2.5 text-[14px] font-medium text-[#81817e]"
                  colSpan={columns.length}
                >
                  {newPageLink ? (
                    <Link
                      aria-label={newPageLink.ariaLabel}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-sm focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none",
                        newPageLink.className,
                      )}
                      href={newPageLink.href}
                      rel={newPageLink.rel}
                      target={newPageLink.target}
                    >
                      <Plus className="h-4 w-4" />
                      {newPageLabel}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {newPageLabel}
                    </span>
                  )}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
