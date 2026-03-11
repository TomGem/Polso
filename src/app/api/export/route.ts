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

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  const exportData = {
    exportedAt: new Date().toISOString(),
    project: project
      ? { name: project.name, description: project.description }
      : null,
    events:
      events?.map((e) => ({
        channel: e.channel,
        title: e.title,
        description: e.description,
        tags: e.tags,
        metadata: e.metadata,
        icon: e.icon,
        importance: e.importance,
        favorited: e.favorited,
        created_at: e.created_at,
      })) || [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="events-export-${projectId}.json"`,
    },
  });
}
