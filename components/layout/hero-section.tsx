"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickChips from "@/components/events/quick-chips";
import DhakaSkyline from "@/components/ui/dhaka-skyline";

const FLOATING_ICONS = [
  { icon: "🎵", top: "14%",  left: "7%",   cls: "animate-float-1" },
  { icon: "🎭", top: "20%",  right: "8%",  cls: "animate-float-2" },
  { icon: "🎨", top: "55%",  left: "4%",   cls: "animate-float-3" },
  { icon: "🎪", top: "60%",  right: "6%",  cls: "animate-float-4" },
  { icon: "🎬", top: "35%",  left: "13%",  cls: "animate-float-5" },
  { icon: "🏛️", top: "38%",  right: "14%", cls: "animate-float-2" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, type: "tween" } },
} as const;

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[88vh] w-full flex-col overflow-hidden">
      {/* ── Animated mesh background ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-1 via-background to-surface-2" />
        {/* Gold orb */}
        <div
          className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full blur-[110px] animate-orb-1"
          style={{ background: "hsl(var(--brand-gold) / 0.15)" }}
        />
        {/* Teal orb */}
        <div
          className="absolute -right-24 top-12 h-[420px] w-[420px] rounded-full blur-[90px] animate-orb-2"
          style={{ background: "hsl(var(--brand-teal) / 0.12)" }}
        />
        {/* Purple orb */}
        <div
          className="absolute bottom-12 left-1/3 h-[360px] w-[360px] rounded-full blur-[80px] animate-orb-3"
          style={{ background: "hsl(var(--brand-purple) / 0.09)" }}
        />
        {/* Coral orb */}
        <div
          className="absolute bottom-0 right-1/4 h-[280px] w-[280px] rounded-full blur-[70px] animate-orb-2"
          style={{ background: "hsl(var(--brand-coral) / 0.09)" }}
        />
        <div className="absolute inset-0 opacity-30 pattern-dots" />
      </div>

      {/* ── Floating cultural icons (lg only) ── */}
      {FLOATING_ICONS.map((fi, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute hidden text-3xl opacity-35 lg:block ${fi.cls}`}
          style={{ top: fi.top, left: fi.left, right: fi.right }}
        >
          {fi.icon}
        </div>
      ))}

      {/* ── Main content ── */}
      <motion.div
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-28 pt-16 text-center sm:px-8 md:pt-24"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={item}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
               style={{ borderColor: "hsl(var(--brand-gold) / 0.3)", background: "hsl(var(--brand-gold) / 0.1)", color: "hsl(var(--brand-gold))" }}>
            <Sparkles className="h-3.5 w-3.5" />
            Dhaka&apos;s Premier Events Guide
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="mb-4 text-5xl font-black leading-[1.02] tracking-tighter sm:text-6xl md:text-8xl lg:text-9xl"
        >
          <span className="text-gradient-brand">KOTHAY</span>
          <br />
          <span className="text-gradient-brand">JABO?</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p variants={item} className="mx-auto mb-3 max-w-xl text-lg font-medium text-foreground/80 md:text-xl">
          Where to go in Dhaka — we&apos;ll tell you.
        </motion.p>
        <motion.p variants={item} className="mx-auto mb-10 max-w-md text-sm text-muted-foreground md:text-base">
          Concerts · Workshops · Exhibitions · Theatre · Festivals
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="mb-10 flex flex-wrap justify-center gap-3">
          <Link href="/browse">
            <Button size="lg" className="gap-2 rounded-full px-8 shadow-[0_0_28px_hsl(var(--brand-gold)/0.38)] hover:shadow-[0_0_40px_hsl(var(--brand-gold)/0.52)]">
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

        {/* Quick chips */}
        <motion.div variants={item} className="w-full max-w-3xl">
          <QuickChips />
        </motion.div>
      </motion.div>

      {/* ── Dhaka Skyline (two-layer parallax) ── */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10">
        <DhakaSkyline className="w-full" style={{ color: "hsl(var(--brand-teal) / 0.16)" }} />
        <DhakaSkyline
          className="absolute bottom-0 left-4 w-full scale-x-[1.04]"
          style={{ color: "hsl(var(--brand-gold) / 0.09)" }}
        />
      </div>
    </section>
  );
}
