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
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="page-wrap pb-20 md:pb-8">{children}</main>
      {showFooter ? <Footer /> : null}
      <MobileTabbar />
    </div>
  );
}
