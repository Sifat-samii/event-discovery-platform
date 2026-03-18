import Link from "next/link";
import { Sparkles } from "lucide-react";

const FOOTER_LINKS = {
  Explore: [
    { href: "/browse", label: "Browse Events" },
    { href: "/browse?price_type=free", label: "Free Events" },
    { href: "/browse?this_weekend=true", label: "This Weekend" },
    { href: "/browse?sort=trending", label: "Trending" },
  ],
  Organizers: [
    { href: "/organizer", label: "Submit Event" },
    { href: "/organizer", label: "Organizer Dashboard" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="hidden border-t border-border/50 bg-surface-1/40 md:block">
      <div className="page-wrap py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/home" className="group inline-flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/12">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[15px] font-bold tracking-tight">
                Events <span className="gradient-text">Dhaka</span>
              </span>
            </Link>
            <p className="max-w-[200px] text-sm leading-relaxed text-muted-foreground">
              Discover cultural events, concerts, and workshops across Dhaka.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
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
            © {new Date().getFullYear()} Events Dhaka. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for Dhaka&apos;s cultural community
          </p>
        </div>
      </div>
    </footer>
  );
}
