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
<<<<<<< Current (Your changes)
        "inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 select-none whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(255,138,0,0.3)]"
          : "border border-border/60 bg-surface-2/70 text-muted-foreground hover:border-primary/30 hover:bg-surface-3 hover:text-foreground",
        className
=======
        "inline-flex min-h-[36px] items-center rounded-full px-4 py-1.5 text-[13px] font-medium tracking-tight transition-all duration-base ease-spring active:scale-95",
        active
          ? "bg-primary/15 text-primary border border-primary/25 shadow-xs"
          : "bg-surface-2/60 text-muted-foreground border border-border/30 hover:bg-surface-3/60 hover:text-foreground hover:border-border/50"
>>>>>>> Incoming (Background Agent changes)
      )}
    >
      {label}
    </button>
  );
}
