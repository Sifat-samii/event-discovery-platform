"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

type ToastType = "success" | "warning" | "danger" | "default";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
};

type ToastContextValue = {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const typeStyles: Record<ToastType, string> = {
  default: "border-border/40 bg-surface-1/95",
  success: "border-success/25 bg-surface-1/95",
  warning: "border-warning/25 bg-surface-1/95",
  danger: "border-danger/25 bg-surface-1/95",
};

const dotColors: Record<ToastType, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const pushToast = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
<<<<<<< Current (Your changes)
      timersRef.current.delete(id);
    }, 2500);
    timersRef.current.set(id, timer);
=======
    }, 3000);
>>>>>>> Incoming (Background Agent changes)
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      <ToastPrimitives.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <ToastPrimitives.Root
            key={toast.id}
            open
            className={cn(
              "rounded-2xl border px-4 py-3 backdrop-blur-xl shadow-lg animate-spring-in",
              typeStyles[toast.type ?? "default"]
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", dotColors[toast.type ?? "default"])} />
              <div className="min-w-0">
                <ToastPrimitives.Title className="text-sm font-semibold tracking-tight">
                  {toast.title}
                </ToastPrimitives.Title>
                {toast.description ? (
                  <ToastPrimitives.Description className="mt-0.5 text-xs text-muted-foreground">
                    {toast.description}
                  </ToastPrimitives.Description>
                ) : null}
              </div>
            </div>
          </ToastPrimitives.Root>
        ))}
        <ToastPrimitives.Viewport className="fixed bottom-20 right-4 z-[100] flex w-[340px] flex-col gap-2 md:bottom-6" />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  );
}
