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
    const search = body.search?.trim() || "";

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    if (!search) {
      return Response.json({ error: "Search is required." }, { status: 400 });
    }

    const safeSearch = search.replaceAll(",", "").replaceAll("%", "");
    const searchPattern = `%${safeSearch}%`;

    const { data: athletes, error } = await supabaseAdmin
      .from("athletes")
      .select("*")
      .or(
        `athlete_code.ilike.${searchPattern},email.ilike.${searchPattern},first_name.ilike.${searchPattern}`
      )
      .limit(10);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      athletes,
    });
  } catch {
    return Response.json(
      { error: "Something went wrong searching athletes." },
      { status: 500 }
    );
  }
}
