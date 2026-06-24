import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase() || "";
    const athleteCode = body.athleteCode?.trim() || "";

    if (!email || !athleteCode) {
      return Response.json(
        { error: "Email and athlete code are required." },
        { status: 400 }
      );
    }

    const { data: athlete, error: athleteError } = await supabaseAdmin
      .from("athletes")
      .select("*")
      .eq("email", email)
      .eq("athlete_code", athleteCode)
      .single();

    if (athleteError || !athlete) {
      return Response.json({ error: "Could not find athlete." }, { status: 404 });
    }

    const { data: trainingDays, error: trainingDaysError } = await supabaseAdmin
      .from("training_days")
      .select("*")
      .eq("athlete_id", athlete.id)
      .order("week_number", { ascending: true })
      .order("sort_order", { ascending: true });

    if (trainingDaysError) {
      return Response.json({ error: trainingDaysError.message }, { status: 500 });
    }

    const { data: athleteMetrics, error: athleteMetricsError } =
      await supabaseAdmin
        .from("athlete_metrics")
        .select("*")
        .eq("athlete_id", athlete.id)
        .order("entry_date", { ascending: false })
        .limit(100);

    if (athleteMetricsError) {
      return Response.json(
        { error: athleteMetricsError.message },
        { status: 500 }
      );
    }

    const { data: videoSubmissions, error: videoSubmissionsError } =
      await supabaseAdmin
        .from("video_submissions")
        .select("*")
        .eq("athlete_id", athlete.id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (videoSubmissionsError) {
      return Response.json(
        { error: videoSubmissionsError.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      trainingDays: trainingDays || [],
      athleteMetrics: athleteMetrics || [],
      videoSubmissions: videoSubmissions || [],
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Could not load athlete dashboard data." },
      { status: 500 }
    );
  }
}
