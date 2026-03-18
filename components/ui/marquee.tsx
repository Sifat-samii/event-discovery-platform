"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  speed?: "slow" | "normal" | "fast";
}

const speedMap = { slow: "60s", normal: "30s", fast: "18s" };

export default function Marquee({
  children,
  reverse = false,
  pauseOnHover = true,
  className,
  speed = "normal",
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden select-none",
        className
      )}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn(
            "flex shrink-0 items-center gap-4",
            reverse ? "animate-marquee-reverse" : "animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
          style={{ animationDuration: speedMap[speed] }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
