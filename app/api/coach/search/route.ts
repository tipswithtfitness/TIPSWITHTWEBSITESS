import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const allowedStatuses = ["active", "inactive", "archived", "all"];

function isCoach(password: string) {
  return password && password === process.env.COACH_DASHBOARD_PASSWORD;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";
    const search = body.search?.trim() || "";
    const status = allowedStatuses.includes(body.status)
      ? body.status
      : "active";

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    let query = supabaseAdmin.from("athletes").select("*");

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      const safeSearch = search.replaceAll(",", "").replaceAll("%", "");

      query = query.or(
        `athlete_code.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,first_name.ilike.%${safeSearch}%`
      );
    }

    const { data: athletes, error } = await query
      .order("first_name", { ascending: true })
      .limit(25);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      athletes: athletes || [],
    });
  } catch {
    return Response.json(
      { error: "Something went wrong searching athletes." },
      { status: 500 }
    );
  }
}
