"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function BottomSheet({
  open,
  onOpenChange,
  trigger,
  title,
  children,
  footer,
}: BottomSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        className={cn(
          "top-auto left-0 right-0 mx-auto max-w-none translate-x-0 translate-y-0",
          "rounded-t-3xl rounded-b-none border-t border-border/30 p-0",
          "bg-surface-1/95 backdrop-blur-xl md:hidden"
        )}
      >
        <div className="max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-surface-4/60" />
          </div>
          <div className="border-b border-border/30 px-5 pb-3">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
        {footer ? (
          <div className="border-t border-border/30 bg-surface-1/95 backdrop-blur-xl px-5 py-3">{footer}</div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
