import { describe, expect, it } from "vitest";
import { normalizeEventQuery } from "../lib/filters/query-normalizer";
import { validateStatusTransition } from "../lib/admin/status";
import { resolveUniqueSlugFromExisting } from "../lib/utils/slug-collision";
import { aggregateReminderStatus, canCreateReminderForEvent } from "../lib/reminders/lifecycle";
import { isPubliclyVisibleEvent } from "../lib/events/visibility";
import { requireRole } from "../lib/auth/roles";

describe("event listing with filters", () => {
  it("normalizes listing filters with pagination", () => {
    const params = new URLSearchParams(
      "search=jazz&categories=music,theatre&areas=gulshan&page=2&limit=20&verified_only=true"
    );
    const normalized = normalizeEventQuery(params);
    expect(normalized.search).toBe("jazz");
    expect(normalized.category).toEqual(["music", "theatre"]);
    expect(normalized.area).toEqual(["gulshan"]);
    expect(normalized.page).toBe(2);
    expect(normalized.limit).toBe(20);
    expect(normalized.verifiedOnly).toBe(true);
  });
});

describe("single event visibility and expiration", () => {
  it("rejects expired/non-published events for public visibility", () => {
    expect(
      isPubliclyVisibleEvent({
        status: "published",
        end_date: new Date(Date.now() - 1_000).toISOString(),
      })
    ).toBe(false);
    expect(
      isPubliclyVisibleEvent({
        status: "draft",
        end_date: new Date(Date.now() + 86_400_000).toISOString(),
      })
    ).toBe(false);
  });
});

describe("save and reminder lifecycle", () => {
  it("aggregates reminder statuses deterministically", () => {
    expect(
      aggregateReminderStatus({
        reminder24: true,
        reminder3: true,
        status24: "sent",
        status3: "sent",
      })
    ).toBe("sent");
    expect(
      aggregateReminderStatus({
        reminder24: true,
        reminder3: false,
        status24: "failed",
        status3: "pending",
      })
    ).toBe("failed");
  });

  it("prevents reminders for expired/unpublished events", () => {
    expect(
      canCreateReminderForEvent({
        status: "published",
        end_date: new Date(Date.now() + 60_000).toISOString(),
      })
    ).toBe(true);
    expect(
      canCreateReminderForEvent({
        status: "expired",
        end_date: new Date(Date.now() - 60_000).toISOString(),
      })
    ).toBe(false);
  });
});

describe("organizer/admin workflow and role enforcement", () => {
  it("enforces publish transition only for admin path", () => {
    expect(validateStatusTransition("pending", "published", "admin").valid).toBe(true);
    expect(validateStatusTransition("pending", "published", "organizer").valid).toBe(false);
  });

  it("enforces role checks with mocked auth context", async () => {
    const unauthorizedSupabase = {
      auth: { getUser: async () => ({ data: { user: null } }) },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
    } as any;
    const unauthorized = await requireRole(unauthorizedSupabase, "admin");
    expect(unauthorized.authorized).toBe(false);
    expect(unauthorized.status).toBe(401);

    const userSupabase = {
      auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: { role: "user" }, error: null }),
          }),
        }),
      }),
    } as any;
    const forbidden = await requireRole(userSupabase, "admin");
    expect(forbidden.authorized).toBe(false);
    expect(forbidden.status).toBe(403);
  });
});

describe("slug collision resolution", () => {
  it("appends incremental suffix for collisions", () => {
    const slug = resolveUniqueSlugFromExisting("dhaka-jazz-night", [
      "dhaka-jazz-night",
      "dhaka-jazz-night-2",
    ]);
    expect(slug).toBe("dhaka-jazz-night-3");
  });
});

