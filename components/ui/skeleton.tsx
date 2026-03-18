import { cn } from "@/lib/utils";

export default function Skeleton({ className }: { className?: string }) {
<<<<<<< Current (Your changes)
  return <div className={cn("shimmer rounded-lg", className)} />;
=======
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-surface-2/60",
        className
      )}
    />
  );
>>>>>>> Incoming (Background Agent changes)
}
