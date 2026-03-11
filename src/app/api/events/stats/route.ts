import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");

  if (!projectId) {
    return NextResponse.json(
      { error: "project_id is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Total events
  const { count: totalEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  // Events today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: eventsToday } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .gte("created_at", todayStart.toISOString());

  // Distinct channels
  const { data: channelData } = await supabase
    .from("events")
    .select("channel")
    .eq("project_id", projectId);
  const channels = new Set(channelData?.map((d) => d.channel) || []);

  // Critical events (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: criticalEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("importance", "critical")
    .gte("created_at", weekAgo.toISOString());

  // Events by channel (for charts)
  const channelCounts: Record<string, number> = {};
  channelData?.forEach((d) => {
    channelCounts[d.channel] = (channelCounts[d.channel] || 0) + 1;
  });

  // Events over the last 7 days (for timeline chart)
  const { data: recentEvents } = await supabase
    .from("events")
    .select("created_at, channel")
    .eq("project_id", projectId)
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: true });

  // Group by day and channel
  const timeline: Record<string, Record<string, number>> = {};
  recentEvents?.forEach((e) => {
    const day = new Date(e.created_at).toISOString().split("T")[0];
    if (!timeline[day]) timeline[day] = {};
    timeline[day][e.channel] = (timeline[day][e.channel] || 0) + 1;
  });

  const timelineData = Object.entries(timeline).map(([date, channels]) => ({
    date,
    ...channels,
  }));

  return NextResponse.json({
    totalEvents: totalEvents || 0,
    eventsToday: eventsToday || 0,
    channelCount: channels.size,
    criticalEvents: criticalEvents || 0,
    channelCounts,
    timelineData,
  });
}
