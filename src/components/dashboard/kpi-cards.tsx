"use client";

import { Activity, Calendar, Radio, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardsProps {
  totalEvents: number;
  eventsToday: number;
  channelCount: number;
  criticalEvents: number;
}

const kpis = [
  {
    key: "totalEvents" as const,
    label: "Total Events",
    icon: Activity,
    color: "text-chart-1",
  },
  {
    key: "eventsToday" as const,
    label: "Events Today",
    icon: Calendar,
    color: "text-chart-2",
  },
  {
    key: "channelCount" as const,
    label: "Channels",
    icon: Radio,
    color: "text-chart-3",
  },
  {
    key: "criticalEvents" as const,
    label: "Critical (7d)",
    icon: AlertTriangle,
    color: "text-chart-4",
  },
];

export function KpiCards(props: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {props[kpi.key].toLocaleString()}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
