"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  showArrows?: boolean;
  showDots?: boolean;
}

export default function Carousel({
  children,
  className,
  itemClassName,
  showArrows = true,
  showDots = false,
}: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);

    const children = el.children;
    if (children.length) {
      const itemWidth = (children[0] as HTMLElement).offsetWidth + 20;
      setActiveIndex(Math.round(el.scrollLeft / itemWidth));
      setTotalItems(children.length);
    }
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, []);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <div className={cn("group/carousel relative", className)}>
      <div
        ref={scrollRef}
        className="snap-carousel"
      >
        {children}
      </div>

      {showArrows && (
        <>
          <button
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10",
              "flex h-10 w-10 items-center justify-center rounded-full",
              "glass border border-border/30 shadow-lg",
              "opacity-0 transition-all duration-base ease-spring",
              "hover:scale-110 active:scale-95",
              canScrollLeft
                ? "group-hover/carousel:opacity-100"
                : "pointer-events-none"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10",
              "flex h-10 w-10 items-center justify-center rounded-full",
              "glass border border-border/30 shadow-lg",
              "opacity-0 transition-all duration-base ease-spring",
              "hover:scale-110 active:scale-95",
              canScrollRight
                ? "group-hover/carousel:opacity-100"
                : "pointer-events-none"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {showDots && totalItems > 0 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: Math.min(totalItems, 8) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-base ease-spring",
                i === activeIndex
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-surface-3/80"
              )}
            />
          ))}
        </div>
      )}

      {canScrollLeft && (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
      )}
    </div>
  );
}
