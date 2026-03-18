"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";

export default function CtaSection() {
  return (
    <ScrollReveal scale>
      <section className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0">
          <div className="orb orb-primary h-60 w-60 top-0 right-0" />
          <div className="orb orb-blue h-48 w-48 bottom-0 left-1/4" style={{ animationDelay: "3s" }} />
        </div>
        <div className="absolute inset-0 glass" />

        <div className="relative z-10 py-16 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to explore<span className="text-gradient">?</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Join thousands who never miss what matters in Dhaka. Free forever.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="group glow-accent-lg">
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" size="lg">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
