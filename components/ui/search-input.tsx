"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSubmit) onSubmit();
          }}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="pl-9 pr-10"
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
            <X className="h-4 w-4" />
          </IconButton>
        ) : null}
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
