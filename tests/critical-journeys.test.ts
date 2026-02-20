import { describe, expect, it } from "vitest";
import { checkDuplicateEvent, validateEvent } from "../lib/validation/event-validation";

describe("Critical journey guards", () => {
  it("validates required event fields", () => {
    const result = validateEvent({
      title: "",
      venue_name: "",
      category_id: null,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("detects exact duplicate events", () => {
    const existing = [
      {
        id: "1",
        title: "Dhaka Jazz Night",
        start_date: "2026-03-12T18:00:00.000Z",
        venue_name: "BICC",
      },
    ];

    const result = checkDuplicateEvent(
      "Dhaka Jazz Night",
      "2026-03-12T18:00:00.000Z",
      "BICC",
      existing
    );

    expect(result.isDuplicate).toBe(true);
  });
});
