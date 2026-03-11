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

  // Get distinct channels for a project
  const { data, error } = await supabase
    .from("events")
    .select("channel")
    .eq("project_id", projectId)
    .order("channel");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const channels = [...new Set(data?.map((d) => d.channel) || [])];
  return NextResponse.json(channels);
}
