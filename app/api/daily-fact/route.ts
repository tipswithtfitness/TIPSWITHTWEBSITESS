export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        input: `Generate one fresh, specific, non-generic fun fact for athletes about sports science, biomechanics, or physics.
  
  Today is ${today}.
  
  Rules:
  - 1 to 2 sentences only.
  - Make it interesting for athletes in any sport.
  - Include nuance, a common misconception, or a surprising example.
  - Rotate topics: sprinting, jumping, lifting, throwing, baseball, basketball, soccer, football, tennis, swimming, recovery, momentum, spin, force, friction, energy, reaction time.
  - Do not sound like a textbook.
  - Do not mention AI.
  - No hashtags.`,
      }),
    });

    const data = await response.json();

    return Response.json({
      fact:
        data.output_text ||
        "A curveball does not curve because it is thrown sideways. It bends because spin changes how air pressure moves around the ball.",
    });
  } catch {
    return Response.json({
      fact: "A curveball does not curve because it is thrown sideways. It bends because spin changes how air pressure moves around the ball.",
    });
  }
}
