export const EVENT_STATUSES = ["draft", "pending", "published", "expired", "archived"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];
export type StatusActor = "admin" | "organizer";

const adminTransitions: Record<EventStatus, EventStatus[]> = {
  draft: ["pending", "archived"],
  pending: ["published", "archived"],
  published: ["expired", "archived"],
  expired: ["archived"],
  archived: [],
};

const organizerTransitions: Record<EventStatus, EventStatus[]> = {
  draft: ["pending"],
  pending: [],
  published: [],
  expired: [],
  archived: [],
};

export function isValidStatus(value: string): value is EventStatus {
  return (EVENT_STATUSES as readonly string[]).includes(value);
}

export function canTransitionStatus(from: EventStatus, to: EventStatus, actor: StatusActor = "admin") {
  if (from === to) return true;
  if (actor === "admin") return adminTransitions[from].includes(to);
  return organizerTransitions[from].includes(to);
}

export function validateStatusTransition(from: EventStatus, to: EventStatus, actor: StatusActor) {
  if (!canTransitionStatus(from, to, actor)) {
    return {
      valid: false,
      message: `Invalid status transition for ${actor}: ${from} -> ${to}`,
    };
  }
  return { valid: true, message: "" };
}

