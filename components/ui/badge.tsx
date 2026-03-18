import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary/12 text-primary border border-primary/22",
        secondary:
          "bg-surface-3 text-foreground border border-border/60",
        destructive:
          "bg-danger/12 text-danger border border-danger/22",
        outline:
          "border border-border/70 text-muted-foreground",
        success:
          "bg-success/12 text-success border border-success/22",
        warning:
          "bg-warning/12 text-warning border border-warning/22",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
