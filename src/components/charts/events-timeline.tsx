"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

interface TimelineData {
  date: string;
  [channel: string]: string | number;
}

interface EventsTimelineProps {
  data: TimelineData[];
  channels: string[];
}

const CHANNEL_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function EventsTimeline({ data, channels }: EventsTimelineProps) {
  const chartConfig: ChartConfig = {};
  channels.forEach((ch, i) => {
    chartConfig[ch] = {
      label: ch,
      color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events Timeline</CardTitle>
        <CardDescription>Events over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tickLine={false}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {channels.map((ch, i) => (
                <Area
                  key={ch}
                  type="monotone"
                  dataKey={ch}
                  stackId="1"
                  fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
                  stroke={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
                  fillOpacity={0.4}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
