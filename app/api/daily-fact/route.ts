import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getDayIndex(totalFacts: number) {
  const startDate = new Date("2026-01-01T00:00:00.000Z");
  const today = new Date();
  const utcToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  const daysSinceStart = Math.floor(
    (utcToday.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return ((daysSinceStart % totalFacts) + totalFacts) % totalFacts;
}

export async function GET() {
  try {
    const { count, error: countError } = await supabaseAdmin
      .from("daily_facts")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    if (countError) {
      return Response.json(
        {
          fact: "Small daily work compounds into real athletic growth.",
        },
        { status: 200 }
      );
    }

    const totalFacts = count || 0;

    if (!totalFacts) {
      return Response.json({
        fact: "Small daily work compounds into real athletic growth.",
      });
    }

    const factIndex = getDayIndex(totalFacts);

    const { data, error } = await supabaseAdmin
      .from("daily_facts")
      .select("fact_text, category, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .range(factIndex, factIndex)
      .single();

    if (error || !data) {
      return Response.json({
        fact: "Small daily work compounds into real athletic growth.",
      });
    }

    return Response.json({
      fact: data.fact_text,
      category: data.category,
      displayOrder: data.display_order,
      totalFacts,
    });
  } catch {
    return Response.json({
      fact: "Small daily work compounds into real athletic growth.",
    });
  }
}
