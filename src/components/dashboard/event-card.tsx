"use client";

import { Star, Sun, Globe, Zap, AlertTriangle, FileText, Wind, Radio, Shield, Atom, Orbit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventRow } from "@/lib/supabase/types";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sun: Sun,
  globe: Globe,
  zap: Zap,
  "alert-triangle": AlertTriangle,
  "file-text": FileText,
  wind: Wind,
  radio: Radio,
  shield: Shield,
  atom: Atom,
  orbit: Orbit,
};

const IMPORTANCE_STYLES: Record<string, string> = {
  low: "border-l-muted-foreground/30",
  normal: "border-l-chart-1",
  high: "border-l-chart-2",
  critical: "border-l-destructive",
};

interface EventCardProps {
  event: EventRow;
  onToggleFavorite: (id: string) => void;
  highlight?: boolean;
}

export function EventCard({ event, onToggleFavorite, highlight }: EventCardProps) {
  const Icon = ICON_MAP[event.icon || ""] || Globe;
  const importanceStyle = IMPORTANCE_STYLES[event.importance] || "";

  return (
    <Card
      className={`border-l-4 ${importanceStyle} transition-all hover:shadow-md ${
        event.importance === "critical" ? "bg-destructive/5" : ""
      } ${highlight ? "ring-2 ring-chart-1 animate-pulse" : ""}`}
    >
      <CardContent className="flex items-start gap-4 py-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold leading-tight">
                {event.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event.channel} &middot;{" "}
                {formatDistanceToNow(new Date(event.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onToggleFavorite(event.id)}
            >
              <Star
                className={`h-4 w-4 ${
                  event.favorited
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>

          {event.description && (
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          {event.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
