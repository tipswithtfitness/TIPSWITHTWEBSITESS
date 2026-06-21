"use client";

import { useState } from "react";

type Athlete = {
  id: string;
  first_name: string;
  last_initial: string;
  email: string;
  athlete_code: string;
  service?: string;
  sport?: string;
  journey?: string;
  goals?: string;
  last_login_at?: string;
  status?: "active" | "inactive" | "archived";
  archived_at?: string;
  status_updated_at?: string;
  status_note?: string;
};

type CoachNote = {
  id: string;
  coach_name?: string;
  note: string;
  note_date?: string;
  created_at?: string;
  is_pinned?: boolean;
};

type TrainingWeek = {
  id: string;
  week_number: number;
  title: string;
  focus?: string;
  plan: string;
  updated_at?: string;
};

export default function CoachDashboardPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [search, setSearch] = useState("");
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  const [coachNotes, setCoachNotes] = useState<CoachNote[]>([]);
  const [trainingWeeks, setTrainingWeeks] = useState<TrainingWeek[]>([]);

  const [coachNote, setCoachNote] = useState("");

  const [weekNumber, setWeekNumber] = useState("1");
  const [weekTitle, setWeekTitle] = useState("");
  const [weekFocus, setWeekFocus] = useState("");
  const [weekPlan, setWeekPlan] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const unlockDashboard = async () => {
    if (!password.trim()) {
      setMessage("Enter your coach password first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Wrong coach password.");
        return;
      }

      setUnlocked(true);
      setMessage("");
    } catch {
      setMessage("Could not unlock dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const searchAthletes = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          search,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not search athletes.");
        return;
      }

      setAthletes(result.athletes || []);
    } catch {
      setMessage("Could not search athletes.");
    } finally {
      setLoading(false);
    }
  };

  const loadAthleteFile = async (athleteId: string) => {
    setFileLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/athlete-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          athleteId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not load athlete file.");
        return;
      }

      setSelectedAthlete(result.athlete);
      setCoachNotes(result.coachNotes || []);
      setTrainingWeeks(result.trainingWeeks || []);
      setStatusNote(result.athlete?.status_note || "");
    } catch {
      setMessage("Could not load athlete file.");
    } finally {
      setFileLoading(false);
    }
  };

  const chooseAthlete = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setCoachNotes([]);
    setTrainingWeeks([]);
    loadAthleteFile(athlete.id);
  };

  const updateAthleteStatus = async (
    status: "active" | "inactive" | "archived"
  ) => {
    if (!selectedAthlete) {
      setMessage("Choose an athlete first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/athlete-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          athleteId: selectedAthlete.id,
          status,
          statusNote,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not update athlete status.");
        return;
      }

      setSelectedAthlete(result.athlete);
      setStatusNote(result.athlete?.status_note || "");
      setAthletes((currentAthletes) =>
        currentAthletes.map((athlete) =>
          athlete.id === result.athlete.id ? result.athlete : athlete
        )
      );
      setMessage(`Athlete marked ${status}.`);
    } catch {
      setMessage("Could not update athlete status.");
    } finally {
      setLoading(false);
    }
  };

  const postCoachNote = async () => {
    if (!selectedAthlete) {
      setMessage("Choose an athlete first.");
      return;
    }

    if (!coachNote.trim()) {
      setMessage("Write a coach note first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          athleteId: selectedAthlete.id,
          note: coachNote,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not post coach note.");
        return;
      }

      setCoachNote("");
      setMessage("Coach note posted. The athlete can see it now.");
      await loadAthleteFile(selectedAthlete.id);
    } catch {
      setMessage("Could not post coach note.");
    } finally {
      setLoading(false);
    }
  };

  const postTrainingWeek = async () => {
    if (!selectedAthlete) {
      setMessage("Choose an athlete first.");
      return;
    }

    if (!weekTitle.trim() || !weekPlan.trim()) {
      setMessage("Week title and plan are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/training-weeks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          athleteId: selectedAthlete.id,
          weekNumber,
          title: weekTitle,
          focus: weekFocus,
          plan: weekPlan,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not save training week.");
        return;
      }

      setWeekTitle("");
      setWeekFocus("");
      setWeekPlan("");
      setMessage("Training week saved. The athlete can see it now.");
      await loadAthleteFile(selectedAthlete.id);
    } catch {
      setMessage("Could not save training week.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020713] px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-200/70">
              Tips With T
            </p>
            <h1 className="mt-3 text-4xl font-bold">Coach Dashboard</h1>
          </div>

          <button
            onClick={() => (window.location.href = "/")}
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white/70 transition hover:bg-white hover:text-black"
          >
            Home
          </button>
        </div>

        {!unlocked ? (
          <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-[0_25px_80px_rgba(14,165,233,0.15)]">
            <h2 className="text-2xl font-bold">Coach Access</h2>
            <p className="mt-3 text-white/55">
              Enter your private coach password to manage athletes.
            </p>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Coach password"
              className="mt-6 w-full rounded-2xl border border-white/15 bg-black/40 px-5 py-4 outline-none transition focus:border-sky-200"
            />

            <button
              onClick={unlockDashboard}
              disabled={loading}
              className="mt-5 w-full rounded-full bg-sky-100 px-6 py-4 font-bold uppercase tracking-[0.25em] text-black transition hover:bg-white disabled:opacity-60"
            >
              {loading ? "Checking..." : "Unlock"}
            </button>

            {message && <p className="mt-4 text-red-300">{message}</p>}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
              <h2 className="text-2xl font-bold">Find Athlete</h2>
              <p className="mt-2 text-sm text-white/50">
                Search by athlete code, email, or first name.
              </p>

              <div className="mt-5 flex gap-3">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Example: JESS-MQN..."
                  className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 outline-none transition focus:border-sky-200"
                />

                <button
                  onClick={searchAthletes}
                  disabled={loading}
                  className="rounded-2xl bg-sky-100 px-5 py-3 font-bold text-black transition hover:bg-white disabled:opacity-60"
                >
                  Search
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {athletes.map((athlete) => (
                  <button
                    key={athlete.id}
                    onClick={() => chooseAthlete(athlete)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedAthlete?.id === athlete.id
                        ? "border-sky-200 bg-sky-200/10"
                        : "border-white/10 bg-black/25 hover:bg-white/10"
                    }`}
                  >
                    <p className="font-bold">
                      {athlete.first_name} {athlete.last_initial}
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      {athlete.email}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-sky-200/70">
                      {athlete.athlete_code}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">
                      {athlete.status || "active"}
                    </p>
                  </button>
                ))}

                {!athletes.length && (
                  <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/45">
                    No athlete selected yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
              <h2 className="text-2xl font-bold">Athlete File</h2>

              {selectedAthlete ? (
                <>
                  <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-3xl font-bold">
                          {selectedAthlete.first_name}{" "}
                          {selectedAthlete.last_initial}
                        </p>
                        <p className="mt-2 text-white/55">
                          {selectedAthlete.email}
                        </p>
                      </div>

                      <p className="rounded-full border border-sky-100/20 bg-sky-100/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-100">
                        {selectedAthlete.athlete_code}
                      </p>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                            Athlete Status
                          </p>
                          <p className="mt-2 text-xl font-bold capitalize">
                            {selectedAthlete.status || "active"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateAthleteStatus("active")}
                            disabled={loading}
                            className="rounded-full border border-emerald-200/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100 transition hover:bg-emerald-200 hover:text-black disabled:opacity-60"
                          >
                            Active
                          </button>

                          <button
                            onClick={() => updateAthleteStatus("inactive")}
                            disabled={loading}
                            className="rounded-full border border-amber-200/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-100 transition hover:bg-amber-200 hover:text-black disabled:opacity-60"
                          >
                            Inactive
                          </button>

                          <button
                            onClick={() => updateAthleteStatus("archived")}
                            disabled={loading}
                            className="rounded-full border border-red-200/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-200 hover:text-black disabled:opacity-60"
                          >
                            Archive
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={statusNote}
                        onChange={(event) => setStatusNote(event.target.value)}
                        placeholder="Optional note, example: Paused for summer travel"
                        rows={3}
                        className="mt-4 w-full resize-none rounded-2xl border border-white/15 bg-black/35 px-4 py-3 outline-none transition focus:border-sky-200"
                      />

                      {selectedAthlete.status_updated_at && (
                        <p className="mt-3 text-xs text-white/40">
                          Status updated{" "}
                          {new Date(
                            selectedAthlete.status_updated_at
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/[0.05] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Service
                        </p>
                        <p className="mt-2">
                          {selectedAthlete.service || "None"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/[0.05] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Journey
                        </p>
                        <p className="mt-2">
                          {selectedAthlete.journey || "None"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/[0.05] p-4 sm:col-span-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Goals
                        </p>
                        <p className="mt-2 text-white/75">
                          {selectedAthlete.goals || "No goals added yet."}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/[0.05] p-4 sm:col-span-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Last Login
                        </p>
                        <p className="mt-2">
                          {selectedAthlete.last_login_at
                            ? new Date(
                                selectedAthlete.last_login_at
                              ).toLocaleString()
                            : "No login yet"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <h3 className="text-xl font-bold">Recent Coach Notes</h3>

                      {fileLoading ? (
                        <p className="mt-4 text-white/50">Loading notes...</p>
                      ) : coachNotes.length ? (
                        <div className="mt-4 space-y-3">
                          {coachNotes.map((note) => (
                            <div
                              key={note.id}
                              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                            >
                              <p className="text-sm text-white/45">
                                {note.note_date ||
                                  (note.created_at
                                    ? new Date(
                                        note.created_at
                                      ).toLocaleDateString()
                                    : "No date")}
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-white/80">
                                {note.note}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-white/50">
                          No coach notes posted yet.
                        </p>
                      )}
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <h3 className="text-xl font-bold">Training Weeks</h3>

                      {fileLoading ? (
                        <p className="mt-4 text-white/50">Loading weeks...</p>
                      ) : trainingWeeks.length ? (
                        <div className="mt-4 space-y-3">
                          {trainingWeeks.map((week) => (
                            <div
                              key={week.id}
                              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                            >
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200/70">
                                Week {week.week_number}
                              </p>
                              <p className="mt-2 font-bold">{week.title}</p>
                              {week.focus && (
                                <p className="mt-1 text-sm text-white/55">
                                  {week.focus}
                                </p>
                              )}
                              <p className="mt-3 whitespace-pre-wrap text-sm text-white/75">
                                {week.plan}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-white/50">
                          No training weeks saved yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                    <h3 className="text-xl font-bold">Post Coach Note</h3>

                    <textarea
                      value={coachNote}
                      onChange={(event) => setCoachNote(event.target.value)}
                      placeholder="Write a note this athlete will see..."
                      rows={6}
                      className="mt-4 w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                    />

                    <button
                      onClick={postCoachNote}
                      disabled={loading}
                      className="mt-4 rounded-full bg-sky-100 px-6 py-4 font-bold uppercase tracking-[0.2em] text-black transition hover:bg-white disabled:opacity-60"
                    >
                      Post Note
                    </button>
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                    <h3 className="text-xl font-bold">Post Training Week</h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr]">
                      <input
                        type="number"
                        min="1"
                        value={weekNumber}
                        onChange={(event) => setWeekNumber(event.target.value)}
                        placeholder="Week"
                        className="rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                      />

                      <input
                        value={weekTitle}
                        onChange={(event) => setWeekTitle(event.target.value)}
                        placeholder="Week title, example: Acceleration Foundation"
                        className="rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                      />
                    </div>

                    <input
                      value={weekFocus}
                      onChange={(event) => setWeekFocus(event.target.value)}
                      placeholder="Focus, example: Starts, posture, and smooth power"
                      className="mt-3 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                    />

                    <textarea
                      value={weekPlan}
                      onChange={(event) => setWeekPlan(event.target.value)}
                      placeholder="Write the training plan for this week..."
                      rows={8}
                      className="mt-3 w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                    />

                    <button
                      onClick={postTrainingWeek}
                      disabled={loading}
                      className="mt-4 rounded-full bg-sky-100 px-6 py-4 font-bold uppercase tracking-[0.2em] text-black transition hover:bg-white disabled:opacity-60"
                    >
                      Save Training Week
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-6 text-white/50">
                  Search for an athlete and choose their file.
                </p>
              )}

              {message && (
                <p className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sky-100">
                  {message}
                </p>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
