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
        <div className="page-wrap">
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
      </div>
    </footer>
  );
}
