import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[36px] items-center rounded-full border px-3 py-1 text-sm transition-all duration-fast",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
