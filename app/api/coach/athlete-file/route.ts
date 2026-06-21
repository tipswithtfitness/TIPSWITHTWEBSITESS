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

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (!athleteId) {
      return Response.json({ error: "Athlete is required." }, { status: 400 });
    }

    const { data: athlete, error: athleteError } = await supabaseAdmin
      .from("athletes")
      .select("*")
      .eq("id", athleteId)
      .single();

    if (athleteError) {
      return Response.json({ error: athleteError.message }, { status: 500 });
    }

    const { data: coachNotes, error: coachNotesError } = await supabaseAdmin
      .from("coach_notes")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("note_date", { ascending: false })
      .limit(20);

    if (coachNotesError) {
      return Response.json({ error: coachNotesError.message }, { status: 500 });
    }

    const { data: trainingWeeks, error: trainingWeeksError } =
      await supabaseAdmin
        .from("training_weeks")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("week_number", { ascending: true });

    if (trainingWeeksError) {
      return Response.json(
        { error: trainingWeeksError.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      athlete,
      coachNotes: coachNotes || [],
      trainingWeeks: trainingWeeks || [],
    });
  } catch {
    return Response.json(
      { error: "Something went wrong loading the athlete file." },
      { status: 500 }
    );
  }
}
