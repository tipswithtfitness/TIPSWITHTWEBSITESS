import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isCoach(password: string) {
  return password && password === process.env.COACH_DASHBOARD_PASSWORD;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";
    const athleteId = body.athleteId || "";
    const note = body.note?.trim() || "";

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (!athleteId || !note) {
      return Response.json(
        { error: "Athlete and note are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("coach_notes")
      .insert({
        athlete_id: athleteId,
        coach_name: "Coach T",
        note,
        note_date: new Date().toISOString().slice(0, 10),
        is_pinned: false,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      note: data,
    });
  } catch {
    return Response.json(
      { error: "Something went wrong posting the note." },
      { status: 500 }
    );
  }
}
