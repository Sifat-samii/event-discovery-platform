"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickChips from "@/components/events/quick-chips";
import DhakaSkyline from "@/components/ui/dhaka-skyline";

const FLOATING_ICONS = [
  { icon: "🎵", top: "14%",  left: "7%",  delay: 0,   cls: "animate-float-1" },
  { icon: "🎭", top: "20%",  right: "8%", delay: 0.8, cls: "animate-float-2" },
  { icon: "🎨", top: "55%",  left: "4%",  delay: 1.6, cls: "animate-float-3" },
  { icon: "🎪", top: "60%",  right: "6%", delay: 2.4, cls: "animate-float-4" },
  { icon: "🎬", top: "35%",  left: "13%", delay: 0.4, cls: "animate-float-5" },
  { icon: "🏛️", top: "38%",  right: "14%",delay: 1.2, cls: "animate-float-2" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, type: "tween" } },
} as const;

export default function HeroSection() {
  return (
    <section className="relative min-h-[88vh] overflow-hidden flex flex-col">
      {/* ── Animated orb background ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-1 via-background to-surface-2" />
        {/* Orb 1 — gold */}
        <div
          className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full
                     bg-brand-gold/18 blur-[100px] animate-orb-1"
        />
        {/* Orb 2 — teal */}
        <div
          className="absolute -right-24 top-12 h-[420px] w-[420px] rounded-full
                     bg-brand-teal/14 blur-[90px] animate-orb-2"
        />
        {/* Orb 3 — purple */}
        <div
          className="absolute bottom-12 left-1/3 h-[360px] w-[360px] rounded-full
                     bg-brand-purple/10 blur-[80px] animate-orb-3"
        />
        {/* Orb 4 — coral */}
        <div
          className="absolute right-1/4 bottom-0 h-[280px] w-[280px] rounded-full
                     bg-brand-coral/10 blur-[70px] animate-orb-2"
        />
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.4] pattern-dots" />
      </div>

      {/* ── Floating cultural icons ── */}
      {FLOATING_ICONS.map((fi, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute hidden text-3xl opacity-40 md:block ${fi.cls}`}
          style={{ top: fi.top, left: fi.left, right: fi.right }}
        >
          {fi.icon}
        </div>
      ))}

      {/* ── Main content ── */}
      <motion.div
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-24 pt-16 text-center md:pt-24"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={item}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-gold/28
                          bg-brand-gold/10 px-4 py-2 text-sm font-semibold text-brand-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Dhaka&apos;s Premier Events Guide
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="mb-4 text-6xl font-black leading-[1.05] tracking-tighter md:text-8xl lg:text-9xl"
        >
          <span className="text-gradient-brand">KOTHAY</span>
          <br />
          <span className="text-gradient-brand">JABO?</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={item}
          className="mx-auto mb-3 max-w-xl text-lg font-medium text-foreground/80 md:text-xl"
        >
          Where to go in Dhaka — we&apos;ll tell you.
        </motion.p>
        <motion.p
          variants={item}
          className="mx-auto mb-10 max-w-md text-base text-muted-foreground"
        >
          Concerts · Workshops · Exhibitions · Theatre · Festivals
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="mb-10 flex flex-wrap justify-center gap-3">
          <Link href="/browse">
            <Button
              size="xl"
              className="gap-2 rounded-full shadow-[0_0_28px_hsl(var(--brand-gold)/0.4)] hover:shadow-[0_0_40px_hsl(var(--brand-gold)/0.55)]"
            >
              Explore Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/organizer">
            <Button variant="outline" size="xl" className="rounded-full border-2">
              List Your Event
            </Button>
          </Link>
        </motion.div>

        {/* Quick chips */}
        <motion.div variants={item}>
          <QuickChips />
        </motion.div>
      </motion.div>

      {/* ── Dhaka Skyline ── */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10">
        <DhakaSkyline className="w-full text-brand-teal/18 dark:text-brand-teal/10" />
        {/* Second layer slightly offset for depth */}
        <DhakaSkyline className="absolute bottom-0 left-8 w-full translate-y-2 scale-x-105 text-brand-gold/10 dark:text-brand-gold/08" />
      </div>
    </section>
  );
}
