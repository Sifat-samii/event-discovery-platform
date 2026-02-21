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
  default: "border-border bg-surface-1 text-foreground",
  success: "border-success/40 bg-surface-1 text-foreground",
  warning: "border-warning/40 bg-surface-1 text-foreground",
  danger: "border-danger/40 bg-surface-1 text-foreground",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const pushToast = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
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
              "rounded-lg border p-4 shadow-surface-2 data-[state=open]:animate-in data-[state=closed]:animate-out",
              typeStyles[toast.type ?? "default"]
            )}
          >
            <ToastPrimitives.Title className="text-sm font-semibold">
              {toast.title}
            </ToastPrimitives.Title>
            {toast.description ? (
              <ToastPrimitives.Description className="mt-1 text-xs text-muted-foreground">
                {toast.description}
              </ToastPrimitives.Description>
            ) : null}
          </ToastPrimitives.Root>
        ))}
        <ToastPrimitives.Viewport className="fixed bottom-20 right-4 z-50 flex w-[320px] flex-col gap-2 md:bottom-4" />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  );
}
