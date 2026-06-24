import { createClient } from "@supabase/supabase-js";
import { moderateContent } from "@/app/lib/content-moderation";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendCoachVideoEmail(athlete: any, title: string, videoUrl: string) {
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
      subject: `New video from ${athlete.first_name || "an athlete"}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #020713; color: #ffffff; padding: 32px;">
          <div style="max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.18); border-radius: 24px; padding: 28px; background: rgba(255,255,255,0.06);">
            <p style="letter-spacing: 4px; color: #bae6fd; font-size: 12px;">TIPS WITH T</p>
            <h1 style="font-size: 28px; margin: 0 0 12px;">New video submission</h1>
            <p style="color: #d1d5db; line-height: 1.7;">
              ${athlete.first_name || "An athlete"} ${athlete.last_initial || ""} submitted: ${title}
            </p>
            <p style="color: #bae6fd;">${athlete.athlete_code || ""}</p>
            <a href="${videoUrl}" style="display: inline-block; margin-top: 18px; border-radius: 999px; background: #e0f2fe; color: #000000; padding: 14px 22px; font-weight: 800; letter-spacing: 2px; text-decoration: none;">
              OPEN VIDEO
            </a>
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
    const title = body.title?.trim() || "";
    const videoUrl = body.videoUrl?.trim() || "";
    const athleteNotes = body.athleteNotes || "";
    const fileSizeMb =
      body.fileSizeMb === "" || body.fileSizeMb === null
        ? null
        : Number(body.fileSizeMb);

    if (!email || !athleteCode) {
      return Response.json(
        { error: "Email and athlete code are missing from this login session." },
        { status: 400 }
      );
    }

    if (!title || !videoUrl) {
      return Response.json(
        { error: "Video title and link are required." },
        { status: 400 }
      );
    }

    if (Number.isNaN(fileSizeMb)) {
      return Response.json(
        { error: "File size must be a number, like 85 or 5.9." },
        { status: 400 }
      );
    }

    if (fileSizeMb && fileSizeMb > 200) {
      return Response.json(
        { error: "Please keep video files under 200 MB." },
        { status: 400 }
      );
    }

    const moderation = await moderateContent(
      `Video title: ${title}\nVideo notes: ${athleteNotes}`
    );

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
      return Response.json(
        {
          error:
            athleteError?.message ||
            "Could not find athlete from this email and athlete code.",
        },
        { status: 404 }
      );
    }

    const { data: video, error: videoError } = await supabaseAdmin
      .from("video_submissions")
      .insert({
        athlete_id: athlete.id,
        title,
        video_url: videoUrl,
        athlete_notes: athleteNotes,
        file_size_mb: fileSizeMb,
        status: "submitted",
      })
      .select("*")
      .single();

    if (videoError) {
      return Response.json(
        {
          error: videoError.message,
          details: videoError.details,
          hint: videoError.hint,
          code: videoError.code,
        },
        { status: 500 }
      );
    }

    let emailed = false;

    try {
      emailed = await sendCoachVideoEmail(athlete, title, videoUrl);
    } catch {
      emailed = false;
    }

    return Response.json({
      success: true,
      video,
      emailed,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Could not submit video." },
      { status: 500 }
    );
  }
}
