import { sanitizeText } from "../security/sanitize";

export type OrganizerEventPayload = {
  title: string;
  description: string;
  category: string;
  area: string;
  venueName: string;
  venueAddress: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string | null;
  priceType: "free" | "paid";
  ticketLink: string | null;
};

export function normalizeOrganizerEventPayload(input: any): OrganizerEventPayload {
  return {
    title: sanitizeText(input?.title, 140),
    description: sanitizeText(input?.description, 5000),
    category: sanitizeText(input?.category, 60),
    area: sanitizeText(input?.area, 60),
    venueName: sanitizeText(input?.venueName, 140),
    venueAddress: sanitizeText(input?.venueAddress, 240),
    startDate: sanitizeText(input?.startDate, 20),
    endDate: sanitizeText(input?.endDate, 20),
    startTime: sanitizeText(input?.startTime, 20),
    endTime: sanitizeText(input?.endTime, 20) || null,
    priceType: input?.priceType === "paid" ? "paid" : "free",
    ticketLink: sanitizeText(input?.ticketLink, 400) || null,
  };
}

export function validateOrganizerEventPayload(payload: OrganizerEventPayload) {
  const errors: string[] = [];
  if (!payload.title) errors.push("Title is required.");
  if (!payload.venueName) errors.push("Venue name is required.");
  if (!payload.category) errors.push("Category is required.");
  if (!payload.area) errors.push("Area is required.");
  if (!payload.startDate) errors.push("Start date is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.startDate)) errors.push("Start date format is invalid.");
  if (payload.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(payload.endDate)) errors.push("End date format is invalid.");
  if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) {
    errors.push("End date cannot be before start date.");
  }
  return { valid: errors.length === 0, errors };
}

