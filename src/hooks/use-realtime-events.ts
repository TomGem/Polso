"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { EventRow } from "@/lib/supabase/types";

export function useRealtimeEvents(
  projectId: string | null,
  onNewEvent: (event: EventRow) => void
) {
  const callbackRef = useRef(onNewEvent);
  callbackRef.current = onNewEvent;

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`events-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "events",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          callbackRef.current(payload.new as EventRow);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          callbackRef.current(payload.new as EventRow);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);
}
