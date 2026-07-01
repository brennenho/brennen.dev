import type { ReactNode } from "react";

export function PageIcon({ children }: { children: ReactNode }) {
  return (
    <div className="text-[72px] leading-none sm:text-[78px]">{children}</div>
  );
}
