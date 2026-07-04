import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isCoach(password: string) {
  return password && password === process.env.COACH_DASHBOARD_PASSWORD;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendTrainingWeekEmail(
  athlete: any,
  weekNumber: number,
  title: string,
  focus: string
) {
  if (!athlete.email || !process.env.RESEND_API_KEY) {
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tips With T <coach@mail.tipswitht.com>",
        to: athlete.email,
        subject: `Week ${weekNumber} training plan is ready`,
        html: `
          <div style="font-family: Arial, sans-serif; background: #020713; color: #ffffff; padding: 32px;">
            <div style="max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.18); border-radius: 24px; padding: 28px; background: rgba(255,255,255,0.06);">
              <p style="letter-spacing: 4px; color: #bae6fd; font-size: 12px;">TIPS WITH T</p>
              <h1 style="font-size: 30px; margin: 0 0 12px;">Week ${weekNumber} is ready</h1>
              <p style="color: #d1d5db; line-height: 1.7; font-size: 16px;">
                Hey ${escapeHtml(athlete.first_name || "there")}, Coach T added or updated your Week ${weekNumber} training plan.
              </p>
              <div style="margin: 24px 0; padding: 18px; border-radius: 18px; background: rgba(224,242,254,0.10); border: 1px solid rgba(186,230,253,0.25); color: #e5e7eb; line-height: 1.7;">
                <strong>${escapeHtml(title)}</strong>
                ${
                  focus
                    ? `<br /><span style="color: #cbd5e1;">${escapeHtml(focus)}</span>`
                    : ""
                }
              </div>
              <a href="https://tipswitht.com/login" style="display: inline-block; border-radius: 999px; background: #e0f2fe; color: #000000; padding: 14px 22px; font-weight: 800; letter-spacing: 2px; text-decoration: none;">
                OPEN DASHBOARD
              </a>
            </div>
          </div>
        `,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function archiveTrainingWeek(body: any, archivedAt: string | null) {
  const trainingWeekId = body.trainingWeekId || body.weekId || "";
  const athleteId = body.athleteId || "";
  const weekNumber = Number(body.weekNumber);
  const updatedAt = new Date().toISOString();

  if (!trainingWeekId && (!athleteId || !weekNumber)) {
    return Response.json(
      { error: "Training week id or athlete/week number is required." },
      { status: 400 }
    );
  }

  const baseQuery = supabaseAdmin.from("training_weeks").update({
    archived_at: archivedAt,
    updated_at: updatedAt,
  });

  const query = trainingWeekId
    ? baseQuery.eq("id", trainingWeekId)
    : baseQuery.eq("athlete_id", athleteId).eq("week_number", weekNumber);

  const { data, error } = await query.select().single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    trainingWeek: data,
    archived: Boolean(archivedAt),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";
    const action = body.action || "save";

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (action === "archive") {
      return archiveTrainingWeek(body, new Date().toISOString());
    }

    if (action === "restore") {
      return archiveTrainingWeek(body, null);
    }

    const athleteId = body.athleteId || "";
    const weekNumber = Number(body.weekNumber);
    const title = body.title?.trim() || "";
    const focus = body.focus?.trim() || "";
    const plan = body.plan?.trim() || "";
    const notifyAthlete = body.notifyAthlete !== false;

    if (!athleteId || !weekNumber || !title || !plan) {
      return Response.json(
        { error: "Athlete, week number, title, and plan are required." },
        { status: 400 }
      );
    }

    const { data: athlete, error: athleteError } = await supabaseAdmin
      .from("athletes")
      .select("*")
      .eq("id", athleteId)
      .single();

    if (athleteError || !athlete) {
      return Response.json(
        { error: "Could not find athlete." },
        { status: 404 }
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

    let notified = false;

    if (notifyAthlete && athlete.email_notifications_enabled !== false) {
      notified = await sendTrainingWeekEmail(athlete, weekNumber, title, focus);

      if (notified) {
        await supabaseAdmin
          .from("athletes")
          .update({
            last_update_email_at: new Date().toISOString(),
          })
          .eq("id", athleteId);
      }
    }

    return Response.json({
      success: true,
      trainingWeek: data,
      notified,
      notificationsEnabled: athlete.email_notifications_enabled !== false,
    });
  } catch {
    return Response.json(
      { error: "Something went wrong saving the training week." },
      { status: 500 }
    );
  }
}
