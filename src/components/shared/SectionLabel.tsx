import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: Props) {
  return (
    <p
      className={cn(
        "text-[10px] font-semibold tracking-[0.12em] uppercase text-text-muted",
        className
      )}
    >
      {children}
    </p>
  );
}
