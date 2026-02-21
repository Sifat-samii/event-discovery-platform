import { describe, expect, it } from "vitest";
import { normalizeEventQuery } from "../lib/filters/query-normalizer";
import { toReminderFlags, fromReminderFlags } from "../lib/reminders/preferences";
import { canTransitionStatus } from "../lib/admin/status";
import { canTransitionReportStatus } from "../lib/reports/status";
import {
  normalizeOrganizerEventPayload,
  validateOrganizerEventPayload,
} from "../lib/organizer/validation";

describe("filter combinations", () => {
  it("parses multi-select + date preset + verified", () => {
    const params = new URLSearchParams(
      "categories=music,theatre&areas=gulshan,dhanmondi&date_preset=weekend&verified_only=true&sort=trending"
    );
    const normalized = normalizeEventQuery(params);
    expect(normalized.category).toEqual(["music", "theatre"]);
    expect(normalized.area).toEqual(["gulshan", "dhanmondi"]);
    expect(normalized.thisWeekend).toBe(true);
    expect(normalized.verifiedOnly).toBe(true);
    expect(normalized.sort).toBe("trending");
  });
});

describe("save/reminder lifecycle", () => {
  it("maps reminder options to DB flags", () => {
    expect(toReminderFlags("off")).toEqual({ reminder_24h: false, reminder_3h: false });
    expect(toReminderFlags("both")).toEqual({ reminder_24h: true, reminder_3h: true });
    expect(fromReminderFlags({ reminder_24h: true, reminder_3h: false })).toBe("24h");
  });
});

describe("admin status transitions", () => {
  it("enforces allowed transitions", () => {
    expect(canTransitionStatus("pending", "published")).toBe(true);
    expect(canTransitionStatus("published", "draft")).toBe(false);
  });
});

describe("report resolve flow", () => {
  it("allows open/reviewed to resolve", () => {
    expect(canTransitionReportStatus("open", "reviewed")).toBe(true);
    expect(canTransitionReportStatus("reviewed", "resolved")).toBe(true);
    expect(canTransitionReportStatus("resolved", "reviewed")).toBe(false);
  });
});

describe("organizer submission validation", () => {
  it("rejects invalid payload", () => {
    const payload = normalizeOrganizerEventPayload({
      title: "",
      venueName: "",
      startDate: "bad-date",
      endDate: "2026-01-01",
    });
    const result = validateOrganizerEventPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
