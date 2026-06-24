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

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    const { data: videoSubmissions, error: videoError } = await supabaseAdmin
      .from("video_submissions")
      .select(
        `
        *,
        athletes (
          id,
          first_name,
          last_initial,
          email,
          athlete_code,
          profile_photo_url
        )
      `
      )
      .is("coach_archived_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (videoError) {
      return Response.json({ error: videoError.message }, { status: 500 });
    }

    const { data: athleteQuestions, error: questionError } = await supabaseAdmin
      .from("athlete_questions")
      .select(
        `
        *,
        athletes (
          id,
          first_name,
          last_initial,
          email,
          athlete_code,
          profile_photo_url
        )
      `
      )
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(50);

    if (questionError) {
      return Response.json({ error: questionError.message }, { status: 500 });
    }

    const videos = videoSubmissions || [];
    const questions = athleteQuestions || [];

    return Response.json({
      success: true,
      counts: {
        totalVideos: videos.length,
        newVideos: videos.filter((video: any) => video.status === "submitted")
          .length,
        totalQuestions: questions.length,
        newQuestions: questions.filter(
          (question: any) => question.status === "new"
        ).length,
      },
      videoSubmissions: videos,
      athleteQuestions: questions,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Could not load coach notifications." },
      { status: 500 }
    );
  }
}
