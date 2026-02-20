"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const steps = [
  "Basics",
  "Date & Time",
  "Venue",
  "Media",
  "Pricing",
  "Description",
];

export default function EventStepperForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  return (
    <div className="glass-surface rounded-xl p-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Submit Event</h3>
          <span className="text-xs text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-surface-3">
          <div className="h-2 rounded-full bg-primary transition-all duration-base" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {steps.map((label, idx) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-xs ${
              idx === step
                ? "bg-primary/15 text-primary"
                : "bg-surface-2 text-muted-foreground"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {step === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Event title" />
          <Input placeholder="Category" />
          <Input placeholder="Subcategory" />
          <Input placeholder="Tags (comma separated)" />
        </div>
      ) : null}
      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Input type="date" />
          <Input type="date" />
          <Input type="time" />
          <Input type="time" />
        </div>
      ) : null}
      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Venue name" />
          <Input placeholder="Area" />
          <Input placeholder="Venue address" />
          <Input placeholder="Google Maps link" />
        </div>
      ) : null}
      {step === 3 ? (
        <div className="grid gap-4">
          <Input type="file" />
          <p className="text-sm text-muted-foreground">Upload poster with recommended 16:9 ratio.</p>
        </div>
      ) : null}
      {step === 4 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          <Input placeholder="Ticket link (optional)" />
        </div>
      ) : null}
      {step === 5 ? (
        <textarea
          className="min-h-[120px] w-full rounded-md border border-input bg-background p-3 text-sm"
          placeholder="Describe your event and highlights..."
        />
      ) : null}

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(s - 1, 0))}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}>Next</Button>
          ) : (
            <Button>Submit (Pending review)</Button>
          )}
        </div>
      </div>
    </div>
  );
}
