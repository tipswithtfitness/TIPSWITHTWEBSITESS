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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";
    const athleteId = body.athleteId || "";
    const customMessage = body.message?.trim() || "";

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

    if (athleteError || !athlete) {
      return Response.json({ error: "Could not find athlete." }, { status: 404 });
    }

    if (!athlete.email) {
      return Response.json(
        { error: "This athlete does not have an email address." },
        { status: 400 }
      );
    }

    if (athlete.email_notifications_enabled === false) {
      return Response.json(
        { error: "Email notifications are turned off for this athlete." },
        { status: 400 }
      );
    }

    const firstName = athlete.first_name || "there";
    const message =
      customMessage ||
      "Just checking in. Your athlete dashboard is ready whenever you are. Log in to see your training updates, coach notes, and next steps.";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tips With T <coach@mail.tipswitht.com>",
        to: athlete.email,
        subject: "Your Tips With T dashboard is waiting",
        html: `
          <div style="font-family: Arial, sans-serif; background: #020713; color: #ffffff; padding: 32px;">
            <div style="max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.18); border-radius: 24px; padding: 28px; background: rgba(255,255,255,0.06);">
              <p style="letter-spacing: 4px; color: #bae6fd; font-size: 12px;">TIPS WITH T</p>
              <h1 style="font-size: 30px; margin: 0 0 12px;">Hey ${escapeHtml(firstName)},</h1>
              <p style="color: #d1d5db; line-height: 1.7; font-size: 16px;">
                ${escapeHtml(message)}
              </p>
              <div style="margin: 28px 0;">
                <a href="https://tipswitht.com/login" style="display: inline-block; border-radius: 999px; background: #e0f2fe; color: #000000; padding: 14px 22px; font-weight: 800; letter-spacing: 2px; text-decoration: none;">
                  OPEN DASHBOARD
                </a>
              </div>
              <p style="color: #9ca3af; line-height: 1.6; margin-top: 24px;">
                Use your email and athlete code to log in.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      return Response.json(
        { error: "The reminder email could not be sent." },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("athletes")
      .update({
        last_reminder_email_at: new Date().toISOString(),
        status_note: `Reminder sent ${new Date().toLocaleDateString()}`,
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", athleteId);

    return Response.json({
      success: true,
      message: "Reminder sent.",
    });
  } catch {
    return Response.json(
      { error: "Something went wrong sending the reminder." },
      { status: 500 }
    );
  }
}
