"use client";

import { cn } from "@/lib/utils";

interface TagListProps {
  tags: string[];
  className?: string;
}

export default function TagList({ tags, className }: TagListProps) {
  if (!tags.length) return null;
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1", className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="shrink-0 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
