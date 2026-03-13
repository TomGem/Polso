"use client";

import { useCallback, useEffect, useState } from "react";
import { EventRow } from "@/lib/supabase/types";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied" as const;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const notify = useCallback(
    (event: EventRow) => {
      if (permission !== "granted") return;
      if (event.importance !== "high" && event.importance !== "critical") return;

      const tag = `event-${event.id}`;
      const importance = event.importance === "critical" ? "CRITICAL" : "Important";

      new Notification(`[${importance}] ${event.title}`, {
        body: event.description || `${event.channel} — ${event.importance}`,
        tag,
      });
    },
    [permission]
  );

  return { permission, requestPermission, notify };
}
