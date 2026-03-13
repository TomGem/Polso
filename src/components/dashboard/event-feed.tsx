"use client";

import { EventCard } from "./event-card";
import { EventRow } from "@/lib/supabase/types";

interface EventFeedProps {
  events: EventRow[];
  onToggleFavorite: (id: string) => void;
  highlightIds?: Set<string>;
}

export function EventFeed({ events, onToggleFavorite, highlightIds }: EventFeedProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">No events found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Events will appear here when they are pushed to this project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onToggleFavorite={onToggleFavorite}
          highlight={highlightIds?.has(event.id)}
        />
      ))}
    </div>
  );
}
