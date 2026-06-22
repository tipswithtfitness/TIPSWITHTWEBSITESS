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
    const emailNotificationsEnabled = Boolean(body.emailNotificationsEnabled);

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (!athleteId) {
      return Response.json({ error: "Athlete is required." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("athletes")
      .update({
        email_notifications_enabled: emailNotificationsEnabled,
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
      { error: "Something went wrong updating email settings." },
      { status: 500 }
    );
  }
}
