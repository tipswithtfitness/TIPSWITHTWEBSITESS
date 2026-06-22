import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isCoach(password: string) {
  return password && password === process.env.COACH_DASHBOARD_PASSWORD;
}

async function countAthletes(status?: string) {
  let query = supabaseAdmin
    .from("athletes")
    .select("id", { count: "exact", head: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";

    if (!isCoach(password)) {
      return Response.json({ error: "Not allowed." }, { status: 401 });
    }

    const [active, inactive, archived, all] = await Promise.all([
      countAthletes("active"),
      countAthletes("inactive"),
      countAthletes("archived"),
      countAthletes(),
    ]);

    return Response.json({
      success: true,
      counts: {
        active,
        inactive,
        archived,
        all,
      },
    });
  } catch {
    return Response.json(
      { error: "Something went wrong loading athlete counts." },
      { status: 500 }
    );
  }
}
