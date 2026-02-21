export type ReminderOption = "off" | "24h" | "3h" | "both";

export function toReminderFlags(option: ReminderOption) {
  if (option === "off") return { reminder_24h: false, reminder_3h: false };
  if (option === "24h") return { reminder_24h: true, reminder_3h: false };
  if (option === "3h") return { reminder_24h: false, reminder_3h: true };
  return { reminder_24h: true, reminder_3h: true };
}

export function fromReminderFlags(flags: { reminder_24h?: boolean; reminder_3h?: boolean }): ReminderOption {
  if (flags.reminder_24h && flags.reminder_3h) return "both";
  if (flags.reminder_24h) return "24h";
  if (flags.reminder_3h) return "3h";
  return "off";
}

