import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
<<<<<<< Current (Your changes)
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-surface-1/40 px-8 py-14 text-center",
        className
      )}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-surface-2 text-2xl">
        {icon ?? "🔍"}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" size="sm" onClick={onAction}>
=======
    <div className="glass-surface p-10 text-center animate-fade-up">
      {icon ? <div className="mb-4 flex justify-center text-muted-foreground">{icon}</div> : null}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
>>>>>>> Incoming (Background Agent changes)
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
