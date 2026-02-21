export type ReportStatus = "open" | "reviewed" | "resolved";

export function normalizeReportStatus(input: unknown): ReportStatus {
  if (input === "reviewed") return "reviewed";
  if (input === "open") return "open";
  return "resolved";
}

export function canTransitionReportStatus(from: ReportStatus, to: ReportStatus) {
  if (from === to) return true;
  if (from === "open") return to === "reviewed" || to === "resolved";
  if (from === "reviewed") return to === "resolved";
  return false;
}

