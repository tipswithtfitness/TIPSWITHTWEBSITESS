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
    const entryDate = body.entryDate || new Date().toISOString().slice(0, 10);
    const metricType = body.metricType || "";
    const metricLabel = body.metricLabel || "";
    const metricValue =
      body.metricValue === "" || body.metricValue === null
        ? null
        : Number(body.metricValue);
    const metricUnit = body.metricUnit || "";
    const notes = body.notes || "";

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (!athleteId || !metricType || !metricLabel) {
      return Response.json(
        { error: "Athlete, metric type, and label are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("athlete_metrics")
      .insert({
        athlete_id: athleteId,
        entry_date: entryDate,
        metric_type: metricType,
        metric_label: metricLabel,
        metric_value: Number.isNaN(metricValue) ? null : metricValue,
        metric_unit: metricUnit,
        notes,
      })
      .select("*")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      metric: data,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Could not save progress metric." },
      { status: 500 }
    );
  }
}
