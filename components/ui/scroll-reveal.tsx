"use client";

import { motion, type Variant } from "framer-motion";
import { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const directionOffset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  scale?: boolean;
  className?: string;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  scale = false,
  className,
  once = true,
}: ScrollRevealProps) {
  const offset = directionOffset[direction];
  const hidden: Variant = {
    opacity: 0,
    x: offset.x,
    y: offset.y,
    ...(scale && { scale: 0.95 }),
  };
  const visible: Variant = {
    opacity: 1,
    x: 0,
    y: 0,
    ...(scale && { scale: 1 }),
  };

  return (
    <motion.div
      initial={hidden}
      whileInView={visible}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
