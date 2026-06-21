import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const allowedStatuses = ["active", "inactive", "archived"];

function isCoach(password: string) {
  return password && password === process.env.COACH_DASHBOARD_PASSWORD;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";
    const athleteId = body.athleteId || "";
    const status = body.status || "";
    const statusNote = body.statusNote?.trim() || "";

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (!athleteId) {
      return Response.json({ error: "Athlete is required." }, { status: 400 });
    }

    if (!allowedStatuses.includes(status)) {
      return Response.json({ error: "Status is not valid." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("athletes")
      .update({
        status,
        status_note: statusNote,
        status_updated_at: new Date().toISOString(),
        archived_at: status === "archived" ? new Date().toISOString() : null,
      })
      .eq("id", athleteId)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      athlete: data,
    });
  } catch {
    return Response.json(
      { error: "Something went wrong updating the athlete status." },
      { status: 500 }
    );
  }
}
