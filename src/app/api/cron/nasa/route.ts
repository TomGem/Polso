import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { fetchDonkiNotifications, mapDonkiToEvents } from "@/lib/nasa/donki";
import { fetchNeoFeed, mapNeoToEvents } from "@/lib/nasa/neo";

async function ingestNasaData(projectId: string) {
  const supabase = createServerClient();
  let insertedCount = 0;

  // Fetch and ingest DONKI notifications
  try {
    const notifications = await fetchDonkiNotifications();
    const donkiEvents = mapDonkiToEvents(notifications);

    for (const event of donkiEvents) {
      // Deduplicate by messageID
      const messageID = (event.metadata as Record<string, unknown>).messageID as string;
      const { data: existing } = await supabase
        .from("events")
        .select("id")
        .eq("project_id", projectId)
        .eq("channel", "nasa-donki")
        .contains("metadata", { messageID })
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from("events").insert({
          ...event,
          project_id: projectId,
        });
        insertedCount++;
      }
    }
  } catch (e) {
    console.error("DONKI fetch error:", e);
  }

  // Fetch and ingest NEO data
  try {
    const asteroids = await fetchNeoFeed();
    const neoEvents = mapNeoToEvents(asteroids);

    for (const event of neoEvents) {
      // Deduplicate by asteroidId + closeApproachDate
      const { asteroidId, closeApproachDate } = event.metadata as Record<string, unknown>;
      const { data: existing } = await supabase
        .from("events")
        .select("id")
        .eq("project_id", projectId)
        .eq("channel", "nasa-neo")
        .contains("metadata", { asteroidId, closeApproachDate })
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from("events").insert({
          ...event,
          project_id: projectId,
        });
        insertedCount++;
      }
    }
  } catch (e) {
    console.error("NEO fetch error:", e);
  }

  return insertedCount;
}

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // Get the first project (or a dedicated NASA project)
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!project) {
    return NextResponse.json(
      { error: "No projects found. Create a project first." },
      { status: 404 }
    );
  }

  const insertedCount = await ingestNasaData(project.id);

  return NextResponse.json({
    success: true,
    inserted: insertedCount,
    timestamp: new Date().toISOString(),
  });
}

// Manual refresh from the dashboard (no cron secret required)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const projectId = body.project_id;

  if (!projectId) {
    return NextResponse.json({ error: "project_id is required" }, { status: 400 });
  }

  const insertedCount = await ingestNasaData(projectId);

  return NextResponse.json({
    success: true,
    inserted: insertedCount,
    timestamp: new Date().toISOString(),
  });
}
