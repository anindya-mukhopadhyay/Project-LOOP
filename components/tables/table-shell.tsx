import { cn } from "@/lib/utils";

type TableShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function TableShell({ children, className }: TableShellProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card shadow-panel", className)}>
      {children}
    </div>
  );
}
