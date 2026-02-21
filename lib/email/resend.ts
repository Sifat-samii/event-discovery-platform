type SendResult = { ok: boolean; status?: number; error?: string };

function getSender() {
  return process.env.RESEND_FROM_EMAIL || "Events Dhaka <noreply@eventsdhaka.com>";
}

async function sendEmail(payload: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY missing" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getSender(),
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { ok: false, status: response.status, error: body };
  }
  return { ok: true, status: response.status };
}

export async function sendReminderEmail(
  to: string,
  eventTitle: string,
  eventDate: Date,
  reminderType: "24h" | "3h"
) {
  const subject =
    reminderType === "24h"
      ? `Reminder: ${eventTitle} is tomorrow`
      : `Reminder: ${eventTitle} starts in 3 hours`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">${eventTitle}</h2>
      <p>${reminderType === "24h" ? "Your saved event is tomorrow." : "Your saved event starts in 3 hours."}</p>
      <p><strong>Date:</strong> ${eventDate.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}</p>
      <p style="color:#666;">You are receiving this because reminders are enabled for this event.</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
}

export async function sendWeeklyDigest(to: string, events: Array<{ title: string; date?: string; venue?: string }>) {
  const items = events
    .slice(0, 12)
    .map(
      (event) =>
        `<li style="margin-bottom:8px;"><strong>${event.title}</strong>${
          event.date ? ` — ${event.date}` : ""
        }${event.venue ? ` (${event.venue})` : ""}</li>`
    )
    .join("");
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2>This Weekend in Dhaka</h2>
      <p>Curated events for your weekend plan:</p>
      <ul>${items || "<li>No events curated this week.</li>"}</ul>
      <p style="color:#666;">See more on Events Dhaka.</p>
    </div>
  `;
  return sendEmail({
    to,
    subject: "This Weekend in Dhaka - Curated Events",
    html,
  });
}
