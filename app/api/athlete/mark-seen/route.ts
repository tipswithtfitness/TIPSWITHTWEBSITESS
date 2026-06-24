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
    const type = body.type || "";

    if (!email || !athleteCode) {
      return Response.json(
        { error: "Email and athlete code are required." },
        { status: 400 }
      );
    }

    if (type !== "videos" && type !== "questions") {
      return Response.json(
        { error: "Seen type must be videos or questions." },
        { status: 400 }
      );
    }

    const { data: athlete, error: athleteError } = await supabaseAdmin
      .from("athletes")
      .select("id")
      .eq("email", email)
      .eq("athlete_code", athleteCode)
      .single();

    if (athleteError || !athlete) {
      return Response.json({ error: "Could not find athlete." }, { status: 404 });
    }

    const seenAt = new Date().toISOString();

    if (type === "questions") {
      const { error } = await supabaseAdmin
        .from("athlete_questions")
        .update({ athlete_seen_at: seenAt })
        .eq("athlete_id", athlete.id)
        .not("coach_answer", "is", null)
        .neq("coach_answer", "");

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({ success: true, type, seenAt });
    }

    const { error } = await supabaseAdmin
      .from("video_submissions")
      .update({ athlete_seen_at: seenAt })
      .eq("athlete_id", athlete.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, type, seenAt });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Could not mark updates as seen." },
      { status: 500 }
    );
  }
}
