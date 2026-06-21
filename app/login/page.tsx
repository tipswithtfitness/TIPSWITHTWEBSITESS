"use client";

// ==============================
// IMPORTS AND SUPABASE CONNECTION
// ==============================
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==============================
// PROFILE WIDGET OPTIONS
// ==============================
const profileWidgetOptions = [
  { key: "favorite_event", label: "Favorite Event" },
  { key: "biggest_goal", label: "Biggest Goal" },
  { key: "motivation", label: "Motivation" },
  { key: "favorite_lift", label: "Favorite Lift" },
  { key: "pre_game_routine", label: "Pre-Game Routine" },
  { key: "recovery_style", label: "Recovery Style" },
  { key: "fun_fact", label: "Fun Fact" },
  { key: "anything_else", label: "Anything Else" },
];

// ==============================
// DATE HELPERS FOR COACH NOTES
// ==============================
function getRelativeNoteDate(dateValue: string) {
  if (!dateValue) return "Not dated";

  const posted = new Date(dateValue);
  const now = new Date();
  const difference = now.getTime() - posted.getTime();
  const daysAgo = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "1 day ago";
  if (daysAgo < 7) return `${daysAgo} days ago`;

  return posted.toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function getTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ==============================
// MAIN LOGIN PAGE COMPONENT
// ==============================
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [athleteCode, setAthleteCode] = useState("");
  const [athlete, setAthlete] = useState<any>(null);
  const [pendingAthlete, setPendingAthlete] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Training");
  const [dailyFact, setDailyFact] = useState("");
  const [coachNotes, setCoachNotes] = useState<any[]>([]);
  const [trainingWeeks, setTrainingWeeks] = useState<any[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedWidget, setSelectedWidget] = useState("");
  const [hasUnsavedProfileChanges, setHasUnsavedProfileChanges] =
    useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [isWelcomeLoading, setIsWelcomeLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // ==============================
  // LOAD DAILY GENERATED ATHLETE FACT
  // ==============================
  useEffect(() => {
    fetch("/api/daily-fact")
      .then((res) => res.json())
      .then((data) => setDailyFact(data.fact))
      .catch(() =>
        setDailyFact(
          "A curveball bends because spin changes how air pressure moves around the ball."
        )
      );
  }, []);

  // ==============================
  // FINISH SUNRISE LOADING SCREEN
  // Stays on-screen for 4 seconds.
  // ==============================
  useEffect(() => {
    if (!isWelcomeLoading || !pendingAthlete) return;

    const finishTimer = window.setTimeout(() => {
      setAthlete(pendingAthlete);
      setPendingAthlete(null);
      setIsWelcomeLoading(false);
      setActiveTab("Training");
      setLoading(false);
    }, 4000);

    return () => window.clearTimeout(finishTimer);
  }, [isWelcomeLoading, pendingAthlete]);

  // ==============================
  // HANDLE ATHLETE LOGIN
  // Works from clicking the button OR pressing Enter/Return.
  // ==============================
  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("athletes")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .eq("athlete_code", athleteCode.trim().toUpperCase())
      .single();

    if (error || !data) {
      setError("No athlete found with that email and athlete code.");
      setLoading(false);
      return;
    }

    // =============================
    // LAST LOGIN TRACKER
    // This updates Supabase every time an athlete logs in successfully.
    // Later, this helps us know who is active, inactive, or ready to archive.
    // =============================
    await supabase
      .from("athletes")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.id);

    const { data: notesData } = await supabase
      .from("coach_notes")
      .select("*")
      .eq("athlete_id", data.id)
      .order("created_at", { ascending: false });

    const { data: weeksData } = await supabase
      .from("training_weeks")
      .select("*")
      .eq("athlete_id", data.id)
      .order("week_number", { ascending: true });

    setCoachNotes(notesData || []);
    setTrainingWeeks(weeksData || []);
    setSelectedWeek(0);

    setPendingAthlete({
      ...data,
      profile_extras: data.profile_extras || {},
    });

    setIsWelcomeLoading(true);
  };

  // ==============================
  // CHANGE TABS SAFELY
  // Warns athletes before leaving Profile with unsaved edits.
  // ==============================
  const changeTab = (tab: string) => {
    if (activeTab === "Profile" && hasUnsavedProfileChanges) {
      setProfileNotice(
        "You have unsaved profile changes. Save your profile before leaving this tab, or your progress may be lost."
      );
      return;
    }

    setProfileNotice("");
    setActiveTab(tab);
  };

  // ==============================
  // UPDATE PROFILE FIELD LOCALLY
  // ==============================
  const updateProfileField = (field: string, value: string) => {
    setAthlete({ ...athlete, [field]: value });
    setHasUnsavedProfileChanges(true);
    setSaveMessage("");
  };

  // ==============================
  // UPDATE CUSTOM PROFILE WIDGET LOCALLY
  // ==============================
  const updateProfileExtra = (key: string, value: string) => {
    setAthlete({
      ...athlete,
      profile_extras: {
        ...(athlete.profile_extras || {}),
        [key]: value,
      },
    });
    setHasUnsavedProfileChanges(true);
    setSaveMessage("");
  };

  // ==============================
  // ADD CUSTOM PROFILE WIDGET
  // ==============================
  const addProfileWidget = () => {
    if (!selectedWidget) return;

    setAthlete({
      ...athlete,
      profile_extras: {
        ...(athlete.profile_extras || {}),
        [selectedWidget]: athlete.profile_extras?.[selectedWidget] || "",
      },
    });

    setHasUnsavedProfileChanges(true);
    setProfileNotice("");
  };

  // ==============================
  // SAVE PROFILE TO SUPABASE
  // ==============================
  const updateProfile = async () => {
    if (!athlete) return;

    setSaveMessage("Saving...");

    const { data, error } = await supabase
      .from("athletes")
      .update({
        profile_photo_url: athlete.profile_photo_url,
        bio: athlete.bio,
        goals: athlete.goals,
        sport: athlete.sport,
        event: athlete.event,
        profile_extras: athlete.profile_extras || {},
      })
      .eq("id", athlete.id)
      .select()
      .single();

    if (error) {
      setSaveMessage("Could not save yet. Check Supabase update permission.");
      return;
    }

    setAthlete({
      ...data,
      profile_extras: data.profile_extras || {},
    });
    setHasUnsavedProfileChanges(false);
    setProfileNotice("");
    setSaveMessage("Profile saved.");
  };

  // ==============================
  // SUNRISE WELCOME LOADING SCREEN
  // Shows after login succeeds and before dashboard appears.
  // ==============================
  if (isWelcomeLoading && pendingAthlete) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
        <video
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        >
          <source src="/risingsun.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-sky-950/20" />

        <div className="relative z-10 flex max-w-3xl flex-col items-center px-6 text-center">
          <div className="mb-8 h-28 w-28 overflow-hidden rounded-full border border-white/25 bg-white shadow-[0_0_60px_rgba(186,230,253,0.45)]">
            <img
              src="/bluetipswitht.png"
              alt="Tips With T"
              className="h-full w-full object-cover"
            />
          </div>

          <p className="text-xs uppercase tracking-[0.45em] text-sky-100/70">
            Fetching your data
          </p>

          <h1 className="mt-4 text-5xl font-black md:text-7xl">
            Welcome, {pendingAthlete.first_name || "Athlete"}{" "}
            {pendingAthlete.last_initial || ""}
          </h1>

          <p className="mt-8 text-lg uppercase tracking-[0.3em] text-sky-50/70">
            Welcome to a new day.
          </p>

          <div className="mt-10 h-2 w-72 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-full origin-left animate-[loadingBar_4s_ease-in-out_forwards] rounded-full bg-sky-100" />
          </div>

          <style jsx>{`
            @keyframes loadingBar {
              from {
                transform: scaleX(0);
              }
              to {
                transform: scaleX(1);
              }
            }
          `}</style>
        </div>
      </main>
    );
  }

  // ==============================
  // LOGGED-IN ATHLETE DASHBOARD
  // ==============================
  if (athlete) {
    const tabs = [
      "Training",
      "Profile",
      "Application",
      "Progress",
      "Videos",
      "Updates",
    ];

    const currentWeek = trainingWeeks[selectedWeek];

    const applicationItems = [
      ["Category", athlete.service || athlete.category],
      ["Journey", athlete.journey],
      ["About", athlete.about],
      ["Special event", athlete.special_event],
      ["Event details", athlete.event_details],
      ["Body weight", athlete.body_weight],
      ["Is sprinter", athlete.is_sprinter],
      ["Max squat", athlete.max_squat],
      ["Max RDL", athlete.max_rdl],
      ["Max dumbbell push press", athlete.max_dumbbell_push_press],
      ["Personal records", athlete.personal_records],
      ["Training period", athlete.training_period],
      ["Pricing option", athlete.pricing_option],
    ].filter((item) => item[1]);

    const activeProfileExtras = Object.keys(athlete.profile_extras || {});
    const availableProfileWidgets = profileWidgetOptions.filter(
      (option) => !activeProfileExtras.includes(option.key)
    );

    return (
      <main className="relative min-h-screen overflow-hidden bg-[#020713] px-6 py-10 text-white">
        {/* ============================== */}
        {/* SPACE BACKGROUND */}
        {/* ============================== */}
        <div
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px), radial-gradient(circle, rgba(147,197,253,0.7) 1px, transparent 1px)",
            backgroundSize: "90px 90px, 140px 140px",
            backgroundPosition: "0 0, 38px 62px",
          }}
        />

        <div className="relative mx-auto max-w-7xl">
          {/* ============================== */}
          {/* DASHBOARD HEADER */}
          {/* ============================== */}
          <div className="relative overflow-hidden rounded-[2rem] border border-sky-200/20 bg-white/[0.07] p-6 shadow-[0_30px_100px_rgba(14,165,233,0.18)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-200/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-24 w-24 overflow-hidden rounded-full border border-sky-100/30 bg-sky-100/10 shadow-[0_0_35px_rgba(125,211,252,0.25)]">
                  {athlete.profile_photo_url ? (
                    <img
                      src={athlete.profile_photo_url}
                      alt="Athlete profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-black text-sky-100">
                      {(athlete.first_name || "A").slice(0, 1)}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-sky-100/60">
                    Tips With T Athlete Database
                  </p>
                  <h1 className="mt-2 text-4xl font-black">
                    {athlete.first_name || "Athlete"}{" "}
                    {athlete.last_initial || ""}
                  </h1>
                  <p className="mt-1 text-white/55">
                    Your training starts here.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:items-end">
                <div className="rounded-2xl border border-sky-100/20 bg-sky-100/10 px-5 py-3 text-left md:text-right">
                  <p className="text-xs uppercase tracking-[0.28em] text-sky-100/55">
                    Athlete Code
                  </p>
                  <p className="mt-1 font-bold tracking-[0.12em] text-sky-100">
                    {athlete.athlete_code}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAthlete(null);
                    window.location.href = "/";
                  }}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.2em] transition hover:bg-white hover:text-black"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* ============================== */}
            {/* MAIN DASHBOARD TABS */}
            {/* ============================== */}
            <div className="relative mt-8 flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => changeTab(tab)}
                  className={`rounded-full px-5 py-2 text-sm uppercase tracking-[0.18em] transition duration-300 ${
                    activeTab === tab
                      ? "bg-sky-100 text-black shadow-[0_0_30px_rgba(186,230,253,0.42)]"
                      : "border border-white/15 bg-white/5 text-white/70 hover:border-sky-200/50 hover:bg-sky-200/10 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ============================== */}
            {/* DAILY GENERATED ATHLETE FACT */}
            {/* ============================== */}
            <div className="relative mt-6 rounded-3xl border border-sky-200/20 bg-sky-300/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-100/70">
                Daily Athlete Science Fact
              </p>
              <p className="mt-2 text-lg leading-7 text-white/85">
                {dailyFact || "Generating today's fact..."}
              </p>
            </div>
          </div>

          {/* ============================== */}
          {/* MAIN CONTENT + COACH NOTES LAYOUT */}
          {/* ============================== */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* ============================== */}
            {/* LEFT MAIN CONTENT PANEL */}
            {/* ============================== */}
            <section className="rounded-[2rem] border border-sky-100/15 bg-white/[0.045] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              {/* ============================== */}
              {/* TRAINING TAB - DEFAULT FIRST VIEW */}
              {/* ============================== */}
              {activeTab === "Training" && (
                <div className="relative overflow-hidden rounded-[1.75rem] border border-sky-100/15 bg-gradient-to-br from-sky-950/70 via-[#061526] to-black p-6">
                  <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl" />
                  <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-sky-200/10 to-transparent" />

                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.35em] text-sky-100/50">
                      Training Plan
                    </p>
                    <h2 className="mt-3 text-4xl font-black">
                      {currentWeek
                        ? `Week ${currentWeek.week_number}`
                        : "Your First Week"}
                    </h2>
                    <p className="mt-3 max-w-2xl text-white/60">
                      A clear week-by-week space for your work, focus, and next
                      opportunity.
                    </p>

                    {trainingWeeks.length > 0 && (
                      <div className="mt-8 flex flex-wrap gap-3">
                        {trainingWeeks.map((week, index) => (
                          <button
                            key={week.id}
                            onClick={() => setSelectedWeek(index)}
                            className={`rounded-full px-5 py-2 text-sm uppercase tracking-[0.18em] transition ${
                              selectedWeek === index
                                ? "bg-sky-100 text-black shadow-[0_0_30px_rgba(186,230,253,0.35)]"
                                : "border border-sky-100/15 bg-white/5 text-white/65 hover:bg-sky-100/10"
                            }`}
                          >
                            Week {week.week_number}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.07] p-6">
                      <p className="text-xs uppercase tracking-[0.28em] text-sky-100/50">
                        Focus
                      </p>
                      <h3 className="mt-2 text-2xl font-bold">
                        {currentWeek?.title ||
                          currentWeek?.focus ||
                          "Plan coming soon"}
                      </h3>

                      <p className="mt-5 whitespace-pre-line text-lg leading-8 text-white/78">
                        {currentWeek?.plan ||
                          athlete.plan ||
                          "Your week-by-week training plan will appear here once Coach T adds it."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================== */}
              {/* PROFILE TAB - EDITABLE ATHLETE PROFILE */}
              {/* ============================== */}
              {activeTab === "Profile" && (
                <div>
                  <h2 className="text-3xl font-bold">Your Profile</h2>
                  <p className="mb-8 mt-2 text-white/50">
                    Add details that make your athlete space feel like yours.
                  </p>

                  {profileNotice && (
                    <div className="mb-6 rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4 text-sm text-yellow-100">
                      {profileNotice}
                    </div>
                  )}

                  <div className="grid gap-5 md:grid-cols-2">
                    <input
                      placeholder="Profile photo URL"
                      value={athlete.profile_photo_url || ""}
                      onChange={(e) =>
                        updateProfileField("profile_photo_url", e.target.value)
                      }
                      className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 outline-none placeholder:text-white/35 focus:border-sky-200"
                    />

                    <input
                      placeholder="Sport"
                      value={athlete.sport || ""}
                      onChange={(e) =>
                        updateProfileField("sport", e.target.value)
                      }
                      className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 outline-none placeholder:text-white/35 focus:border-sky-200"
                    />

                    <input
                      placeholder="Main event or position"
                      value={athlete.event || ""}
                      onChange={(e) =>
                        updateProfileField("event", e.target.value)
                      }
                      className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 outline-none placeholder:text-white/35 focus:border-sky-200 md:col-span-2"
                    />

                    <textarea
                      placeholder="Bio"
                      value={athlete.bio || ""}
                      onChange={(e) =>
                        updateProfileField("bio", e.target.value)
                      }
                      className="min-h-32 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 outline-none placeholder:text-white/35 focus:border-sky-200 md:col-span-2"
                    />

                    <textarea
                      placeholder="Goals"
                      value={athlete.goals || ""}
                      onChange={(e) =>
                        updateProfileField("goals", e.target.value)
                      }
                      className="min-h-32 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 outline-none placeholder:text-white/35 focus:border-sky-200 md:col-span-2"
                    />
                  </div>

                  {/* ============================== */}
                  {/* PROFILE WIDGET MENU */}
                  {/* ============================== */}
                  <div className="mt-8 rounded-3xl border border-sky-100/15 bg-white/[0.05] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-sky-100/55">
                      Add More To Your Profile
                    </p>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row">
                      <select
                        value={selectedWidget}
                        onChange={(e) => setSelectedWidget(e.target.value)}
                        className="flex-1 rounded-2xl border border-white/15 bg-black/40 px-5 py-4 text-white outline-none focus:border-sky-200"
                      >
                        <option value="">Choose a profile box</option>
                        {availableProfileWidgets.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {selectedWidget && (
                        <button
                          onClick={addProfileWidget}
                          className="rounded-full border border-green-300/30 bg-green-300/10 px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-green-100 transition hover:bg-green-300 hover:text-black hover:shadow-[0_0_30px_rgba(134,239,172,0.35)]"
                        >
                          Add To Profile
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ============================== */}
                  {/* ACTIVE CUSTOM PROFILE WIDGETS */}
                  {/* ============================== */}
                  {activeProfileExtras.length > 0 && (
                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      {activeProfileExtras.map((key) => {
                        const option = profileWidgetOptions.find(
                          (item) => item.key === key
                        );

                        return (
                          <textarea
                            key={key}
                            placeholder={option?.label || "Profile detail"}
                            value={athlete.profile_extras?.[key] || ""}
                            onChange={(e) =>
                              updateProfileExtra(key, e.target.value)
                            }
                            className="min-h-28 rounded-2xl border border-sky-100/15 bg-white/10 px-5 py-4 outline-none placeholder:text-white/35 focus:border-sky-200"
                          />
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={updateProfile}
                    className="mt-6 rounded-full bg-sky-100 px-8 py-4 font-bold uppercase tracking-[0.25em] text-black transition hover:scale-[1.02]"
                  >
                    Save Profile
                  </button>

                  {saveMessage && (
                    <p className="mt-4 text-sm text-white/55">{saveMessage}</p>
                  )}
                </div>
              )}

              {/* ============================== */}
              {/* APPLICATION TAB */}
              {/* ============================== */}
              {activeTab === "Application" && (
                <div>
                  <h2 className="text-3xl font-bold">Application Snapshot</h2>
                  <p className="mb-8 mt-2 text-white/50">
                    These are the details from your original lesson request.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    {applicationItems.length > 0 ? (
                      applicationItems.map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-3xl border border-sky-100/15 bg-white/[0.06] p-5"
                        >
                          <p className="text-xs uppercase tracking-[0.25em] text-sky-100/55">
                            {label}
                          </p>
                          <p className="mt-2 text-lg text-white/85">{value}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/60">
                        Application details will appear here once this athlete
                        is connected to a full intake.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ============================== */}
              {/* PROGRESS / VIDEOS / UPDATES TABS */}
              {/* ============================== */}
              {activeTab === "Progress" && (
                <DashboardCard
                  eyebrow="Your Growth"
                  title="Progress"
                  text="Progress pictures, check-ins, and notes will appear here."
                />
              )}

              {activeTab === "Videos" && (
                <DashboardCard
                  eyebrow="Your Film Room"
                  title="Video Analysis"
                  text="Sprint, lift, and movement feedback will appear here."
                />
              )}

              {activeTab === "Updates" && (
                <DashboardCard
                  eyebrow="Your Next Steps"
                  title="Updates"
                  text="Messages, reminders, and updates from Tips With T will appear here."
                />
              )}
            </section>

            {/* ============================== */}
            {/* RIGHT SIDE COACH NOTES PANEL */}
            {/* ============================== */}
            <aside className="rounded-[2rem] border border-sky-100/20 bg-white/[0.06] p-5 shadow-[0_20px_70px_rgba(14,165,233,0.14)] backdrop-blur-xl lg:sticky lg:top-8 lg:self-start">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full border border-sky-100/25 bg-white shadow-[0_0_25px_rgba(186,230,253,0.24)]">
                  <img
                    src="/bluetipswitht.png"
                    alt="Coach T"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-sky-100/55">
                    Coach Notes
                  </p>
                  <h3 className="text-xl font-bold">From Coach T</h3>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                  Today's Date
                </p>
                <p className="mt-1 text-sm text-sky-100/80">
                  {getTodayLabel()}
                </p>
              </div>

              <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
                {coachNotes.length > 0 ? (
                  coachNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-2xl border border-sky-100/10 bg-sky-100/5 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-sky-100/50">
                        Posted {getRelativeNoteDate(note.created_at)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/80">
                        {note.note}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-sky-100/10 bg-sky-100/5 p-4 text-sm leading-6 text-white/70">
                    No notes posted.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-sky-100/10 bg-sky-100/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-sky-100/50">
                  Official
                </p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Notes in this panel are written by your coach.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  // ==============================
  // LOGIN SCREEN BEFORE DASHBOARD
  // Enter/Return works here because this is a real form.
  // Clicking Open Database also submits the same form.
  // ==============================
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020713] px-6 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px), radial-gradient(circle, rgba(147,197,253,0.8) 1px, transparent 1px)",
          backgroundSize: "88px 88px, 142px 142px",
          backgroundPosition: "0 0, 44px 55px",
        }}
      />

      <div className="relative w-full max-w-md rounded-[2rem] border border-sky-100/20 bg-white/5 p-8 shadow-[0_25px_90px_rgba(14,165,233,0.18)] backdrop-blur-xl">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-sky-100/55">
          Tips With T
        </p>

        <h1 className="mt-3 text-center text-4xl font-bold">Athlete Log In</h1>

        <p className="mt-3 text-center text-sm text-white/50">
          Enter the email and athlete code you received after submitting your
          lesson request.
        </p>

        <form

          className="mt-8 space-y-5"
          onSubmit={(handleSubmit) => {
            event.preventDefault();
            if (!loading) handleLogin();
          }}
        
        >
          
          <input
            type="email"
            placeholder="Example: demo@tipswitht.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-4 outline-none placeholder:text-white/35 focus:border-sky-200"
          />

          <input
            type="text"
            placeholder="Example: TIPS-DEMO-2026"
            value={athleteCode}
            onChange={(e) => setAthleteCode(e.target.value.toUpperCase())}
            className="w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-4 tracking-[0.12em] outline-none placeholder:text-white/35 focus:border-sky-200"
          />

          <p className="text-sm text-white/45">
            Include the hyphens exactly like your code shows.
          </p>

          {error && <p className="text-center text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-sky-100 px-6 py-4 font-bold uppercase tracking-[0.25em] text-black transition hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Checking..." : "Open Database"}
          </button>
        </form>
      </div>
    </main>
  );
}

// ==============================
// REUSABLE SIMPLE DASHBOARD CARD
// ==============================
function DashboardCard({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-100/15 bg-white/[0.06] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sky-300/10 blur-3xl" />
      <p className="relative text-xs uppercase tracking-[0.35em] text-sky-100/45">
        {eyebrow}
      </p>
      <h2 className="relative mt-3 text-4xl font-black">{title}</h2>
      <p className="relative mt-5 text-lg leading-8 text-white/65">{text}</p>
    </div>
  );
}
