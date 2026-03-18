import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 select-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,138,0,0.25)]",
        destructive:
          "bg-danger/12 text-danger border border-danger/25 hover:bg-danger/20",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-2 hover:border-border/80",
        secondary:
          "bg-surface-2 text-foreground border border-border/50 hover:bg-surface-3",
        ghost:
          "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
        glow: "bg-primary text-primary-foreground shadow-[0_0_24px_rgba(255,138,0,0.35)] hover:shadow-[0_0_36px_rgba(255,138,0,0.5)] hover:bg-primary/90",
      },
      size: {
        default: "h-10 px-4 py-2 gap-2",
        sm: "h-8 rounded-md px-3 py-1.5 text-xs gap-1.5",
        lg: "h-12 px-6 py-3 text-base gap-2",
        xl: "h-14 px-8 py-4 text-base gap-2 rounded-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
