import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================
// ATHLETE CODE GENERATOR
// Creates a login code automatically from the athlete name.
// Example: JESS-MQN9OWI9-6W5Y19
// =============================
function createAthleteCode(name: string) {
  const cleanName = name
    .trim()
    .split(" ")[0]
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();

  const firstPart = cleanName || "ATHLETE";
  const randomPartOne = Math.random().toString(36).slice(2, 10).toUpperCase();
  const randomPartTwo = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${firstPart}-${randomPartOne}-${randomPartTwo}`;
}

// =============================
// SMALL EMAIL SAFETY HELPER
// Keeps names from accidentally breaking the email HTML.
// =============================
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

    // =============================
    // BASIC BOT CHECK
    // If this hidden field has anything in it, it is probably a bot.
    // =============================
    if (body.website) {
      return Response.json({ error: "Submission blocked." }, { status: 400 });
    }

    const name = body.name?.trim() || "";
    const email = body.email?.trim().toLowerCase() || "";

    if (!name || !email) {
      return Response.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const [firstName, ...restOfName] = name.split(" ");
    const lastInitial = restOfName.length > 0 ? `${restOfName[0][0]}.` : "";
    const athleteCode = createAthleteCode(name);

    // =============================
    // CREATE ATHLETE IN SUPABASE
    // This saves the athlete automatically after the request form is submitted.
    // =============================
    const { data, error } = await supabaseAdmin
      .from("athletes")
      .insert({
        first_name: firstName,
        last_initial: lastInitial,
        email,
        athlete_code: athleteCode,
        service: body.category || body.service || "",
        journey: body.journey || "",
        goals: body.about || body.goals || "",
        body_weight: body.body_weight || "",
        training_period: body.training_period || "",
        sport: body.category || body.sport || "",
        event: body.event || "",
        bio: body.about || "",
        profile_photo_url: "",
        profile_extras: {},
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // =============================
    // EMAIL ATHLETE THEIR LOGIN CODE
    // This uses Resend through fetch, so no Resend import is needed.
    // =============================
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tips With T <coach@mail.tipswitht.com>",
        to: email,
        subject: "Your Tips With T athlete code",
        html: `
          <div style="font-family: Arial, sans-serif; background: #020713; color: #ffffff; padding: 32px;">
            <div style="max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.18); border-radius: 24px; padding: 28px; background: rgba(255,255,255,0.06);">
              <p style="letter-spacing: 4px; color: #bae6fd; font-size: 12px;">TIPS WITH T</p>
              <h1 style="font-size: 32px; margin: 0 0 12px;">Welcome, ${escapeHtml(
                firstName
              )}</h1>
              <p style="color: #d1d5db; line-height: 1.6;">
                Your athlete profile has been created. Use this code with your email to log into your athlete database.
              </p>

              <div style="margin: 28px 0; padding: 18px; border-radius: 18px; background: #e0f2fe; color: #000000; font-size: 22px; font-weight: 800; letter-spacing: 3px; text-align: center;">
                ${escapeHtml(athleteCode)}
              </div>

              <p style="color: #d1d5db; line-height: 1.6;">
                Login here:
                <a href="https://tipswitht.com/login" style="color: #bae6fd;">https://tipswitht.com/login</a>
              </p>

              <p style="color: #9ca3af; line-height: 1.6; margin-top: 24px;">
                Keep this code somewhere safe. You will need the exact hyphens when logging in.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      await supabaseAdmin.from("athletes").delete().eq("id", data.id);

      return Response.json(
        {
          error:
            "The athlete was not created because the email could not be sent.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      athlete: data,
      athleteCode,
    });
  } catch {
    return Response.json(
      { error: "Something went wrong creating this athlete." },
      { status: 500 }
    );
  }
}
