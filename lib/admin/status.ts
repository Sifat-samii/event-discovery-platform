export const EVENT_STATUSES = ["draft", "pending", "published", "expired", "archived"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

const transitions: Record<EventStatus, EventStatus[]> = {
  draft: ["pending", "archived"],
  pending: ["draft", "published", "archived"],
  published: ["expired", "archived"],
  expired: ["published", "archived"],
  archived: ["draft", "pending"],
};

export function isValidStatus(value: string): value is EventStatus {
  return (EVENT_STATUSES as readonly string[]).includes(value);
}

export function canTransitionStatus(from: EventStatus, to: EventStatus) {
  if (from === to) return true;
  return transitions[from].includes(to);
}

