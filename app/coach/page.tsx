"use client";

import { Fragment, useState } from "react";

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
  last_reminder_email_at?: string;
  last_update_email_at?: string;
  email_notifications_enabled?: boolean;
  profile_photo_url?: string;
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

type TrainingDay = {
  id?: string;
  week_number: number;
  day_name: string;
  focus?: string;
  workout?: string;
  coach_notes?: string;
  sort_order?: number;
};

type WorkoutSection = "warmups" | "plyos" | "cooldown" | "lift" | "workout";

const workoutSectionOptions: {
  key: WorkoutSection;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "warmups",
    label: "Warmups",
    placeholder: "Warmup drills, movement prep, mobility...",
  },
  {
    key: "plyos",
    label: "Plyos",
    placeholder: "Jumps, bounds, med ball, explosive work...",
  },
  {
    key: "cooldown",
    label: "Cooldown",
    placeholder: "Cooldown, breathing, stretching, recovery...",
  },
  {
    key: "lift",
    label: "Lift",
    placeholder: "Strength work, sets, reps, percentages...",
  },
  {
    key: "workout",
    label: "Workout",
    placeholder: "Main workout, conditioning, practice work...",
  },
];

const workoutSectionAliases: Record<WorkoutSection, string[]> = {
  warmups: ["warmup", "warmups", "warm up", "warm ups", "warm-up", "warm-ups"],
  plyos: ["plyo", "plyos", "plyometric", "plyometrics"],
  cooldown: ["cooldown", "cool down", "cool-down", "recovery"],
  lift: ["lift", "lifts", "lifting", "strength", "weight room", "weights"],
  workout: ["workout", "main workout", "conditioning", "session"],
};

function getWorkoutSectionFromHeading(line: string) {
  const normalizedLine = line
    .trim()
    .toLowerCase()
    .replace(/[()[\]{}]/g, "")
    .replace(/\s+/g, " ");

  for (const [section, aliases] of Object.entries(workoutSectionAliases)) {
    for (const alias of aliases) {
      if (
        normalizedLine === alias ||
        normalizedLine.startsWith(`${alias}:`) ||
        normalizedLine.startsWith(`${alias} -`) ||
        normalizedLine.startsWith(`${alias}--`)
      ) {
        return {
          section: section as WorkoutSection,
          remainder: line.slice(alias.length).replace(/^[:\-\s]+/, "").trim(),
        };
      }
    }
  }

  return null;
}

function getWorkoutSections(workout?: string) {
  const sections: Record<WorkoutSection, string[]> = {
    warmups: [],
    plyos: [],
    cooldown: [],
    lift: [],
    workout: [],
  };
  let activeSection: WorkoutSection | null = null;

  String(workout || "")
    .split(/\r?\n/)
    .forEach((line) => {
      const heading = getWorkoutSectionFromHeading(line);

      if (heading) {
        activeSection = heading.section;

        if (heading.remainder) {
          sections[activeSection].push(heading.remainder);
        }

        return;
      }

      if (activeSection) {
        sections[activeSection].push(line);
      }
    });

  return {
    warmups: sections.warmups.join("\n").trim(),
    plyos: sections.plyos.join("\n").trim(),
    cooldown: sections.cooldown.join("\n").trim(),
    lift: sections.lift.join("\n").trim(),
    workout: sections.workout.join("\n").trim(),
  };
}

function formatWorkoutSections(sections: Record<WorkoutSection, string>) {
  return workoutSectionOptions
    .map((option) => {
      const value = sections[option.key].trim();

      return value ? `${option.label}:\n${value}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

type AthleteMetric = {
  id: string;
  entry_date: string;
  metric_type: string;
  metric_label: string;
  metric_value?: number | null;
  metric_unit?: string;
  notes?: string;
};

type VideoSubmission = {
  id: string;
  title: string;
  video_url: string;
  athlete_notes?: string;
  file_size_mb?: number | null;
  status: "submitted" | "in_review" | "reviewed" | "returned";
  coach_feedback?: string;
  reviewed_video_url?: string;
  created_at?: string;
  athletes?: Athlete;
};

type AthleteQuestion = {
  id: string;
  question: string;
  status: "new" | "seen" | "answered" | "archived";
  coach_answer?: string;
  created_at?: string;
  athletes?: Athlete;
};

type VideoReviewDraft = {
  status: "submitted" | "in_review" | "reviewed" | "returned";
  coachFeedback: string;
  reviewedVideoUrl: string;
};

type AthleteStatusFilter = "active" | "inactive" | "archived" | "all";

type CoachTab =
  | "athletes"
  | "training"
  | "videos"
  | "studio"
  | "progress"
  | "messages"
  | "settings";

type AthleteCounts = {
  active: number;
  inactive: number;
  archived: number;
  all: number;
};

type NotificationCounts = {
  totalVideos: number;
  newVideos: number;
  totalQuestions: number;
  newQuestions: number;
};

const weekdayDrafts = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
].map((dayName, index) => ({
  week_number: 1,
  day_name: dayName,
  focus: "",
  workout: "",
  coach_notes: "",
  sort_order: index + 1,
}));

const progressMetricPresets = [
  {
    type: "calories_burned",
    label: "Calories burned",
    unit: "calories",
    helper: "Feeds calorie tables, line charts, column charts, and custom charts.",
  },
  {
    type: "training_completed",
    label: "Training completed",
    unit: "workouts",
    helper: "Feeds weekly completion tables and training progress charts.",
  },
  {
    type: "weight_goal",
    label: "Weight goal progress",
    unit: "%",
    helper: "Feeds the animated lava progress bar and weight goal charts.",
  },
  {
    type: "video_reviews",
    label: "Video reviews",
    unit: "videos",
    helper: "Feeds video review tables and video progress charts.",
  },
];

export default function CoachDashboardPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [activeCoachTab, setActiveCoachTab] = useState<CoachTab>("athletes");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AthleteStatusFilter>("active");
  const [athleteCounts, setAthleteCounts] = useState<AthleteCounts>({
    active: 0,
    inactive: 0,
    archived: 0,
    all: 0,
  });
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  const [coachNotes, setCoachNotes] = useState<CoachNote[]>([]);
  const [trainingWeeks, setTrainingWeeks] = useState<TrainingWeek[]>([]);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [athleteMetrics, setAthleteMetrics] = useState<AthleteMetric[]>([]);
  const [videoSubmissions, setVideoSubmissions] = useState<VideoSubmission[]>(
    []
  );
  const [allVideoSubmissions, setAllVideoSubmissions] = useState<
    VideoSubmission[]
  >([]);
  const [athleteQuestions, setAthleteQuestions] = useState<AthleteQuestion[]>(
    []
  );
  const [questionReplies, setQuestionReplies] = useState<
    Record<string, string>
  >({});
  const [notificationCounts, setNotificationCounts] =
    useState<NotificationCounts>({
      totalVideos: 0,
      newVideos: 0,
      totalQuestions: 0,
      newQuestions: 0,
    });

  const [coachNote, setCoachNote] = useState("");

  const [weekNumber, setWeekNumber] = useState("1");
  const [weekTitle, setWeekTitle] = useState("");
  const [weekFocus, setWeekFocus] = useState("");
  const [weekPlan, setWeekPlan] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [notifyAthlete, setNotifyAthlete] = useState(true);
  const [trainingDayWeekNumber, setTrainingDayWeekNumber] = useState("1");
  const [trainingDayDrafts, setTrainingDayDrafts] =
    useState<TrainingDay[]>(weekdayDrafts);
  const [metricType, setMetricType] = useState("calories_burned");
  const [metricLabel, setMetricLabel] = useState("Calories burned");
  const [metricValue, setMetricValue] = useState("");
  const [metricUnit, setMetricUnit] = useState("calories");
  const [metricEntryDate, setMetricEntryDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [metricNotes, setMetricNotes] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoSizeMb, setVideoSizeMb] = useState("");
  const [videoNotes, setVideoNotes] = useState("");
  const [videoReviewDrafts, setVideoReviewDrafts] = useState<
    Record<string, VideoReviewDraft>
  >({});
  const [studioVideoId, setStudioVideoId] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const loadAthleteCounts = async () => {
    try {
      const response = await fetch("/api/coach/athlete-counts", {
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
        return;
      }

      setAthleteCounts(
        result.counts || {
          active: 0,
          inactive: 0,
          archived: 0,
          all: 0,
        }
      );
    } catch {
      return;
    }
  };

  const loadCoachNotifications = async () => {
    try {
      const response = await fetch("/api/coach/notifications", {
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
        return;
      }

      setNotificationCounts(
        result.counts || {
          totalVideos: 0,
          newVideos: 0,
          totalQuestions: 0,
          newQuestions: 0,
        }
      );
      setAllVideoSubmissions(result.videoSubmissions || []);
      setAthleteQuestions(result.athleteQuestions || []);
      setQuestionReplies(
        (result.athleteQuestions || []).reduce(
          (drafts: Record<string, string>, question: AthleteQuestion) => {
            drafts[question.id] = question.coach_answer || "";
            return drafts;
          },
          {}
        )
      );
    } catch {
      return;
    }
  };

  const loadAthletes = async (
    filterOverride: AthleteStatusFilter = statusFilter
  ) => {
    setLoading(true);
    setMessage("");
    setHasSearched(true);

    try {
      const response = await fetch("/api/coach/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          search,
          status: filterOverride,
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
      setStatusFilter("active");
      await loadAthleteCounts();
      await loadCoachNotifications();
      await loadAthletes("active");
    } catch {
      setMessage("Could not unlock dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const searchAthletes = async () => {
    await loadAthletes(statusFilter);
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
      setTrainingDays(result.trainingDays || []);
      setAthleteMetrics(result.athleteMetrics || []);
      setVideoSubmissions(result.videoSubmissions || []);
      setVideoReviewDrafts(
        (result.videoSubmissions || []).reduce(
          (drafts: Record<string, VideoReviewDraft>, video: VideoSubmission) => {
            drafts[video.id] = {
              status: video.status || "submitted",
              coachFeedback: video.coach_feedback || "",
              reviewedVideoUrl: video.reviewed_video_url || "",
            };
            return drafts;
          },
          {}
        )
      );
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
    setTrainingDays([]);
    setAthleteMetrics([]);
    setVideoSubmissions([]);
    setStudioVideoId("");
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
        currentAthletes
          .map((athlete) =>
            athlete.id === result.athlete.id ? result.athlete : athlete
          )
          .filter(
            (athlete) =>
              statusFilter === "all" || athlete.status === statusFilter
          )
      );
      loadAthleteCounts();
      setMessage(`Athlete marked ${status}.`);
    } catch {
      setMessage("Could not update athlete status.");
    } finally {
      setLoading(false);
    }
  };

  const sendReminderEmail = async () => {
    if (!selectedAthlete) {
      setMessage("Choose an athlete first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/reminder-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          athleteId: selectedAthlete.id,
          message: reminderMessage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not send reminder.");
        return;
      }

      setReminderMessage("");
      setMessage("Reminder email sent.");
      loadAthleteFile(selectedAthlete.id);
    } catch {
      setMessage("Could not send reminder.");
    } finally {
      setLoading(false);
    }
  };

  const updateEmailSettings = async (enabled: boolean) => {
    if (!selectedAthlete) {
      setMessage("Choose an athlete first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/email-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          athleteId: selectedAthlete.id,
          emailNotificationsEnabled: enabled,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not update email settings.");
        return;
      }

      setSelectedAthlete(result.athlete);
      setMessage(
        enabled
          ? "Email notifications turned on."
          : "Email notifications turned off."
      );
    } catch {
      setMessage("Could not update email settings.");
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
          notifyAthlete,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not post coach note.");
        return;
      }

      setCoachNote("");
      setMessage(
        notifyAthlete
          ? "Coach note posted and athlete emailed."
          : "Coach note posted without email."
      );
      await loadAthleteFile(selectedAthlete.id);
    } catch {
      setMessage("Could not post coach note.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuestionReply = (questionId: string, answer: string) => {
    setQuestionReplies((current) => ({
      ...current,
      [questionId]: answer,
    }));
  };

  const answerAthleteQuestion = async (question: AthleteQuestion) => {
    const answer = (questionReplies[question.id] || "").trim();

    if (!answer) {
      setMessage("Write an answer first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          questionId: question.id,
          answer,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not send answer.");
        return;
      }

      setMessage("Answer sent to athlete updates.");
      await loadCoachNotifications();
    } catch {
      setMessage("Could not send answer.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuestionStatus = async (
    question: AthleteQuestion,
    status: "new" | "seen" | "answered" | "archived"
  ) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          questionId: question.id,
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not update question.");
        return;
      }

      setMessage(
        status === "archived"
          ? "Question archived."
          : "Question marked as seen."
      );
      await loadCoachNotifications();
    } catch {
      setMessage("Could not update question.");
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
          notifyAthlete,
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
      setMessage(
        notifyAthlete
          ? "Training week saved and athlete emailed."
          : "Training week saved without email."
      );
      await loadAthleteFile(selectedAthlete.id);
    } catch {
      setMessage("Could not save training week.");
    } finally {
      setLoading(false);
    }
  };

  const updateTrainingDayDraft = (
    dayName: string,
    field: "focus" | "coach_notes",
    value: string
  ) => {
    setTrainingDayDrafts((currentDays) =>
      currentDays.map((day) =>
        day.day_name === dayName ? { ...day, [field]: value } : day
      )
    );
  };

  const updateTrainingDayWorkoutSection = (
    dayName: string,
    section: WorkoutSection,
    value: string
  ) => {
    setTrainingDayDrafts((currentDays) =>
      currentDays.map((day) => {
        if (day.day_name !== dayName) {
          return day;
        }

        const sections = getWorkoutSections(day.workout);

        return {
          ...day,
          workout: formatWorkoutSections({
            ...sections,
            [section]: value,
          }),
        };
      })
    );
  };

  const saveTrainingDays = async () => {
    if (!selectedAthlete) {
      setMessage("Choose an athlete first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/training-days", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          athleteId: selectedAthlete.id,
          weekNumber: trainingDayWeekNumber,
          days: trainingDayDrafts.map((day) => ({
            dayName: day.day_name,
            focus: day.focus,
            workout: day.workout,
            coachNotes: day.coach_notes,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not save training days.");
        return;
      }

      setMessage("Monday-Friday training saved.");
      await loadAthleteFile(selectedAthlete.id);
    } catch {
      setMessage("Could not save training days.");
    } finally {
      setLoading(false);
    }
  };

  const applyMetricPreset = (presetType: string) => {
    const preset = progressMetricPresets.find(
      (option) => option.type === presetType
    );

    if (!preset) return;

    setMetricType(preset.type);
    setMetricLabel(preset.label);
    setMetricUnit(preset.unit);
  };

  const saveAthleteMetric = async () => {
    if (!selectedAthlete) {
      setMessage("Choose an athlete first.");
      return;
    }

    if (!metricLabel.trim()) {
      setMessage("Add a metric label first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/athlete-metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          athleteId: selectedAthlete.id,
          entryDate: metricEntryDate,
          metricType,
          metricLabel,
          metricValue,
          metricUnit,
          notes: metricNotes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not save progress metric.");
        return;
      }

      setMetricValue("");
      setMetricNotes("");
      setMessage("Progress metric saved.");
      await loadAthleteFile(selectedAthlete.id);
    } catch {
      setMessage("Could not save progress metric.");
    } finally {
      setLoading(false);
    }
  };

  const saveVideoSubmission = async () => {
    if (!selectedAthlete) {
      setMessage("Choose an athlete first.");
      return;
    }

    if (!videoTitle.trim() || !videoUrl.trim()) {
      setMessage("Video title and link are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/video-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          athleteId: selectedAthlete.id,
          title: videoTitle,
          videoUrl,
          fileSizeMb: videoSizeMb,
          athleteNotes: videoNotes,
          status: "submitted",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not save video submission.");
        return;
      }

      setVideoTitle("");
      setVideoUrl("");
      setVideoSizeMb("");
      setVideoNotes("");
      setMessage("Video submission saved.");
      await loadCoachNotifications();
      await loadAthleteFile(selectedAthlete.id);
    } catch {
      setMessage("Could not save video submission.");
    } finally {
      setLoading(false);
    }
  };

  const updateVideoReviewDraft = (
    videoId: string,
    field: keyof VideoReviewDraft,
    value: string
  ) => {
    setVideoReviewDrafts((current) => {
      const currentDraft = {
        status: current[videoId]?.status || "submitted",
        coachFeedback: current[videoId]?.coachFeedback || "",
        reviewedVideoUrl: current[videoId]?.reviewedVideoUrl || "",
      };

      return {
        ...current,
        [videoId]:
          field === "status"
            ? {
                ...currentDraft,
                status: value as VideoReviewDraft["status"],
              }
            : {
                ...currentDraft,
                [field]: value,
              },
      };
    });
  };

  const returnVideoReview = async (video: VideoSubmission) => {
    if (!selectedAthlete) {
      setMessage("Choose an athlete first.");
      return;
    }

    const draft = videoReviewDrafts[video.id] || {
      status: "returned",
      coachFeedback: "",
      reviewedVideoUrl: "",
    };

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/video-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          videoId: video.id,
          status: draft.status,
          coachFeedback: draft.coachFeedback,
          reviewedVideoUrl: draft.reviewedVideoUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not return video review.");
        return;
      }

      setMessage("Video review saved for athlete.");
      await loadCoachNotifications();
      await loadAthleteFile(selectedAthlete.id);
    } catch {
      setMessage("Could not return video review.");
    } finally {
      setLoading(false);
    }
  };

  const updateVideoInboxStatus = async (
    video: VideoSubmission,
    action: "in_review" | "archive"
  ) => {
    if (!selectedAthlete) {
      setMessage("Choose an athlete first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/coach/video-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          videoId: video.id,
          status: action === "in_review" ? "in_review" : video.status,
          archive: action === "archive",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not update video.");
        return;
      }

      setMessage(
        action === "archive" ? "Video archived." : "Video marked in review."
      );
      await loadCoachNotifications();
      await loadAthleteFile(selectedAthlete.id);
    } catch {
      setMessage("Could not update video.");
    } finally {
      setLoading(false);
    }
  };

  const notificationFeed = [
    ...allVideoSubmissions.map((video) => ({
      id: `video-${video.id}`,
      kind: "video" as const,
      rawId: video.id,
      title: video.title || "Untitled video",
      body: video.athlete_notes || "No athlete notes added.",
      status: video.status || "submitted",
      createdAt: video.created_at || "",
      athlete: video.athletes,
      actionLabel: "Review Video",
      targetTab: "studio" as CoachTab,
    })),
    ...athleteQuestions.map((question) => ({
      id: `question-${question.id}`,
      kind: "question" as const,
      rawId: question.id,
      title: "Athlete Question",
      body: question.question,
      status: question.status || "new",
      createdAt: question.created_at || "",
      athlete: question.athletes,
      actionLabel: "Reply",
      targetTab: "messages" as CoachTab,
    })),
  ].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime()
  );

  const openNotificationItem = (
    athlete: Athlete | undefined,
    targetTab: CoachTab,
    rawId = ""
  ) => {
    if (!athlete) {
      setMessage("This notification is missing an athlete connection.");
      return;
    }

    chooseAthlete(athlete);
    if (targetTab === "studio") {
      setStudioVideoId(rawId);
    }
    setActiveCoachTab(targetTab);
  };

  const openReviewStudio = (video: VideoSubmission) => {
    setStudioVideoId(video.id);
    setActiveCoachTab("studio");
  };

  const studioVideo =
    videoSubmissions.find((video) => video.id === studioVideoId) ||
    videoSubmissions.find((video) => video.status === "submitted") ||
    videoSubmissions[0] ||
    null;

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
          <div className="mt-10">
            <div className="flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-2">
              {[
                ["athletes", "Athletes"],
                ["training", "Training"],
                ["videos", "Videos"],
                ["studio", "Studio"],
                ["progress", "Progress"],
                ["messages", "Messages"],
                ["settings", "Settings"],
              ].map(([value, label]) => {
                const badgeCount =
                  value === "videos"
                    ? notificationCounts.newVideos
                    : value === "messages"
                    ? notificationCounts.newQuestions
                    : 0;

                return (
                  <button
                    key={value}
                    onClick={() => setActiveCoachTab(value as CoachTab)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition ${
                      activeCoachTab === value
                        ? "bg-sky-100 text-black"
                        : "text-white/55 hover:bg-white/10 hover:text-sky-100"
                    }`}
                  >
                    <span>{label}</span>

                    {badgeCount > 0 && (
                      <span
                        className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black tracking-normal ${
                          activeCoachTab === value
                            ? "bg-black text-sky-100"
                            : "bg-sky-100 text-black shadow-[0_0_16px_rgba(186,230,253,0.45)]"
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {message && (
              <p className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sky-100">
                {message}
              </p>
            )}

            <section className="mt-5 rounded-3xl border border-sky-100/15 bg-white/[0.05] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-100/55">
                    Coach Inbox
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    Notifications Center
                  </h2>
                </div>

                <button
                  onClick={loadCoachNotifications}
                  disabled={loading}
                  className="rounded-full border border-sky-100/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-100 transition hover:bg-sky-100 hover:text-black disabled:opacity-60"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {[
                  ["New Videos", notificationCounts.newVideos],
                  ["Total Videos", notificationCounts.totalVideos],
                  ["New Questions", notificationCounts.newQuestions],
                  ["Total Questions", notificationCounts.totalQuestions],
                ].map(([label, count]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-black/25 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      {label}
                    </p>
                    <p className="mt-2 text-3xl font-black">{count}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                      Newest First
                    </p>
                    <h3 className="mt-2 text-xl font-bold">
                      Videos + Questions
                    </h3>
                  </div>
                  <p className="text-sm text-white/45">
                    {notificationFeed.length} active inbox item
                    {notificationFeed.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {notificationFeed.slice(0, 8).length ? (
                    notificationFeed.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-100/25 bg-sky-100/10 font-bold text-sky-100">
                              {item.athlete?.profile_photo_url ? (
                                <img
                                  src={item.athlete.profile_photo_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                item.athlete?.first_name?.slice(0, 1) || "A"
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                                    item.kind === "video"
                                      ? "bg-purple-300/15 text-purple-100"
                                      : "bg-sky-300/15 text-sky-100"
                                  }`}
                                >
                                  {item.kind}
                                </span>
                                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                                  {item.status}
                                </span>
                              </div>

                              <p className="mt-2 truncate font-bold">
                                {item.title}
                              </p>
                              <p className="mt-1 max-h-10 overflow-hidden text-sm text-white/60">
                                {item.body}
                              </p>
                              <p className="mt-2 truncate text-xs text-white/40">
                                {item.athlete?.first_name || "Athlete"}{" "}
                                {item.athlete?.last_initial || ""} -{" "}
                                {item.athlete?.athlete_code || "No code"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            <button
                              onClick={() =>
                                openNotificationItem(
                                  item.athlete,
                                  item.targetTab,
                                  item.rawId
                                )
                              }
                              className="rounded-full bg-sky-100 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white"
                            >
                              {item.actionLabel}
                            </button>
                            <button
                              onClick={() =>
                                openNotificationItem(item.athlete, "athletes")
                              }
                              className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/65 transition hover:bg-white hover:text-black"
                            >
                              Open File
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/45">
                      No active video submissions or athlete questions yet.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {activeCoachTab === "athletes" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
              <h2 className="text-2xl font-bold">Find Athlete</h2>
              <p className="mt-2 text-sm text-white/50">
                Search by athlete code, email, or first name.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  ["active", "Active"],
                  ["inactive", "Inactive"],
                  ["archived", "Archived"],
                  ["all", "All"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      const nextFilter = value as AthleteStatusFilter;

                      setStatusFilter(nextFilter);
                      setAthletes([]);
                      setSelectedAthlete(null);
                      setCoachNotes([]);
                      setTrainingWeeks([]);
                      loadAthletes(nextFilter);
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
                      statusFilter === value
                        ? "bg-sky-100 text-black"
                        : "border border-white/10 bg-black/25 text-white/50 hover:border-sky-100/30 hover:text-sky-100"
                    }`}
                  >
                    {label}{" "}
                    <span className="ml-1 opacity-70">
                      {athleteCounts[value as AthleteStatusFilter]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-5 flex gap-3">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      searchAthletes();
                    }
                  }}
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

                <button
                  onClick={() => {
                    loadAthleteCounts();
                    loadAthletes(statusFilter);
                  }}
                  disabled={loading}
                  className="rounded-2xl border border-white/15 px-5 py-3 font-bold text-white/60 transition hover:border-sky-100/40 hover:text-sky-100 disabled:opacity-60"
                >
                  Refresh
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
                    <p className="mt-1 text-sm text-white/55">{athlete.email}</p>
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
                    {hasSearched
                      ? statusFilter === "all"
                        ? "No athletes found."
                        : `No ${statusFilter} athletes found.`
                      : "Choose a filter or search for an athlete."}
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
                        <p className="mt-2">{selectedAthlete.service || "None"}</p>
                      </div>

                      <div className="rounded-2xl bg-white/[0.05] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Journey
                        </p>
                        <p className="mt-2">{selectedAthlete.journey || "None"}</p>
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

                      <div className="rounded-2xl bg-white/[0.05] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Last Reminder Email
                        </p>
                        <p className="mt-2">
                          {selectedAthlete.last_reminder_email_at
                            ? new Date(
                                selectedAthlete.last_reminder_email_at
                              ).toLocaleString()
                            : "No reminder sent"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/[0.05] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Last Update Email
                        </p>
                        <p className="mt-2">
                          {selectedAthlete.last_update_email_at
                            ? new Date(
                                selectedAthlete.last_update_email_at
                              ).toLocaleString()
                            : "No update email sent"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/[0.05] p-4 sm:col-span-2">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                              Email Notifications
                            </p>
                            <p className="mt-2">
                              {selectedAthlete.email_notifications_enabled ===
                              false
                                ? "Off"
                                : "On"}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              updateEmailSettings(
                                selectedAthlete.email_notifications_enabled ===
                                  false
                              )
                            }
                            disabled={loading}
                            className="rounded-full border border-sky-100/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-100 transition hover:bg-sky-100 hover:text-black disabled:opacity-60"
                          >
                            {selectedAthlete.email_notifications_enabled === false
                              ? "Turn On"
                              : "Turn Off"}
                          </button>
                        </div>
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
                                    ? new Date(note.created_at).toLocaleDateString()
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
                    <h3 className="text-xl font-bold">Send Reminder Email</h3>
                    <p className="mt-2 text-sm text-white/50">
                      Send this athlete a quick reminder to open their dashboard.
                    </p>

                    <textarea
                      value={reminderMessage}
                      onChange={(event) => setReminderMessage(event.target.value)}
                      placeholder="Optional message. Leave blank to send the default reminder."
                      rows={4}
                      className="mt-4 w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                    />

                    <button
                      onClick={sendReminderEmail}
                      disabled={loading}
                      className="mt-4 rounded-full border border-sky-100/30 bg-sky-100/10 px-6 py-4 font-bold uppercase tracking-[0.2em] text-sky-100 transition hover:bg-sky-100 hover:text-black disabled:opacity-60"
                    >
                      Send Reminder
                    </button>
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                    <h3 className="text-xl font-bold">Post Coach Note</h3>

                    <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/65">
                      <input
                        type="checkbox"
                        checked={notifyAthlete}
                        onChange={(event) =>
                          setNotifyAthlete(event.target.checked)
                        }
                        className="h-4 w-4"
                      />
                      Notify athlete by email for notes and training updates
                    </label>

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

            </section>
          </div>
            )}

            {activeCoachTab === "training" && (
              <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-100/60">
                      Training Builder
                    </p>
                    <h2 className="mt-2 text-3xl font-bold">
                      Monday-Friday Plans
                    </h2>
                  </div>

                  {selectedAthlete && (
                    <p className="rounded-full border border-sky-100/20 bg-sky-100/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-100">
                      {selectedAthlete.athlete_code}
                    </p>
                  )}
                </div>

                {!selectedAthlete ? (
                  <p className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5 text-white/50">
                    Choose an athlete in the Athletes tab first.
                  </p>
                ) : (
                  <>
                    <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                      <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                        <input
                          type="number"
                          min="1"
                          value={trainingDayWeekNumber}
                          onChange={(event) =>
                            setTrainingDayWeekNumber(event.target.value)
                          }
                          className="rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                        />

                        <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/55">
                          Build Monday-Friday training for the selected athlete.
                        </p>
                      </div>

                      <div className="mt-5 space-y-3">
                        {trainingDayDrafts.map((day) => {
                          const sections = getWorkoutSections(day.workout);

                          return (
                            <div
                              key={day.day_name}
                              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                            >
                              <p className="font-bold text-sky-100">
                                {day.day_name}
                              </p>

                              <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]">
                                <input
                                  value={day.focus || ""}
                                  onChange={(event) =>
                                    updateTrainingDayDraft(
                                      day.day_name,
                                      "focus",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Focus"
                                  className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 outline-none transition focus:border-sky-200"
                                />

                                <textarea
                                  value={day.coach_notes || ""}
                                  onChange={(event) =>
                                    updateTrainingDayDraft(
                                      day.day_name,
                                      "coach_notes",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Coach notes"
                                  rows={3}
                                  className="resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-3 outline-none transition focus:border-sky-200"
                                />
                              </div>

                              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                {workoutSectionOptions.map((option) => (
                                  <label
                                    key={`${day.day_name}-${option.key}`}
                                    className="block rounded-2xl border border-white/10 bg-black/20 p-3"
                                  >
                                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100/60">
                                      {option.label}
                                    </span>

                                    <textarea
                                      value={sections[option.key]}
                                      onChange={(event) =>
                                        updateTrainingDayWorkoutSection(
                                          day.day_name,
                                          option.key,
                                          event.target.value
                                        )
                                      }
                                      placeholder={option.placeholder}
                                      rows={3}
                                      className="mt-2 w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-sky-200"
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={saveTrainingDays}
                        disabled={loading}
                        className="mt-5 rounded-full bg-sky-100 px-6 py-4 font-bold uppercase tracking-[0.2em] text-black transition hover:bg-white disabled:opacity-60"
                      >
                        Save Monday-Friday
                      </button>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.18em] text-white/45">
                          <tr>
                            <th className="px-4 py-4">Week</th>
                            <th className="px-4 py-4">Day</th>
                            <th className="px-4 py-4">Focus</th>
                            <th className="px-4 py-4">Workout</th>
                            <th className="px-4 py-4">Coach Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {trainingDays.length ? (
                            trainingDays.map((day) => (
                              <tr key={day.id} className="bg-black/20">
                                <td className="px-4 py-4">
                                  Week {day.week_number}
                                </td>
                                <td className="px-4 py-4 font-bold text-sky-100">
                                  {day.day_name}
                                </td>
                                <td className="px-4 py-4 text-white/65">
                                  {day.focus || "-"}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-4 text-white/65">
                                  {day.workout || "-"}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-4 text-white/65">
                                  {day.coach_notes || "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="bg-black/20">
                              <td
                                className="px-4 py-5 text-white/45"
                                colSpan={5}
                              >
                                No Monday-Friday training saved yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            )}

            {activeCoachTab === "videos" && (
              <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-100/60">
                      Video Review
                    </p>
                    <h2 className="mt-2 text-3xl font-bold">Video Inbox</h2>
                  </div>

                  {selectedAthlete && (
                    <p className="rounded-full border border-sky-100/20 bg-sky-100/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-100">
                      {selectedAthlete.athlete_code}
                    </p>
                  )}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    ["submitted", "Submitted"],
                    ["in_review", "In Review"],
                    ["returned", "Returned"],
                  ].map(([value, label]) => (
                    <div
                      key={value}
                      className="rounded-3xl border border-white/10 bg-black/25 p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                        {label}
                      </p>
                      <p className="mt-4 text-4xl font-black">
                        {
                          videoSubmissions.filter(
                            (video) => video.status === value
                          ).length
                        }
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-purple-200/20 bg-gradient-to-br from-purple-950/35 via-black/30 to-sky-950/30 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-100/60">
                        Review Workflow
                      </p>
                      <h3 className="mt-2 text-2xl font-bold">
                        Edit, Voiceover, Then Send Back
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
                        Keep the website light: athletes submit a Drive link,
                        you edit the file outside the website, upload the
                        reviewed version back to Drive, then paste that reviewed
                        link below and return it to the athlete.
                      </p>
                    </div>

                    <a
                      href="https://www.blackmagicdesign.com/products/davinciresolve"
                      target="_blank"
                      className="rounded-full border border-purple-100/30 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-purple-100 transition hover:bg-purple-100 hover:text-black"
                    >
                      Free Editor
                    </a>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    {[
                      [
                        "1",
                        "Open Original",
                        "Open the athlete's Google Drive link from this inbox.",
                      ],
                      [
                        "2",
                        "Edit + Mark Up",
                        "Use DaVinci Resolve for cuts, arrows, circles, text, slow motion, and voiceover.",
                      ],
                      [
                        "3",
                        "Upload Reviewed",
                        "Export the reviewed video and upload it to your reviewed Drive folder.",
                      ],
                      [
                        "4",
                        "Return Link",
                        "Paste the reviewed Drive link below, add feedback, and hit Return Video.",
                      ],
                    ].map(([step, title, text]) => (
                      <div
                        key={step}
                        className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200 text-sm font-black text-black">
                          {step}
                        </div>
                        <p className="mt-3 font-bold">{title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/50">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-sky-100/15 bg-sky-100/5 p-4 text-sm leading-6 text-sky-100/75">
                    Cost rule: do not upload raw videos into Supabase. Keep raw
                    and reviewed videos in Google Drive, and only save the links
                    here.
                  </div>
                </div>

                {!selectedAthlete ? (
                  <p className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5 text-white/50">
                    Choose an athlete in the Athletes tab first.
                  </p>
                ) : (
                  <>
                    <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                      <h3 className="text-xl font-bold">Add Video Link</h3>
                      <p className="mt-2 text-sm leading-6 text-white/50">
                        Use Google Drive links only and keep videos under 200
                        MB. The site saves the link, not the actual video file.
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <input
                          value={videoTitle}
                          onChange={(event) => setVideoTitle(event.target.value)}
                          placeholder="Video title"
                          className="rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                        />

                        <input
                          value={videoSizeMb}
                          onChange={(event) => setVideoSizeMb(event.target.value)}
                          placeholder="File size MB, example: 85"
                          className="rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                        />
                      </div>

                      <input
                        value={videoUrl}
                        onChange={(event) => setVideoUrl(event.target.value)}
                        placeholder="Google Drive or video link"
                        className="mt-3 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                      />

                      <textarea
                        value={videoNotes}
                        onChange={(event) => setVideoNotes(event.target.value)}
                        placeholder="Athlete notes or what to review"
                        rows={4}
                        className="mt-3 w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                      />

                      <button
                        onClick={saveVideoSubmission}
                        disabled={loading}
                        className="mt-4 rounded-full bg-sky-100 px-6 py-4 font-bold uppercase tracking-[0.2em] text-black transition hover:bg-white disabled:opacity-60"
                      >
                        Save Video
                      </button>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                      <table className="w-full min-w-[780px] text-left text-sm">
                        <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.18em] text-white/45">
                          <tr>
                            <th className="px-4 py-4">Video</th>
                            <th className="px-4 py-4">Submitted</th>
                            <th className="px-4 py-4">Size</th>
                            <th className="px-4 py-4">Status</th>
                            <th className="px-4 py-4">Link</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {videoSubmissions.length ? (
                            videoSubmissions.map((video) => (
                              <Fragment key={video.id}>
                                <tr className="bg-black/20">
                                  <td className="px-4 py-4">
                                    <p className="font-bold">{video.title}</p>
                                    {video.athlete_notes && (
                                      <p className="mt-1 text-white/50">
                                        {video.athlete_notes}
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-white/65">
                                    {video.created_at
                                      ? new Date(
                                          video.created_at
                                        ).toLocaleDateString()
                                      : "-"}
                                  </td>
                                  <td className="px-4 py-4 text-white/65">
                                    {video.file_size_mb
                                      ? `${video.file_size_mb} MB`
                                      : "-"}
                                  </td>
                                  <td className="px-4 py-4 capitalize text-white/65">
                                    {video.status.replace("_", " ")}
                                  </td>
                                  <td className="px-4 py-4">
                                    <a
                                      href={video.video_url}
                                      target="_blank"
                                      className="font-bold text-sky-100 underline"
                                    >
                                      Open Original
                                    </a>

                                    {video.reviewed_video_url && (
                                      <a
                                        href={video.reviewed_video_url}
                                        target="_blank"
                                        className="mt-2 block font-bold text-purple-100 underline"
                                      >
                                        Open Reviewed
                                      </a>
                                    )}
                                  </td>
                                </tr>

                                <tr className="bg-black/30">
                                  <td colSpan={5} className="px-4 py-4">
                                    <div className="grid gap-3 lg:grid-cols-[1fr_1fr_180px_auto]">
                                      <textarea
                                        value={
                                          videoReviewDrafts[video.id]
                                            ?.coachFeedback || ""
                                        }
                                        onChange={(event) =>
                                          updateVideoReviewDraft(
                                            video.id,
                                            "coachFeedback",
                                            event.target.value
                                          )
                                        }
                                        placeholder="Feedback for this video..."
                                        rows={3}
                                        className="rounded-2xl border border-white/15 bg-black/45 px-4 py-3 outline-none placeholder:text-white/35 focus:border-sky-200"
                                      />

                                      <input
                                        value={
                                          videoReviewDrafts[video.id]
                                            ?.reviewedVideoUrl || ""
                                        }
                                        onChange={(event) =>
                                          updateVideoReviewDraft(
                                            video.id,
                                            "reviewedVideoUrl",
                                            event.target.value
                                          )
                                        }
                                        placeholder="Reviewed video link"
                                        className="rounded-2xl border border-white/15 bg-black/45 px-4 py-3 outline-none placeholder:text-white/35 focus:border-sky-200"
                                      />

                                      <select
                                        value={
                                          videoReviewDrafts[video.id]?.status ||
                                          video.status
                                        }
                                        onChange={(event) =>
                                          updateVideoReviewDraft(
                                            video.id,
                                            "status",
                                            event.target.value
                                          )
                                        }
                                        className="rounded-2xl border border-white/15 bg-black/45 px-4 py-3 outline-none focus:border-sky-200"
                                      >
                                        <option value="submitted">
                                          Submitted
                                        </option>
                                        <option value="in_review">
                                          In Review
                                        </option>
                                        <option value="reviewed">
                                          Reviewed
                                        </option>
                                        <option value="returned">
                                          Returned
                                        </option>
                                      </select>

                                      <button
                                        onClick={() => returnVideoReview(video)}
                                        disabled={loading}
                                        className="rounded-full bg-sky-100 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:opacity-50"
                                      >
                                        Return Video
                                      </button>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-3">
                                      {video.status === "submitted" && (
                                            <button
                                              onClick={() =>
                                                updateVideoInboxStatus(
                                                  video,
                                              "in_review"
                                            )
                                          }
                                          disabled={loading}
                                          className="rounded-full border border-sky-100/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-100 transition hover:bg-sky-100 hover:text-black disabled:opacity-50"
                                        >
                                          Mark In Review
                                            </button>
                                          )}

                                      <button
                                        onClick={() => openReviewStudio(video)}
                                        className="rounded-full border border-purple-100/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-purple-100 transition hover:bg-purple-100 hover:text-black"
                                      >
                                        Open Studio
                                      </button>

                                      <button
                                        onClick={() =>
                                          updateVideoInboxStatus(video, "archive")
                                        }
                                        disabled={loading}
                                        className="rounded-full border border-red-200/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-100 hover:text-black disabled:opacity-50"
                                      >
                                        Archive Video
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              </Fragment>
                            ))
                          ) : (
                            <tr className="bg-black/20">
                              <td
                                className="px-4 py-5 text-white/45"
                                colSpan={5}
                              >
                                No video submissions saved yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            )}

            {activeCoachTab === "studio" && (
              <section className="mt-6 rounded-3xl border border-purple-200/20 bg-gradient-to-br from-purple-950/30 via-white/[0.05] to-sky-950/25 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-100/60">
                      Review Studio
                    </p>
                    <h2 className="mt-2 text-3xl font-bold">
                      Video Review Workspace
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
                      Open the athlete video, make your edits or voiceover in
                      your editor, then paste the reviewed Drive link and send it
                      back from here.
                    </p>
                  </div>

                  {selectedAthlete && (
                    <p className="rounded-full border border-purple-100/25 bg-purple-100/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-100">
                      {selectedAthlete.athlete_code}
                    </p>
                  )}
                </div>

                {!selectedAthlete || !studioVideo ? (
                  <p className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5 text-white/50">
                    Choose a video from the notification center or Videos tab
                    first.
                  </p>
                ) : (
                  <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                        Original Video
                      </p>
                      <h3 className="mt-3 text-2xl font-bold">
                        {studioVideo.title}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">
                        {studioVideo.athlete_notes || "No athlete notes added."}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <a
                          href={studioVideo.video_url}
                          target="_blank"
                          className="rounded-full bg-sky-100 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:bg-white"
                        >
                          Open Original
                        </a>
                        <a
                          href="https://www.blackmagicdesign.com/products/davinciresolve"
                          target="_blank"
                          className="rounded-full border border-purple-100/30 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-purple-100 transition hover:bg-purple-100 hover:text-black"
                        >
                          Free Editor
                        </a>
                        {studioVideo.status === "submitted" && (
                          <button
                            onClick={() =>
                              updateVideoInboxStatus(studioVideo, "in_review")
                            }
                            disabled={loading}
                            className="rounded-full border border-sky-100/30 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-sky-100 transition hover:bg-sky-100 hover:text-black disabled:opacity-50"
                          >
                            Mark In Review
                          </button>
                        )}
                      </div>

                      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                          Studio Steps
                        </p>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-white/60">
                          <p>1. Open the original video link.</p>
                          <p>2. Draw, voiceover, slow down, or mark up outside the site.</p>
                          <p>3. Upload the reviewed export to Google Drive.</p>
                          <p>4. Paste the reviewed link and return it below.</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                        Return To Athlete
                      </p>

                      <textarea
                        value={
                          videoReviewDrafts[studioVideo.id]?.coachFeedback || ""
                        }
                        onChange={(event) =>
                          updateVideoReviewDraft(
                            studioVideo.id,
                            "coachFeedback",
                            event.target.value
                          )
                        }
                        placeholder="Write timestamps, corrections, cues, and what you want them to focus on..."
                        rows={8}
                        className="mt-4 w-full rounded-2xl border border-white/15 bg-black/45 px-4 py-3 outline-none placeholder:text-white/35 focus:border-sky-200"
                      />

                      <input
                        value={
                          videoReviewDrafts[studioVideo.id]?.reviewedVideoUrl ||
                          ""
                        }
                        onChange={(event) =>
                          updateVideoReviewDraft(
                            studioVideo.id,
                            "reviewedVideoUrl",
                            event.target.value
                          )
                        }
                        placeholder="Reviewed Google Drive link"
                        className="mt-3 w-full rounded-2xl border border-white/15 bg-black/45 px-4 py-3 outline-none placeholder:text-white/35 focus:border-sky-200"
                      />

                      <select
                        value={
                          videoReviewDrafts[studioVideo.id]?.status ||
                          studioVideo.status
                        }
                        onChange={(event) =>
                          updateVideoReviewDraft(
                            studioVideo.id,
                            "status",
                            event.target.value
                          )
                        }
                        className="mt-3 w-full rounded-2xl border border-white/15 bg-black/45 px-4 py-3 outline-none focus:border-sky-200"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="in_review">In Review</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="returned">Returned</option>
                      </select>

                      <button
                        onClick={() => returnVideoReview(studioVideo)}
                        disabled={loading}
                        className="mt-4 rounded-full bg-sky-100 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:bg-white disabled:opacity-50"
                      >
                        Return Video
                      </button>

                      <p className="mt-4 rounded-2xl border border-sky-100/15 bg-sky-100/5 p-4 text-sm leading-6 text-sky-100/70">
                        This sends the reviewed link and feedback back to the
                        athlete's Videos tab.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeCoachTab === "progress" && (
              <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-100/60">
                      Athlete Data
                    </p>
                    <h2 className="mt-2 text-3xl font-bold">Progress Tables</h2>
                  </div>

                  <select
                    value={metricType}
                    onChange={(event) => applyMetricPreset(event.target.value)}
                    className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-sky-200"
                  >
                    {progressMetricPresets.map((preset) => (
                      <option key={preset.type} value={preset.type}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 grid gap-3 lg:grid-cols-4">
                  {progressMetricPresets.map((preset) => (
                    <button
                      key={preset.type}
                      onClick={() => applyMetricPreset(preset.type)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        metricType === preset.type
                          ? "border-purple-200/50 bg-purple-300/15 text-white"
                          : "border-white/10 bg-black/25 text-white/60 hover:border-sky-100/25 hover:text-white"
                      }`}
                    >
                      <p className="text-sm font-bold">{preset.label}</p>
                      <p className="mt-2 text-xs leading-5 text-white/45">
                        {preset.helper}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-purple-300/25 bg-purple-500/10 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-100/60">
                        Weight Goal
                      </p>
                      <p className="mt-2 text-2xl font-bold">
                        Animated progress bar
                      </p>
                    </div>
                    <p className="text-sm font-bold text-purple-100">
                      {metricType === "weight_goal" && athleteMetrics.length
                        ? `${
                            athleteMetrics.find(
                              (metric) => metric.metric_type === "weight_goal"
                            )?.metric_value || 0
                          }%`
                        : "Preview"}
                    </p>
                  </div>

                  <div className="mt-5 h-8 overflow-hidden rounded-full border border-fuchsia-200/25 bg-black/60 shadow-[inset_0_0_18px_rgba(0,0,0,0.75),0_0_30px_rgba(168,85,247,0.28)]">
                    <div
                      className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-fuchsia-700 via-purple-500 to-cyan-300 shadow-[0_0_30px_rgba(216,180,254,0.85)]"
                      style={{
                        width:
                          metricType === "weight_goal"
                            ? `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  Number(
                                    athleteMetrics.find(
                                      (metric) =>
                                        metric.metric_type === "weight_goal"
                                    )?.metric_value || 33
                                  )
                                )
                              )}%`
                            : "33%",
                      }}
                    >
                      <span
                        className="absolute -inset-x-1 -inset-y-4 opacity-90 blur-[1px]"
                        style={{
                          background:
                            "radial-gradient(circle at 12% 45%, rgba(244,114,182,0.95) 0 9%, transparent 20%), radial-gradient(circle at 36% 58%, rgba(192,132,252,0.95) 0 12%, transparent 25%), radial-gradient(circle at 62% 40%, rgba(34,211,238,0.85) 0 10%, transparent 23%), radial-gradient(circle at 86% 62%, rgba(217,70,239,0.9) 0 11%, transparent 24%)",
                          backgroundSize: "220% 180%",
                          animation:
                            "lavaDrift 5.8s ease-in-out infinite alternate",
                        }}
                      />
                      <span
                        className="absolute -inset-x-8 -inset-y-5 opacity-70 blur-sm"
                        style={{
                          background:
                            "radial-gradient(circle at 18% 60%, rgba(125,211,252,0.9) 0 8%, transparent 20%), radial-gradient(circle at 52% 42%, rgba(232,121,249,0.9) 0 13%, transparent 27%), radial-gradient(circle at 78% 52%, rgba(168,85,247,0.9) 0 10%, transparent 24%)",
                          backgroundSize: "180% 220%",
                          animation:
                            "lavaDriftReverse 7s ease-in-out infinite alternate",
                        }}
                      />
                      <span
                        className="absolute inset-0 opacity-60"
                        style={{
                          background:
                            "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.65) 18%, transparent 36%)",
                          animation: "lavaShimmer 2.4s linear infinite",
                        }}
                      />
                      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between text-xs uppercase tracking-[0.18em] text-white/45">
                    <span>Start</span>
                    <span>Goal</span>
                  </div>
                </div>

                {!selectedAthlete ? (
                  <p className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5 text-white/50">
                    Choose an athlete in the Athletes tab first.
                  </p>
                ) : (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100/50">
                          Chart Data Entry
                        </p>
                        <h3 className="mt-2 text-xl font-bold">
                          Add Progress Entry
                        </h3>
                      </div>
                      <p className="text-sm text-white/45">
                        These numbers appear inside the athlete Progress tab.
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <input
                        type="date"
                        value={metricEntryDate}
                        onChange={(event) =>
                          setMetricEntryDate(event.target.value)
                        }
                        className="rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                      />

                      <input
                        value={metricLabel}
                        onChange={(event) => setMetricLabel(event.target.value)}
                        placeholder="Metric label"
                        className="rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                      />

                      <input
                        value={metricValue}
                        onChange={(event) => setMetricValue(event.target.value)}
                        placeholder="Value"
                        className="rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                      />

                      <input
                        value={metricUnit}
                        onChange={(event) => setMetricUnit(event.target.value)}
                        placeholder="Unit"
                        className="rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                      />
                    </div>

                    <textarea
                      value={metricNotes}
                      onChange={(event) => setMetricNotes(event.target.value)}
                      placeholder="Notes"
                      rows={4}
                      className="mt-3 w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                    />

                    <button
                      onClick={saveAthleteMetric}
                      disabled={loading}
                      className="mt-4 rounded-full bg-sky-100 px-6 py-4 font-bold uppercase tracking-[0.2em] text-black transition hover:bg-white disabled:opacity-60"
                    >
                      Save Progress
                    </button>
                  </div>
                )}

                <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.18em] text-white/45">
                      <tr>
                        <th className="px-4 py-4">Date</th>
                        <th className="px-4 py-4">Metric</th>
                        <th className="px-4 py-4">Value</th>
                        <th className="px-4 py-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {athleteMetrics.filter(
                        (metric) => metric.metric_type === metricType
                      ).length ? (
                        athleteMetrics
                          .filter((metric) => metric.metric_type === metricType)
                          .map((metric) => (
                            <tr key={metric.id} className="bg-black/20">
                              <td className="px-4 py-4 text-white/65">
                                {metric.entry_date}
                              </td>
                              <td className="px-4 py-4 font-bold text-sky-100">
                                {metric.metric_label}
                              </td>
                              <td className="px-4 py-4 text-white/65">
                                {metric.metric_value ?? "-"}{" "}
                                {metric.metric_unit || ""}
                              </td>
                              <td className="whitespace-pre-wrap px-4 py-4 text-white/65">
                                {metric.notes || "-"}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr className="bg-black/20">
                          <td className="px-4 py-5 text-white/45" colSpan={4}>
                            No entries saved for this progress view yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeCoachTab === "messages" && (
              <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-100/60">
                  Communication
                </p>
                <h2 className="mt-2 text-3xl font-bold">Athlete Questions</h2>

                <div className="mt-6 space-y-3">
                  {athleteQuestions.length ? (
                    athleteQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="rounded-2xl border border-white/10 bg-black/25 p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-bold">
                              {question.athletes?.first_name || "Athlete"}{" "}
                              {question.athletes?.last_initial || ""}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-sky-100/55">
                              {question.athletes?.athlete_code || "No code"}
                            </p>
                          </div>

                          <p className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/45">
                            {question.status}
                          </p>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap text-white/80">
                          {question.question}
                        </p>

                        {question.coach_answer && (
                          <div className="mt-4 rounded-2xl border border-sky-100/15 bg-sky-100/5 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100/55">
                              Current Answer
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-sky-100/85">
                              {question.coach_answer}
                            </p>
                          </div>
                        )}

                        <textarea
                          value={questionReplies[question.id] || ""}
                          onChange={(event) =>
                            updateQuestionReply(question.id, event.target.value)
                          }
                          placeholder="Write your answer for this athlete..."
                          className="mt-4 min-h-[130px] w-full rounded-2xl border border-white/15 bg-black/35 px-4 py-3 outline-none placeholder:text-white/35 focus:border-sky-200"
                        />

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <button
                            onClick={() => answerAthleteQuestion(question)}
                            disabled={loading}
                            className="rounded-full bg-sky-100 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:bg-white disabled:opacity-50"
                          >
                            Send Answer
                          </button>

                          {question.status === "new" && (
                            <button
                              onClick={() =>
                                updateQuestionStatus(question, "seen")
                              }
                              disabled={loading}
                              className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/65 transition hover:bg-white hover:text-black disabled:opacity-50"
                            >
                              Mark Seen
                            </button>
                          )}

                          {question.status !== "archived" && (
                            <button
                              onClick={() =>
                                updateQuestionStatus(question, "archived")
                              }
                              disabled={loading}
                              className="rounded-full border border-red-200/25 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-100 hover:text-black disabled:opacity-50"
                            >
                              Archive
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (question.athletes) {
                                chooseAthlete(question.athletes);
                                setActiveCoachTab("athletes");
                              }
                            }}
                            className="rounded-full border border-sky-100/30 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-sky-100 transition hover:bg-sky-100 hover:text-black"
                          >
                            Open Athlete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-black/25 p-5 text-white/55">
                      No athlete questions yet.
                    </p>
                  )}
                </div>
              </section>
            )}

            {activeCoachTab === "settings" && (
              <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-100/60">
                  Dashboard Settings
                </p>
                <h2 className="mt-2 text-3xl font-bold">Operations Rules</h2>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  {[
                    {
                      title: "Video Storage",
                      status: "Drive links only",
                      text: "Raw and reviewed videos stay in Google Drive. The website only saves the sharing links.",
                    },
                    {
                      title: "Upload Limit",
                      status: "200 MB max",
                      text: "Athlete video entries and coach-added video entries reject files listed over 200 MB.",
                    },
                    {
                      title: "Content Safety",
                      status: "OpenAI + local filter",
                      text: "Questions, video text, and profile photos are checked before they save.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-white/10 bg-black/25 p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                        {item.title}
                      </p>
                      <p className="mt-3 text-xl font-black text-sky-100">
                        {item.status}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/55">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-purple-200/20 bg-purple-300/10 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-100/65">
                      Required Environment Names
                    </p>
                    <div className="mt-4 grid gap-2 text-sm text-white/70">
                      {[
                        "NEXT_PUBLIC_SUPABASE_URL",
                        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
                        "SUPABASE_SERVICE_ROLE_KEY",
                        "COACH_DASHBOARD_PASSWORD",
                        "RESEND_API_KEY",
                        "COACH_NOTIFICATION_EMAIL",
                        "OPENAI_API_KEY",
                      ].map((envName) => (
                        <code
                          key={envName}
                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sky-100"
                        >
                          {envName}
                        </code>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-sky-100/15 bg-sky-100/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100/65">
                      Working Flow
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">
                      {[
                        "Athlete submits a Google Drive video link.",
                        "Coach inbox shows the video and athlete connection.",
                        "Coach edits in DaVinci Resolve or another free editor.",
                        "Coach uploads reviewed video to Google Drive.",
                        "Coach pastes reviewed link and returns it to the athlete.",
                      ].map((step, index) => (
                        <div
                          key={step}
                          className="flex gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-black">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    Secret Safety
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    This panel only lists environment variable names. It never
                    displays secret values, API keys, service role keys, or the
                    coach password.
                  </p>
                </div>
              </section>
            )}
          </div>
        )}
      </section>

      <style jsx global>{`
        @keyframes lavaDrift {
          0% {
            transform: translate3d(-18%, -8%, 0) scale(1.08);
            background-position: 0% 45%;
          }
          50% {
            transform: translate3d(10%, 10%, 0) scale(1.18);
            background-position: 80% 55%;
          }
          100% {
            transform: translate3d(22%, -6%, 0) scale(1.08);
            background-position: 140% 45%;
          }
        }

        @keyframes lavaDriftReverse {
          0% {
            transform: translate3d(20%, 10%, 0) scale(1.16);
            background-position: 120% 55%;
          }
          50% {
            transform: translate3d(-8%, -10%, 0) scale(1.05);
            background-position: 45% 45%;
          }
          100% {
            transform: translate3d(-24%, 8%, 0) scale(1.18);
            background-position: 0% 60%;
          }
        }

        @keyframes lavaShimmer {
          0% {
            transform: translateX(-130%);
          }
          100% {
            transform: translateX(130%);
          }
        }
      `}</style>
    </main>
  );
}
