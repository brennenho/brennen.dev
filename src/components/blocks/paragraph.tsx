import type { ReactNode } from "react";

const bodyTextClassName =
  "text-[16px] leading-[1.5] font-medium text-[#f1f1ef]";

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className={bodyTextClassName}>{children}</p>;
}
