"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import IconButton from "@/components/ui/icon-button";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search events, venues, organizers...",
  disabled,
  loading,
  error,
  className,
}: SearchInputProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSubmit) onSubmit();
          }}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={cn(
            "flex h-10 w-full rounded-xl border border-border/30 bg-surface-2/50 pl-10 pr-10 text-sm text-foreground backdrop-blur-sm",
            "transition-all duration-base ease-spring",
            "placeholder:text-muted-foreground/50",
            "hover:border-border/50 hover:bg-surface-2/70",
            "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 focus:bg-surface-1/80",
            "disabled:cursor-not-allowed disabled:opacity-40"
          )}
          aria-invalid={Boolean(error)}
        />
        {value ? (
          <IconButton
            type="button"
            onClick={() => onChange("")}
            disabled={disabled || loading}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </IconButton>
        ) : null}
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
