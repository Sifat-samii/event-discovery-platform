import { ReactNode } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileTabbar from "@/components/layout/mobile-tabbar";

interface AppShellProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function AppShell({ children, showFooter = true }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <Header />
      {/* No page-wrap here — each section manages its own containment */}
      <main className="flex-1 pb-28 md:pb-10">{children}</main>
      {showFooter ? <Footer /> : null}
      <MobileTabbar />
    </div>
  );
}
