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

async function sendCoachNoteEmail(athlete: any, note: string) {
  if (!athlete.email) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Tips With T <coach@mail.tipswitht.com>",
      to: athlete.email,
      subject: "New coach note from Tips With T",
      html: `
        <div style="font-family: Arial, sans-serif; background: #020713; color: #ffffff; padding: 32px;">
          <div style="max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.18); border-radius: 24px; padding: 28px; background: rgba(255,255,255,0.06);">
            <p style="letter-spacing: 4px; color: #bae6fd; font-size: 12px;">TIPS WITH T</p>
            <h1 style="font-size: 30px; margin: 0 0 12px;">New coach note</h1>
            <p style="color: #d1d5db; line-height: 1.7; font-size: 16px;">
              Hey ${escapeHtml(athlete.first_name || "there")}, Coach T added a new note to your dashboard.
            </p>
            <div style="margin: 24px 0; padding: 18px; border-radius: 18px; background: rgba(224,242,254,0.10); border: 1px solid rgba(186,230,253,0.25); color: #e5e7eb; line-height: 1.7;">
              ${escapeHtml(note)}
            </div>
            <a href="https://tipswitht.com/login" style="display: inline-block; border-radius: 999px; background: #e0f2fe; color: #000000; padding: 14px 22px; font-weight: 800; letter-spacing: 2px; text-decoration: none;">
              OPEN DASHBOARD
            </a>
          </div>
        </div>
      `,
    }),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";
    const athleteId = body.athleteId || "";
    const note = body.note?.trim() || "";
    const notifyAthlete = body.notifyAthlete !== false;

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (!athleteId || !note) {
      return Response.json(
        { error: "Athlete and note are required." },
        { status: 400 }
      );
    }

    const { data: athlete, error: athleteError } = await supabaseAdmin
      .from("athletes")
      .select("*")
      .eq("id", athleteId)
      .single();

    if (athleteError || !athlete) {
      return Response.json({ error: "Could not find athlete." }, { status: 404 });
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

    if (notifyAthlete && athlete.email_notifications_enabled !== false) {
      await sendCoachNoteEmail(athlete, note);

      await supabaseAdmin
        .from("athletes")
        .update({
          last_update_email_at: new Date().toISOString(),
        })
        .eq("id", athleteId);
    }

    return Response.json({
      success: true,
      note: data,
      notified: notifyAthlete,
      notificationsEnabled: athlete.email_notifications_enabled !== false,
    });
  } catch {
    return Response.json(
      { error: "Something went wrong posting the note." },
      { status: 500 }
    );
  }
}
