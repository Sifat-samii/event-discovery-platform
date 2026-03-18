import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Chip({ label, active = false, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 select-none whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(255,138,0,0.3)]"
          : "border border-border/60 bg-surface-2/70 text-muted-foreground hover:border-primary/30 hover:bg-surface-3 hover:text-foreground",
        className
      )}
    >
      {label}
    </button>
  );
}
