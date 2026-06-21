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
    const weekNumber = Number(body.weekNumber);
    const title = body.title?.trim() || "";
    const focus = body.focus?.trim() || "";
    const plan = body.plan?.trim() || "";

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (!athleteId || !weekNumber || !title || !plan) {
      return Response.json(
        { error: "Athlete, week number, title, and plan are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("training_weeks")
      .upsert(
        {
          athlete_id: athleteId,
          week_number: weekNumber,
          title,
          focus,
          plan,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "athlete_id,week_number",
        }
      )
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      trainingWeek: data,
    });
  } catch {
    return Response.json(
      { error: "Something went wrong saving the training week." },
      { status: 500 }
    );
  }
}
