export type ReminderStatus = "pending" | "sent" | "failed";

export function aggregateReminderStatus(input: {
  reminder24: boolean;
  reminder3: boolean;
  status24: ReminderStatus;
  status3: ReminderStatus;
}): ReminderStatus {
  const statuses: ReminderStatus[] = [];
  if (input.reminder24) statuses.push(input.status24);
  if (input.reminder3) statuses.push(input.status3);
  if (!statuses.length) return "pending";
  if (statuses.some((item) => item === "failed")) return "failed";
  if (statuses.every((item) => item === "sent")) return "sent";
  return "pending";
}

export function canCreateReminderForEvent(event: {
  status?: string | null;
  end_date?: string | null;
  deleted_at?: string | null;
}) {
  if (!event || event.deleted_at) return false;
  if (event.status !== "published") return false;
  if (!event.end_date) return false;
  return new Date(event.end_date).getTime() >= Date.now();
}

