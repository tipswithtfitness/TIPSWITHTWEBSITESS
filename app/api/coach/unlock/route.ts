export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";

    if (!password || password !== process.env.COACH_DASHBOARD_PASSWORD) {
      return Response.json({ error: "Wrong coach password." }, { status: 401 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Something went wrong unlocking the dashboard." },
      { status: 500 }
    );
  }
}
