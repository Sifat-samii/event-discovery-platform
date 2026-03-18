"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const container = {
  hidden: {},
  show: (delay: number) => ({
    transition: { staggerChildren: 0.10, delayChildren: delay },
  }),
};

const childItem = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.50, type: "tween" },
  },
} as const;

export function AnimatedGrid({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      variants={container}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={childItem}>
      {children}
    </motion.div>
  );
}

export function FadeUp({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.50, delay, type: "tween" }}
    >
      {children}
    </motion.div>
  );
}
