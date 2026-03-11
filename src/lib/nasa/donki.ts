interface DonkiNotification {
  messageID: string;
  messageType: string;
  messageBody: string;
  messageURL: string;
  messageIssueTime: string;
}

const EVENT_TYPE_MAP: Record<string, { label: string; icon: string; importance: string }> = {
  FLR: { label: "Solar Flare", icon: "sun", importance: "high" },
  CME: { label: "Coronal Mass Ejection", icon: "orbit", importance: "high" },
  GST: { label: "Geomagnetic Storm", icon: "zap", importance: "critical" },
  SEP: { label: "Solar Energetic Particle", icon: "atom", importance: "high" },
  MPC: { label: "Magnetopause Crossing", icon: "shield", importance: "normal" },
  RBE: { label: "Radiation Belt Enhancement", icon: "radio", importance: "normal" },
  HSS: { label: "High Speed Stream", icon: "wind", importance: "normal" },
  IPS: { label: "Interplanetary Shock", icon: "alert-triangle", importance: "high" },
  report: { label: "Space Weather Report", icon: "file-text", importance: "low" },
};

function extractSummary(body: string): string {
  // Get first meaningful paragraph (skip headers and blanks)
  const lines = body.split("\n").filter((l) => l.trim().length > 0);
  const summary = lines.slice(0, 3).join(" ").trim();
  return summary.length > 300 ? summary.slice(0, 297) + "..." : summary;
}

export function mapDonkiToEvents(notifications: DonkiNotification[]) {
  return notifications.map((n) => {
    const typeInfo = EVENT_TYPE_MAP[n.messageType] || EVENT_TYPE_MAP["report"];
    return {
      channel: "nasa-donki",
      title: `${typeInfo.label}: ${n.messageType}-${n.messageID.slice(-6)}`,
      description: extractSummary(n.messageBody),
      tags: ["nasa", "donki", n.messageType.toLowerCase(), "space-weather"],
      metadata: {
        messageID: n.messageID,
        messageType: n.messageType,
        messageURL: n.messageURL,
        issueTime: n.messageIssueTime,
      },
      icon: typeInfo.icon,
      importance: typeInfo.importance,
    };
  });
}

export async function fetchDonkiNotifications(): Promise<DonkiNotification[]> {
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
  const now = new Date();
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const start = startDate.toISOString().split("T")[0];
  const end = now.toISOString().split("T")[0];

  const url = `https://api.nasa.gov/DONKI/notifications?startDate=${start}&endDate=${end}&type=all&api_key=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error("DONKI API error:", res.status, await res.text());
    return [];
  }

  return res.json();
}
