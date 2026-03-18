"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glareEnabled?: boolean;
  tiltDeg?: number;
}

export default function TiltCard({
  children,
  className,
  glareEnabled = true,
  tiltDeg = 8,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("rotateX(0) rotateY(0)");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * tiltDeg;
    const rotateY = (x - 0.5) * tiltDeg;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`);
    setGlare({ x: x * 100, y: y * 100, opacity: 0.12 });
  }

  function handleLeave() {
    setTransform("perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)");
    setGlare({ x: 50, y: 50, opacity: 0 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn("relative overflow-hidden", className)}
      style={{
        transform,
        transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {glareEnabled && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
            transition: "opacity 0.3s ease",
          }}
        />
      )}
    </div>
  );
}
