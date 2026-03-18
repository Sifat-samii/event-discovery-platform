"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import QuickChips from "@/components/events/quick-chips";
import DhakaSkyline from "@/components/ui/dhaka-skyline";
import KothayJaboBird from "@/components/ui/kothay-jabo-bird";
import { cn } from "@/lib/utils";

/* ── Letter colour map (matches the reference logo) ── */
const KOTHAY = [
  { ch: "K", color: "#00897B" },
  { ch: "O", color: "#00A89E" },
  { ch: "T", color: "#5C1E87" },
  { ch: "H", color: "#5C1E87" },
  { ch: "A", color: "#FF8C00" },
  { ch: "Y", color: "#FF8A00" },
] as const;

const JABO = [
  { ch: "J", color: "#FF6B1A" },
  { ch: "A", color: "#EE4476" },
  { ch: "B", color: "#E8174E" },
  { ch: "O", color: "#9B27AF" },
  { ch: "?", color: "gradient" },
] as const;

/* ── Framer Motion variant definitions ── */
const rowStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.30 } },
} as const;

const jRowStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.60 } },
} as const;

const letterVariant = {
  hidden: { opacity: 0, y: 28, scale: 0.70 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 18 },
  },
} as const;

/* ── Parallax cursor hook ── */
function useCursorParallax(strength = 18) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(useTransform(x, [-1, 1], [-strength, strength]), { stiffness: 90, damping: 18 });
  const springY = useSpring(useTransform(y, [-1, 1], [-strength, strength]), { stiffness: 90, damping: 18 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width * 2 - 1);
    y.set((e.clientY - rect.top) / rect.height * 2 - 1);
  };
  const onMouseLeave = () => { x.set(0); y.set(0); };
  return { ref, onMouseMove, onMouseLeave, springX, springY };
}

export default function HeroSection() {
  const { ref, onMouseMove, onMouseLeave, springX, springY } = useCursorParallax(14);

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Animated background orbs ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-1 via-background to-background" />
        <div
          className="absolute -left-24 -top-24 h-[520px] w-[520px] rounded-full blur-[130px] animate-orb-1"
          style={{ background: "hsl(var(--brand-gold) / 0.11)" }}
        />
        <div
          className="absolute -right-16 top-8 h-[400px] w-[400px] rounded-full blur-[110px] animate-orb-2"
          style={{ background: "hsl(var(--brand-teal) / 0.09)" }}
        />
        <div
          className="absolute bottom-12 left-1/3 h-[340px] w-[340px] rounded-full blur-[90px] animate-orb-3"
          style={{ background: "hsl(var(--brand-purple) / 0.07)" }}
        />
        <div className="absolute inset-0 opacity-[0.22] pattern-dots" />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex w-full flex-col items-center px-4 pt-10 pb-6 sm:px-6">

        {/* ══ LOGO BLOCK: bird on left, coloured text on right ══ */}
        <div className="flex w-full max-w-5xl items-center justify-center gap-2 sm:gap-4 md:gap-6 xl:gap-8">

          {/* ── Phoenix bird + cityscape ── */}
          <motion.div
            style={{ x: springX, y: springY }}
            className="shrink-0"
            initial={{ opacity: 0, x: -36, scale: 0.86 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.85, type: "spring", stiffness: 100, damping: 14 }}
            whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 220, damping: 14 } }}
          >
            {/* Responsive width: scales with viewport, capped at 380px */}
            <div className="w-[min(36vw,180px)] sm:w-[min(36vw,240px)] md:w-[min(38vw,300px)] lg:w-[min(36vw,360px)] xl:w-[380px]">
              <KothayJaboBird className="h-auto w-full drop-shadow-2xl" />
            </div>
          </motion.div>

          {/* ── "KOTHAY JABO?" in per-letter colours ── */}
          <div className="flex min-w-0 flex-col items-start">

            {/* Row 1: K O T H A Y */}
            <motion.div
              className="flex font-black leading-[0.92] tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 7.8vw, 9.8rem)" }}
              variants={rowStagger}
              initial="hidden"
              animate="show"
            >
              {KOTHAY.map(({ ch, color }, i) => (
                <motion.span
                  key={i}
                  variants={letterVariant}
                  className="cursor-default select-none"
                  style={{ color, display: "inline-block" }}
                  whileHover={{
                    y: -10,
                    scale: 1.14,
                    filter: `drop-shadow(0 6px 16px ${color}66)`,
                    transition: { type: "spring", stiffness: 420, damping: 12 },
                  }}
                  whileTap={{ scale: 0.92 }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.div>

            {/* Row 2: J A B O ? */}
            <motion.div
              className="flex font-black leading-[0.92] tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 7.8vw, 9.8rem)" }}
              variants={jRowStagger}
              initial="hidden"
              animate="show"
            >
              {JABO.map(({ ch, color }, i) => (
                <motion.span
                  key={i}
                  variants={letterVariant}
                  className={cn(
                    "cursor-default select-none",
                    color === "gradient" && "text-gradient-brand"
                  )}
                  style={
                    color !== "gradient"
                      ? { color, display: "inline-block" }
                      : { display: "inline-block" }
                  }
                  whileHover={{
                    y: -10,
                    scale: 1.14,
                    filter: color !== "gradient" ? `drop-shadow(0 6px 16px ${color}66)` : undefined,
                    transition: { type: "spring", stiffness: 420, damping: 12 },
                  }}
                  whileTap={{ scale: 0.92 }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Tagline ── */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.5 }}
        >
          <p className="text-base font-semibold text-foreground/75 sm:text-lg md:text-xl">
            Where to go in Dhaka — we&apos;ll tell you.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Concerts · Workshops · Exhibitions · Theatre · Festivals
          </p>
        </motion.div>

        {/* ── CTA Buttons ── */}
        <motion.div
          className="mt-7 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.45 }}
        >
          <Link href="/browse">
            <Button
              size="lg"
              className="gap-2 rounded-full px-8 shadow-[0_0_28px_hsl(var(--brand-gold)/0.36)] hover:shadow-[0_0_44px_hsl(var(--brand-gold)/0.55)] transition-all duration-200"
            >
              Explore Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/organizer">
            <Button variant="outline" size="lg" className="rounded-full border-2 px-8">
              List Your Event
            </Button>
          </Link>
        </motion.div>

        {/* ── Quick filter chips ── */}
        <motion.div
          className="mt-9 w-full max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <QuickChips />
        </motion.div>
      </div>

      {/* ── Dhaka skyline (dual-layer depth) ── */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10">
        <DhakaSkyline
          className="w-full"
          style={{ color: "hsl(var(--brand-teal) / 0.15)" }}
        />
        <DhakaSkyline
          className="absolute bottom-0 left-6 w-full scale-x-[1.05]"
          style={{ color: "hsl(var(--brand-gold) / 0.08)" }}
        />
      </div>

      {/* ── Scroll nudge ── */}
      <motion.div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 7, 0] }}
        transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
      >
        <ChevronDown className="h-5 w-5 text-muted-foreground/35" />
      </motion.div>
    </section>
  );
}
