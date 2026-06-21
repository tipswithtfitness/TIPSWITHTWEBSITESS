import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const athleteId = String(formData.get("athleteId") || "");
    const file = formData.get("file");

    if (!athleteId) {
      return Response.json({ error: "Athlete is required." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return Response.json({ error: "Photo is required." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json(
        { error: "Please choose an image file." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "Please choose an image smaller than 5 MB." },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split(".").pop() || "jpg";
    const filePath = `${athleteId}/${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("profile-photos")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return Response.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("profile-photos")
      .getPublicUrl(filePath);

    const profilePhotoUrl = publicUrlData.publicUrl;

    const { data: athlete, error: updateError } = await supabaseAdmin
      .from("athletes")
      .update({
        profile_photo_url: profilePhotoUrl,
      })
      .eq("id", athleteId)
      .select()
      .single();

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      athlete,
      profilePhotoUrl,
    });
  } catch {
    return Response.json(
      { error: "Something went wrong uploading the profile photo." },
      { status: 500 }
    );
  }
}
