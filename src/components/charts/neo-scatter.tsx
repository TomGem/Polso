"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
} from "recharts";
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

interface NeoScatterProps {
  events: EventRow[];
}

export function NeoScatter({ events }: NeoScatterProps) {
  const neoEvents = events
    .filter((e) => e.channel === "nasa-neo" && e.metadata)
    .map((e) => {
      const m = e.metadata as Record<string, unknown>;
      return {
        name: (m.name as string) || e.title,
        distance: Math.round((m.missDistanceKm as number) / 1e6 * 100) / 100,
        velocity: Math.round(m.velocityKmh as number),
        diameter: Math.round(((m.diameterMinM as number) + (m.diameterMaxM as number)) / 2),
        hazardous: m.isHazardous as boolean,
      };
    });

  const hazardous = neoEvents.filter((e) => e.hazardous);
  const safe = neoEvents.filter((e) => !e.hazardous);

  const chartConfig: ChartConfig = {
    safe: { label: "Safe", color: "var(--color-chart-1)" },
    hazardous: { label: "Hazardous", color: "var(--color-destructive)" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Near Earth Objects</CardTitle>
        <CardDescription>
          Distance (M km) vs. velocity (km/h), sized by diameter
        </CardDescription>
      </CardHeader>
      <CardContent>
        {neoEvents.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No NEO data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="distance"
                name="Distance (M km)"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="number"
                dataKey="velocity"
                name="Velocity (km/h)"
                tickLine={false}
                axisLine={false}
              />
              <ZAxis type="number" dataKey="diameter" range={[30, 300]} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ strokeDasharray: "3 3" }}
              />
              {safe.length > 0 && (
                <Scatter
                  name="Safe"
                  data={safe}
                  fill="var(--color-chart-1)"
                  fillOpacity={0.7}
                />
              )}
              {hazardous.length > 0 && (
                <Scatter
                  name="Hazardous"
                  data={hazardous}
                  fill="var(--color-destructive)"
                  fillOpacity={0.7}
                />
              )}
            </ScatterChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
