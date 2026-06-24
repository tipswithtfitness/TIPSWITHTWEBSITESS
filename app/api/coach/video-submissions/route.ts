import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const maxVideoFileSizeMb = 200;
const maxVideoTitleChars = 120;
const maxVideoNotesChars = 1200;

function isCoach(password: string) {
  return password && password === process.env.COACH_DASHBOARD_PASSWORD;
}

function isGoogleDriveLink(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      (host === "drive.google.com" || host === "docs.google.com")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";
    const athleteId = body.athleteId || "";
    const title = body.title?.trim() || "";
    const videoUrl = body.videoUrl?.trim() || "";
    const athleteNotes = body.athleteNotes || "";
    const fileSizeMb =
      body.fileSizeMb === "" || body.fileSizeMb === null
        ? null
        : Number(body.fileSizeMb);
    const status = body.status || "submitted";

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (!athleteId || !title || !videoUrl) {
      return Response.json(
        { error: "Athlete, title, and video link are required." },
        { status: 400 }
      );
    }

    if (title.length > maxVideoTitleChars) {
      return Response.json(
        { error: `Keep video titles under ${maxVideoTitleChars} characters.` },
        { status: 400 }
      );
    }

    if (athleteNotes.length > maxVideoNotesChars) {
      return Response.json(
        { error: `Keep video notes under ${maxVideoNotesChars} characters.` },
        { status: 400 }
      );
    }

    if (Number.isNaN(fileSizeMb)) {
      return Response.json(
        { error: "File size must be a number, like 85 or 5.9." },
        { status: 400 }
      );
    }

    if (fileSizeMb !== null && fileSizeMb <= 0) {
      return Response.json(
        { error: "File size must be greater than 0 MB." },
        { status: 400 }
      );
    }

    if (fileSizeMb && fileSizeMb > maxVideoFileSizeMb) {
      return Response.json(
        {
          error: `Keep video files under ${maxVideoFileSizeMb} MB so the site stays affordable.`,
        },
        { status: 400 }
      );
    }

    if (!isGoogleDriveLink(videoUrl)) {
      return Response.json(
        {
          error:
            "Use a Google Drive sharing link here. Keep the actual video file out of Supabase.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("video_submissions")
      .insert({
        athlete_id: athleteId,
        title,
        video_url: videoUrl,
        athlete_notes: athleteNotes,
        file_size_mb: Number.isNaN(fileSizeMb) ? null : fileSizeMb,
        status,
      })
      .select("*")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      video: data,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Could not save video submission." },
      { status: 500 }
    );
  }
}
