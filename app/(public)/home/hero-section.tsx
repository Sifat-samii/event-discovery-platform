"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl py-20 md:py-32">
      <div className="absolute inset-0 mesh-gradient" />
      <div className="orb orb-primary h-72 w-72 -top-20 -right-20" />
      <div className="orb orb-blue h-56 w-56 -bottom-16 -left-16" style={{ animationDelay: "4s" }} />
      <div className="orb orb-green h-40 w-40 top-1/2 left-1/3" style={{ animationDelay: "8s" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/80" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[12px] font-semibold text-primary tracking-wide">Discover what&apos;s happening in Dhaka</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]"
        >
          Kothay Jabo
          <span className="text-gradient-animated">?</span>
          <br />
          <span className="text-gradient">Events in Dhaka</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
        >
          Concerts, workshops, exhibitions, theatre, and more &mdash; all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/browse">
            <Button size="lg" className="group animate-pulse-glow">
              Browse Events
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/organizer">
            <Button variant="outline" size="lg">
              Submit Your Event
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
