"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const steps = [
  "Basics",
  "Date & Time",
  "Venue",
  "Media",
  "Pricing",
  "Description",
];

type EventDraft = {
  title: string;
  category: string;
  subcategory: string;
  tags: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  area: string;
  venueAddress: string;
  mapLink: string;
  posterFileName: string;
  priceType: "free" | "paid";
  ticketLink: string;
  description: string;
};

const defaultDraft: EventDraft = {
  title: "",
  category: "",
  subcategory: "",
  tags: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  venueName: "",
  area: "",
  venueAddress: "",
  mapLink: "",
  posterFileName: "",
  priceType: "free",
  ticketLink: "",
  description: "",
};

export default function EventStepperForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (draft: EventDraft) => Promise<void>;
}) {
  const { pushToast } = useToast();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<EventDraft>(defaultDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  useEffect(() => {
    const raw = window.localStorage.getItem("organizer_event_draft");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as EventDraft;
        setDraft({ ...defaultDraft, ...parsed });
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("organizer_event_draft", JSON.stringify(draft));
  }, [draft]);

  const validateStep = (nextStep: number) => {
    const nextErrors: Record<string, string> = {};
    if (nextStep === 0) {
      if (!draft.title.trim()) nextErrors.title = "Title is required";
      if (!draft.category.trim()) nextErrors.category = "Category is required";
    }
    if (nextStep === 1) {
      if (!draft.startDate) nextErrors.startDate = "Start date is required";
      if (!draft.startTime) nextErrors.startTime = "Start time is required";
    }
    if (nextStep === 2) {
      if (!draft.venueName.trim()) nextErrors.venueName = "Venue is required";
      if (!draft.area.trim()) nextErrors.area = "Area is required";
    }
    if (nextStep === 4 && draft.priceType === "paid" && !draft.ticketLink.trim()) {
      nextErrors.ticketLink = "Ticket link required for paid events";
    }
    if (nextStep === 5 && draft.description.trim().length < 40) {
      nextErrors.description = "Description should be at least 40 characters";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      pushToast({ title: "Please fix highlighted fields", type: "warning" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setSubmitting(true);
    try {
      await onSubmit(draft);
      window.localStorage.removeItem("organizer_event_draft");
      pushToast({
        title: "Submitted for review",
        description: "Status updated to pending review.",
        type: "success",
      });
      onClose();
    } catch (error: any) {
      pushToast({
        title: "Submission failed",
        description: error?.message || "Please try again.",
        type: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
          <div>
            <Input
              placeholder="Event title"
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
            />
            {errors.title ? <p className="mt-1 text-xs text-danger">{errors.title}</p> : null}
          </div>
          <div>
            <Input
              placeholder="Category"
              value={draft.category}
              onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
            />
            {errors.category ? <p className="mt-1 text-xs text-danger">{errors.category}</p> : null}
          </div>
          <Input
            placeholder="Subcategory"
            value={draft.subcategory}
            onChange={(e) => setDraft((prev) => ({ ...prev, subcategory: e.target.value }))}
          />
          <Input
            placeholder="Tags (comma separated)"
            value={draft.tags}
            onChange={(e) => setDraft((prev) => ({ ...prev, tags: e.target.value }))}
          />
        </div>
      ) : null}
      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input
              type="date"
              value={draft.startDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, startDate: e.target.value }))}
            />
            {errors.startDate ? <p className="mt-1 text-xs text-danger">{errors.startDate}</p> : null}
          </div>
          <Input
            type="date"
            value={draft.endDate}
            onChange={(e) => setDraft((prev) => ({ ...prev, endDate: e.target.value }))}
          />
          <div>
            <Input
              type="time"
              value={draft.startTime}
              onChange={(e) => setDraft((prev) => ({ ...prev, startTime: e.target.value }))}
            />
            {errors.startTime ? <p className="mt-1 text-xs text-danger">{errors.startTime}</p> : null}
          </div>
          <Input
            type="time"
            value={draft.endTime}
            onChange={(e) => setDraft((prev) => ({ ...prev, endTime: e.target.value }))}
          />
        </div>
      ) : null}
      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input
              placeholder="Venue name"
              value={draft.venueName}
              onChange={(e) => setDraft((prev) => ({ ...prev, venueName: e.target.value }))}
            />
            {errors.venueName ? <p className="mt-1 text-xs text-danger">{errors.venueName}</p> : null}
          </div>
          <div>
            <Input
              placeholder="Area"
              value={draft.area}
              onChange={(e) => setDraft((prev) => ({ ...prev, area: e.target.value }))}
            />
            {errors.area ? <p className="mt-1 text-xs text-danger">{errors.area}</p> : null}
          </div>
          <Input
            placeholder="Venue address"
            value={draft.venueAddress}
            onChange={(e) => setDraft((prev) => ({ ...prev, venueAddress: e.target.value }))}
          />
          <Input
            placeholder="Google Maps link"
            value={draft.mapLink}
            onChange={(e) => setDraft((prev) => ({ ...prev, mapLink: e.target.value }))}
          />
        </div>
      ) : null}
      {step === 3 ? (
        <div className="grid gap-4">
          <Input
            type="file"
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                posterFileName: e.target.files?.[0]?.name || "",
              }))
            }
          />
          <p className="text-sm text-muted-foreground">Upload poster with recommended 16:9 ratio.</p>
          {draft.posterFileName ? (
            <p className="text-xs text-muted-foreground">Selected: {draft.posterFileName}</p>
          ) : null}
        </div>
      ) : null}
      {step === 4 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={draft.priceType}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, priceType: e.target.value as "free" | "paid" }))
            }
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          <div>
            <Input
              placeholder="Ticket link (optional)"
              value={draft.ticketLink}
              onChange={(e) => setDraft((prev) => ({ ...prev, ticketLink: e.target.value }))}
            />
            {errors.ticketLink ? <p className="mt-1 text-xs text-danger">{errors.ticketLink}</p> : null}
          </div>
        </div>
      ) : null}
      {step === 5 ? (
        <div>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-input bg-background p-3 text-sm"
            placeholder="Describe your event and highlights..."
            value={draft.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
          />
          {errors.description ? (
            <p className="mt-1 text-xs text-danger">{errors.description}</p>
          ) : null}
        </div>
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
            <Button
              onClick={() => {
                if (!validateStep(step)) return;
                setStep((s) => Math.min(s + 1, steps.length - 1));
              }}
            >
              Next
            </Button>
          ) : (
            <Button disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Submitting..." : "Submit (Pending review)"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
