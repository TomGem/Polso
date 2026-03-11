"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EventRow } from "@/lib/supabase/types";

interface SpaceWeatherBarProps {
  events: EventRow[];
}

export function SpaceWeatherBar({ events }: SpaceWeatherBarProps) {
  const donkiEvents = events.filter((e) => e.channel === "nasa-donki");

  // Group by message type
  const typeCounts: Record<string, number> = {};
  donkiEvents.forEach((e) => {
    const m = e.metadata as Record<string, unknown>;
    const type = (m.messageType as string) || "Unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const data = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const chartConfig: ChartConfig = {
    count: { label: "Events", color: "var(--color-chart-3)" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Space Weather Events</CardTitle>
        <CardDescription>DONKI events by type</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No DONKI data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="type" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="var(--color-chart-3)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
