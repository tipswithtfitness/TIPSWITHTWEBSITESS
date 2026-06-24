import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isCoach(password: string) {
  return password && password === process.env.COACH_DASHBOARD_PASSWORD;
}

const dayOrder: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";
    const athleteId = body.athleteId || "";
    const weekNumber = Number(body.weekNumber || 1);
    const days = Array.isArray(body.days) ? body.days : [];

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (!athleteId || !weekNumber) {
      return Response.json(
        { error: "Athlete and week number are required." },
        { status: 400 }
      );
    }

    const rows = days
      .filter((day: any) => day?.dayName && dayOrder[day.dayName])
      .map((day: any) => ({
        athlete_id: athleteId,
        week_number: weekNumber,
        day_name: day.dayName,
        focus: day.focus || "",
        workout: day.workout || "",
        coach_notes: day.coachNotes || "",
        sort_order: dayOrder[day.dayName],
      }));

    if (!rows.length) {
      return Response.json(
        { error: "At least one weekday is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("training_days")
      .upsert(rows, {
        onConflict: "athlete_id,week_number,day_name",
      })
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      days: data || [],
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Could not save training days." },
      { status: 500 }
    );
  }
}
