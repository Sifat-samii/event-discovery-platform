"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

const container = (stagger: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
    },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function StaggerChildren({
  children,
  className,
  staggerDelay = 0.06,
  once = true,
}: StaggerChildrenProps) {
  return (
    <motion.div
      variants={container(staggerDelay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-40px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
