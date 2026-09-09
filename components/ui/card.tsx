import { HTMLAttributes } from "react";

export default function Card({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-5 shadow-[0_1px_3px_rgba(10,37,64,0.06)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
