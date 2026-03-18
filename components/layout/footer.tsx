import Link from "next/link";
import DhakaSkyline from "@/components/ui/dhaka-skyline";

const FOOTER_LINKS = {
  Explore: [
    { href: "/browse",                     label: "Browse Events" },
    { href: "/browse?price_type=free",     label: "Free Events" },
    { href: "/browse?this_weekend=true",   label: "This Weekend" },
    { href: "/browse?sort=trending",       label: "Trending" },
  ],
  Organizers: [
    { href: "/organizer", label: "Submit Event" },
    { href: "/organizer", label: "Organizer Dashboard" },
  ],
  Company: [
    { href: "/about",   label: "About Us" },
    { href: "/contact", label: "Contact" },
  ],
};

export default function Footer() {
  return (
<<<<<<< Current (Your changes)
    <footer className="hidden border-t border-border/50 md:block">
      {/* Skyline decorative strip */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-teal/6 via-brand-gold/4 to-brand-purple/6 py-6">
        <DhakaSkyline className="mx-auto w-full max-w-5xl text-brand-teal/22 dark:text-brand-teal/12" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-2xl border border-border/50 bg-background/80 px-6 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
            Dhaka&apos;s Cultural Events Guide
          </span>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-surface-1/50 py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/home" className="mb-4 inline-flex items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-gold via-brand-teal to-brand-purple opacity-80" />
                  <span className="relative text-sm">🪁</span>
                </div>
                <span className="text-gradient-brand text-[16px] font-black tracking-tight">
                  Kothay Jabo?
                </span>
              </Link>
              <p className="max-w-[190px] text-sm leading-relaxed text-muted-foreground">
                Where to go in Dhaka — concerts, workshops, exhibitions and more.
              </p>
            </div>

            {/* Links */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="mb-4 text-sm font-bold">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-brand-gold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Kothay Jabo? All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-base">❤️</span>
              Made for Dhaka&apos;s event lovers
            </div>
          </div>
        </div>
=======
    <footer className="mt-16 border-t border-border/30">
      <div className="page-wrap py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                <span className="text-xs font-bold text-primary">KJ</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">Kothay Jabo?</span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Discover events, workshops, and cultural experiences across Dhaka, Bangladesh.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Explore</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/browse" className="text-[13px] text-text-secondary hover:text-primary transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-[13px] text-text-secondary hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">For Organizers</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/organizer" className="text-[13px] text-text-secondary hover:text-primary transition-colors">
                  Submit Event
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">About</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-[13px] text-text-secondary hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[13px] text-text-secondary hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/20 text-center">
          <p className="text-[12px] text-muted-foreground/60">&copy; {new Date().getFullYear()} Kothay Jabo? All rights reserved.</p>
        </div>
>>>>>>> Incoming (Background Agent changes)
      </div>
    </footer>
  );
}
