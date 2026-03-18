"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import DhakaSkyline from "@/components/ui/dhaka-skyline";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, type: "tween" } },
} as const;

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); }
    else if (data.user) { router.push("/onboarding"); }
    else { setLoading(false); }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const inputClass = "w-full rounded-xl border border-input bg-surface-2/60 py-2.5 pl-10 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-brand-teal/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/12 transition-all";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* ── Animated orb background ── */}
      <div className="fixed inset-0 bg-background">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand-teal/12 blur-[110px] animate-orb-2" />
        <div className="pointer-events-none absolute -left-24 top-16 h-[380px] w-[380px] rounded-full bg-brand-purple/10 blur-[90px] animate-orb-1" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-[320px] w-[320px] rounded-full bg-brand-gold/08 blur-[80px] animate-orb-3" />
        <div className="absolute inset-0 opacity-[0.35] pattern-dots" />
      </div>

      {/* ── Skyline at bottom ── */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-0">
        <DhakaSkyline className="w-full text-brand-purple/14 dark:text-brand-purple/08" />
      </div>

      {/* ── Top nav ── */}
      <div className="relative z-10 p-6">
        <Link href="/home" className="inline-flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-gold via-brand-teal to-brand-purple opacity-80" />
            <span className="relative text-sm">🪁</span>
          </div>
          <span className="text-gradient-brand text-[16px] font-black tracking-tight">
            Kothay Jabo?
          </span>
        </Link>
      </div>

      {/* ── Card ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <motion.div
          className="w-full max-w-sm"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <div className="glass-surface rounded-3xl overflow-hidden shadow-[var(--shadow-2)]">
            {/* Gradient top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-brand-teal via-brand-blue to-brand-purple" />

            <div className="p-8">
              <motion.div variants={item} className="mb-7">
                <h1 className="text-2xl font-black">Create account</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Join Dhaka&apos;s favourite events community
                </p>
              </motion.div>

              {error && (
                <motion.div
                  variants={item}
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-danger/22 bg-danger/10 p-3.5 text-sm text-danger"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <motion.div variants={item} className="space-y-1.5">
                  <label htmlFor="fullName" className="text-sm font-semibold">Full Name</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input id="fullName" type="text" value={fullName}
                      onChange={(e) => setFullName(e.target.value)} required
                      placeholder="Your name" className={inputClass} />
                  </div>
                </motion.div>

                <motion.div variants={item} className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-semibold">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input id="email" type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} required
                      placeholder="you@example.com" className={inputClass} />
                  </div>
                </motion.div>

                <motion.div variants={item} className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-semibold">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input id="password" type={showPassword ? "text" : "password"}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      required minLength={6} placeholder="Min. 6 characters"
                      className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={item}>
                  <Button type="submit"
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-brand-teal to-brand-blue font-bold text-white shadow-[0_4px_20px_hsl(var(--brand-teal)/0.38)] hover:shadow-[0_4px_28px_hsl(var(--brand-teal)/0.52)] transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? "Creating account…" : "Create Account"}
                  </Button>
                </motion.div>
              </form>

              <motion.div variants={item} className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface-1 px-3 text-xs text-muted-foreground">or continue with</span>
                </div>
              </motion.div>

              <motion.div variants={item}>
                <button type="button" onClick={handleGoogleSignup} disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/60 bg-surface-2/60 py-2.5 text-sm font-semibold transition-all hover:border-border hover:bg-surface-3 disabled:opacity-40"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </motion.div>

              <motion.p variants={item} className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-brand-teal hover:underline">
                  Sign in
                </Link>
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
