import { createClient } from "@supabase/supabase-js";
import { moderateContent } from "@/app/lib/content-moderation";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const maxQuestionChars = 1200;

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendCoachQuestionEmail(athlete: any, question: string) {
  if (!process.env.RESEND_API_KEY || !process.env.COACH_NOTIFICATION_EMAIL) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Tips With T <coach@mail.tipswitht.com>",
      to: process.env.COACH_NOTIFICATION_EMAIL,
      subject: `New question from ${athlete.first_name || "an athlete"}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #020713; color: #ffffff; padding: 32px;">
          <div style="max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.18); border-radius: 24px; padding: 28px; background: rgba(255,255,255,0.06);">
            <p style="letter-spacing: 4px; color: #bae6fd; font-size: 12px;">TIPS WITH T</p>
            <h1 style="font-size: 28px; margin: 0 0 12px;">New athlete question</h1>
            <p style="color: #bae6fd;">${escapeHtml(athlete.first_name || "Athlete")} ${escapeHtml(athlete.last_initial || "")} - ${escapeHtml(athlete.athlete_code || "")}</p>
            <div style="margin-top: 18px; padding: 18px; border-radius: 18px; background: rgba(224,242,254,0.10); color: #e5e7eb; line-height: 1.7;">
              ${escapeHtml(question)}
            </div>
          </div>
        </div>
      `,
    }),
  });

  return response.ok;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase() || "";
    const athleteCode = body.athleteCode?.trim() || "";
    const question = body.question?.trim() || "";

    if (!email || !athleteCode) {
      return Response.json(
        { error: "Email and athlete code are missing from this login session." },
        { status: 400 }
      );
    }

    if (!question) {
      return Response.json({ error: "Write a question first." }, { status: 400 });
    }

    if (question.length > maxQuestionChars) {
      return Response.json(
        { error: `Keep questions under ${maxQuestionChars} characters.` },
        { status: 400 }
      );
    }

    const moderation = await moderateContent(question);

    if (!moderation.allowed) {
      return Response.json(
        {
          error: moderation.warning,
          categories: moderation.categories,
        },
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

    const { data: savedQuestion, error: questionError } = await supabaseAdmin
      .from("athlete_questions")
      .insert({
        athlete_id: athlete.id,
        question,
        status: "new",
      })
      .select("*")
      .single();

    if (questionError) {
      return Response.json({ error: questionError.message }, { status: 500 });
    }

    let emailed = false;

    try {
      emailed = await sendCoachQuestionEmail(athlete, question);
    } catch {
      emailed = false;
    }

    return Response.json({
      success: true,
      question: savedQuestion,
      emailed,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Could not submit question." },
      { status: 500 }
    );
  }
}
