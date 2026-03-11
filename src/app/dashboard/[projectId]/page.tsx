"use client";

import { useCallback, useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase/client";
import { EventRow } from "@/lib/supabase/types";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { EventFeed } from "@/components/dashboard/event-feed";
import { SearchBar } from "@/components/dashboard/search-bar";
import { ChannelFilter } from "@/components/dashboard/channel-filter";
import { Pagination } from "@/components/dashboard/pagination";
import { EventsTimeline } from "@/components/charts/events-timeline";
import { EventsByChannel } from "@/components/charts/events-by-channel";
import { NeoScatter } from "@/components/charts/neo-scatter";
import { SpaceWeatherBar } from "@/components/charts/space-weather-bar";
import { Button } from "@/components/ui/button";
import { Download, Upload, Star } from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalEvents: number;
  eventsToday: number;
  channelCount: number;
  criticalEvents: number;
  channelCounts: Record<string, number>;
  timelineData: { date: string; [key: string]: string | number }[];
}

export default function ProjectDashboard({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [allEvents, setAllEvents] = useState<EventRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [channels, setChannels] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = useCallback(async () => {
    const params = new URLSearchParams({
      project_id: projectId,
      page: String(page),
      limit: String(limit),
    });
    if (channel !== "all") params.set("channel", channel);
    if (search) params.set("search", search);
    if (favoritesOnly) params.set("favorites", "true");

    const res = await fetch(`/api/events?${params}`);
    const data = await res.json();
    setEvents(data.events || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
  }, [projectId, page, limit, channel, search, favoritesOnly]);

  const fetchStats = useCallback(async () => {
    const res = await fetch(`/api/events/stats?project_id=${projectId}`);
    const data = await res.json();
    setStats(data);
  }, [projectId]);

  const fetchChannels = useCallback(async () => {
    const res = await fetch(`/api/events/channels?project_id=${projectId}`);
    const data = await res.json();
    setChannels(data);
  }, [projectId]);

  const fetchAllEventsForCharts = useCallback(async () => {
    const res = await fetch(
      `/api/events?project_id=${projectId}&page=1&limit=500`
    );
    const data = await res.json();
    setAllEvents(data.events || []);
  }, [projectId]);

  useEffect(() => {
    fetchEvents();
    fetchStats();
    fetchChannels();
    fetchAllEventsForCharts();
  }, [fetchEvents, fetchStats, fetchChannels, fetchAllEventsForCharts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, channel, favoritesOnly]);

  // Real-time updates
  useRealtimeEvents(projectId, (newEvent) => {
    setEvents((prev) => {
      // If updating existing event, replace it
      const idx = prev.findIndex((e) => e.id === newEvent.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newEvent;
        return updated;
      }
      // New event — prepend if on first page
      if (page === 1) {
        return [newEvent, ...prev].slice(0, limit);
      }
      return prev;
    });
    // Refresh stats
    fetchStats();
    fetchChannels();
  });

  async function handleToggleFavorite(id: string) {
    const res = await fetch(`/api/events/${id}/favorite`, { method: "PATCH" });
    if (res.ok) {
      const updated = await res.json();
      setEvents((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
    }
  }

  async function handleExport() {
    window.open(`/api/export?project_id=${projectId}`, "_blank");
  }

  async function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const res = await fetch(`/api/import?project_id=${projectId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Imported ${data.imported} events`);
          fetchEvents();
          fetchStats();
          fetchChannels();
        } else {
          toast.error(data.error || "Import failed");
        }
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    input.click();
  }

  const timelineChannels = stats
    ? Object.keys(stats.channelCounts)
    : [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KpiCards
        totalEvents={stats?.totalEvents || 0}
        eventsToday={stats?.eventsToday || 0}
        channelCount={stats?.channelCount || 0}
        criticalEvents={stats?.criticalEvents || 0}
      />

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <EventsTimeline
          data={stats?.timelineData || []}
          channels={timelineChannels}
        />
        <EventsByChannel channelCounts={stats?.channelCounts || {}} />
        <NeoScatter events={allEvents} />
        <SpaceWeatherBar events={allEvents} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <SearchBar value={search} onChange={setSearch} />
          <ChannelFilter
            channels={channels}
            value={channel}
            onChange={(v) => setChannel(v || "all")}
          />
          <Button
            variant={favoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className="gap-1.5"
          >
            <Star className="h-3.5 w-3.5" />
            Favorites
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import
          </Button>
        </div>
      </div>

      {/* Event Feed */}
      <EventFeed events={events} onToggleFavorite={handleToggleFavorite} />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}
