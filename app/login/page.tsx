"use client";

// ==============================
// IMPORTS AND SUPABASE CONNECTION
// ==============================
import { useEffect, useRef, useState } from "react";
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

const chartTypeOptions = [
  { key: "line", label: "Line" },
  { key: "area", label: "Area" },
  { key: "column", label: "Column" },
  { key: "bar", label: "Bar" },
  { key: "scatter", label: "Scatter" },
  { key: "pie", label: "Pie" },
  { key: "doughnut", label: "Doughnut" },
];

const chartXAxisOptions = [
  { key: "entry_date", label: "Date" },
  { key: "entry_number", label: "Entry Number" },
  { key: "metric_label", label: "Metric Label" },
];

const chartYAxisOptions = [
  { key: "calories_burned", label: "Calories Burned", unit: "calories" },
  { key: "training_completed", label: "Training Completed", unit: "%" },
  { key: "video_reviews", label: "Video Reviews", unit: "reviews" },
  { key: "weight_goal", label: "Weight Goal", unit: "%" },
];

const chartWidgetPresets: Record<
  string,
  {
    key: string;
    label: string;
    metricType: string;
    chartType: string;
    xValue: string;
    xLabel: string;
    yLabel: string;
  }
> = {
  calories_burned_line: {
    key: "calories_burned_line",
    label: "Calories Burned Line Chart",
    metricType: "calories_burned",
    chartType: "line",
    xValue: "entry_date",
    xLabel: "Date",
    yLabel: "Calories Burned",
  },
  calories_burned_chart: {
    key: "calories_burned_chart",
    label: "Calories Burned Column Chart",
    metricType: "calories_burned",
    chartType: "column",
    xValue: "entry_date",
    xLabel: "Date",
    yLabel: "Calories Burned",
  },
  training_completed_column: {
    key: "training_completed_column",
    label: "Training Completed Column Chart",
    metricType: "training_completed",
    chartType: "column",
    xValue: "entry_date",
    xLabel: "Date",
    yLabel: "Training Completed",
  },
  training_completed_chart: {
    key: "training_completed_chart",
    label: "Training Completed Column Chart",
    metricType: "training_completed",
    chartType: "column",
    xValue: "entry_date",
    xLabel: "Date",
    yLabel: "Training Completed",
  },
  video_reviews_bar: {
    key: "video_reviews_bar",
    label: "Video Reviews Bar Chart",
    metricType: "video_reviews",
    chartType: "bar",
    xValue: "entry_date",
    xLabel: "Date",
    yLabel: "Video Reviews",
  },
  video_reviews_chart: {
    key: "video_reviews_chart",
    label: "Video Reviews Bar Chart",
    metricType: "video_reviews",
    chartType: "bar",
    xValue: "entry_date",
    xLabel: "Date",
    yLabel: "Video Reviews",
  },
  weight_goal_area: {
    key: "weight_goal_area",
    label: "Weight Goal Area Chart",
    metricType: "weight_goal",
    chartType: "area",
    xValue: "entry_date",
    xLabel: "Date",
    yLabel: "Goal Progress",
  },
};

const progressWidgetGroups = [
  {
    label: "Progress Bars",
    options: [{ key: "weight_goal", label: "Weight Goal Lava Bar" }],
  },
  {
    label: "Tables",
    options: [
      { key: "calories_burned", label: "Calories Burned Table" },
      { key: "training_completed", label: "Training Completed Table" },
      { key: "video_reviews", label: "Video Reviews Table" },
    ],
  },
  {
    label: "Recommended Charts",
    options: [
      chartWidgetPresets.calories_burned_line,
      chartWidgetPresets.calories_burned_chart,
      chartWidgetPresets.training_completed_column,
      chartWidgetPresets.video_reviews_bar,
      chartWidgetPresets.weight_goal_area,
    ],
  },
  {
    label: "Custom Chart",
    options: [{ key: "chart_custom", label: "Custom Chart" }],
  },
];

const progressWidgetOptions = progressWidgetGroups.flatMap(
  (group) => group.options
);

const progressWidgetStorageKey = "__progress_widgets";
const customChartSettingsStorageKey = "__custom_progress_chart";
const defaultProgressWidgets = ["weight_goal"];
const defaultCustomChartSettings = {
  chartType: "line",
  xValue: "entry_date",
  metricType: "calories_burned",
};

function getSavedProgressWidgets(profileExtras: any) {
  const savedWidgets = profileExtras?.[progressWidgetStorageKey];

  if (!Array.isArray(savedWidgets)) {
    return defaultProgressWidgets;
  }

  const validWidgetKeys = [
    ...progressWidgetOptions.map((option) => option.key),
    ...Object.keys(chartWidgetPresets),
  ];
  const validSavedWidgets = savedWidgets.filter((widgetKey) =>
    validWidgetKeys.includes(widgetKey)
  );

  return validSavedWidgets;
}

function getSavedCustomChartSettings(profileExtras: any) {
  const savedSettings = profileExtras?.[customChartSettingsStorageKey];

  if (!savedSettings || typeof savedSettings !== "object") {
    return defaultCustomChartSettings;
  }

  return {
    chartType: chartTypeOptions.some(
      (option) => option.key === savedSettings.chartType
    )
      ? savedSettings.chartType
      : defaultCustomChartSettings.chartType,
    xValue: chartXAxisOptions.some(
      (option) => option.key === savedSettings.xValue
    )
      ? savedSettings.xValue
      : defaultCustomChartSettings.xValue,
    metricType: chartYAxisOptions.some(
      (option) => option.key === savedSettings.metricType
    )
      ? savedSettings.metricType
      : defaultCustomChartSettings.metricType,
  };
}

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

function escapePrintHtml(value: any) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type TrainingDay = {
  id?: string;
  week_number: number;
  day_name: string;
  focus?: string;
  workout?: string;
  coach_notes?: string;
  sort_order?: number;
};

type WorkoutCategory =
  | "all"
  | "warmups"
  | "plyos"
  | "cooldown"
  | "lift"
  | "workout";

const workoutCategoryOptions: { key: WorkoutCategory; label: string }[] = [
  { key: "all", label: "All Sections" },
  { key: "warmups", label: "Warmups" },
  { key: "plyos", label: "Plyos" },
  { key: "cooldown", label: "Cooldown" },
  { key: "lift", label: "Lift" },
  { key: "workout", label: "Workout" },
];

const workoutCategoryAliases: Record<Exclude<WorkoutCategory, "all">, string[]> =
  {
    warmups: ["warmup", "warmups", "warm up", "warm ups", "warm-up", "warm-ups"],
    plyos: ["plyo", "plyos", "plyometric", "plyometrics"],
    cooldown: ["cooldown", "cool down", "cool-down", "recovery"],
    lift: ["lift", "lifts", "lifting", "strength", "weight room", "weights"],
    workout: ["workout", "main workout", "conditioning", "session"],
  };

function getWorkoutCategoryLabel(category: WorkoutCategory) {
  return (
    workoutCategoryOptions.find((option) => option.key === category)?.label ||
    "Workout"
  );
}

function getWorkoutCategoryFromHeading(line: string) {
  const normalizedLine = line
    .trim()
    .toLowerCase()
    .replace(/[()[\]{}]/g, "")
    .replace(/\s+/g, " ");

  for (const [category, aliases] of Object.entries(workoutCategoryAliases)) {
    for (const alias of aliases) {
      if (
        normalizedLine === alias ||
        normalizedLine.startsWith(`${alias}:`) ||
        normalizedLine.startsWith(`${alias} -`) ||
        normalizedLine.startsWith(`${alias}--`)
      ) {
        return {
          category: category as Exclude<WorkoutCategory, "all">,
          remainder: line.slice(alias.length).replace(/^[:\-\s]+/, "").trim(),
        };
      }
    }
  }

  return null;
}

function getWorkoutSections(workout?: string) {
  const sections: Record<Exclude<WorkoutCategory, "all">, string[]> = {
    warmups: [],
    plyos: [],
    cooldown: [],
    lift: [],
    workout: [],
  };
  let activeCategory: Exclude<WorkoutCategory, "all"> | null = null;
  const unsectionedLines: string[] = [];

  String(workout || "")
    .split(/\r?\n/)
    .forEach((line) => {
      const heading = getWorkoutCategoryFromHeading(line);

      if (heading) {
        activeCategory = heading.category;

        if (heading.remainder) {
          sections[activeCategory].push(heading.remainder);
        }

        return;
      }

      if (activeCategory) {
        sections[activeCategory].push(line);
        return;
      }

      unsectionedLines.push(line);
    });

  const unsectionedWorkout = unsectionedLines.join("\n").trim();

  if (unsectionedWorkout) {
    sections.workout.unshift(unsectionedWorkout);
  }

  return {
    warmups: sections.warmups.join("\n").trim(),
    plyos: sections.plyos.join("\n").trim(),
    cooldown: sections.cooldown.join("\n").trim(),
    lift: sections.lift.join("\n").trim(),
    workout: sections.workout.join("\n").trim(),
  };
}

function getWorkoutTextForCategory(
  day: TrainingDay,
  selectedCategory: WorkoutCategory
) {
  if (selectedCategory === "all") {
    return day.workout || "-";
  }

  return getWorkoutSections(day.workout)[selectedCategory];
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
  athlete_seen_at?: string | null;
  created_at?: string;
};

type AthleteQuestion = {
  id: string;
  question: string;
  status: "new" | "seen" | "answered" | "archived";
  coach_answer?: string;
  athlete_seen_at?: string | null;
  created_at?: string;
};

// ==============================
// MAIN LOGIN PAGE COMPONENT
// ==============================
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [athleteCode, setAthleteCode] = useState("");
  // ==============================
  // REMEMBER LOGIN STATE
  // Keeps the athlete logged in on this device after a successful login.
  // ==============================
  const [rememberLogin, setRememberLogin] = useState(true);
  const [athlete, setAthlete] = useState<any>(null);
  const [pendingAthlete, setPendingAthlete] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Training");
  const [dailyFact, setDailyFact] = useState("");
  const [coachNotes, setCoachNotes] = useState<any[]>([]);
  const [trainingWeeks, setTrainingWeeks] = useState<any[]>([]);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [athleteMetrics, setAthleteMetrics] = useState<AthleteMetric[]>([]);
  const [videoSubmissions, setVideoSubmissions] = useState<VideoSubmission[]>(
    []
  );
  const [athleteQuestions, setAthleteQuestions] = useState<AthleteQuestion[]>(
    []
  );
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedTrainingDay, setSelectedTrainingDay] = useState("all");
  const [selectedWorkoutCategory, setSelectedWorkoutCategory] =
    useState<WorkoutCategory>("all");
  const [selectedMetricType, setSelectedMetricType] =
    useState("calories_burned");
  const [selectedProgressWidget, setSelectedProgressWidget] = useState("");
  const [activeProgressWidgets, setActiveProgressWidgets] = useState<string[]>(
    defaultProgressWidgets
  );
  const [customChartSettings, setCustomChartSettings] = useState(
    defaultCustomChartSettings
  );
  const [selectedWidget, setSelectedWidget] = useState("");
  const [hasUnsavedProfileChanges, setHasUnsavedProfileChanges] =
    useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoSizeMb, setVideoSizeMb] = useState("");
  const [videoNotes, setVideoNotes] = useState("");
  const [videoNotice, setVideoNotice] = useState("");
  const [athleteQuestion, setAthleteQuestion] = useState("");
  const [questionNotice, setQuestionNotice] = useState("");
  // =============================
  // PROFILE PHOTO UPLOAD STATE
  // Tracks when the athlete is uploading a new profile picture.
  // =============================
  const [photoUploading, setPhotoUploading] = useState(false);
  // =============================
  // UPLOAD PROFILE PHOTO
  // Lets the athlete click their profile circle and upload a picture.
  // The photo URL is saved in the background, but never shown as a form field.
  // =============================
  const uploadProfilePhoto = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!athlete || !file) {
      return;
    }

    setPhotoUploading(true);
    setProfileNotice("");

    try {
      const formData = new FormData();
      formData.append("athleteId", athlete.id);
      formData.append("file", file);

      const response = await fetch("/api/profile-photo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setProfileNotice(result.error || "Could not upload profile photo.");
        return;
      }

      setAthlete(result.athlete);
      setProfileNotice("Profile photo updated.");
    } catch {
      setProfileNotice("Could not upload profile photo.");
    } finally {
      setPhotoUploading(false);
      event.target.value = "";
    }
  };
  const [isWelcomeLoading, setIsWelcomeLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const loginVideoRef = useRef<HTMLVideoElement>(null);
  const [isEntryReady, setIsEntryReady] = useState(false);

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

  useEffect(() => {
    if (athlete || pendingAthlete) return;

    const video = loginVideoRef.current;
    const fallbackTimer = window.setTimeout(() => {
      setIsEntryReady(true);
    }, 2600);

    if (!video) {
      return () => window.clearTimeout(fallbackTimer);
    }

    video
      .play()
      .then(() => {
        setIsEntryReady(true);
      })
      .catch(() => {
        return;
      });

    return () => window.clearTimeout(fallbackTimer);
  }, [athlete, pendingAthlete]);

  // ==============================
  // LOAD ATHLETE DASHBOARD DATA
  // Pulls Monday-Friday training, progress metrics, and video submissions.
  // ==============================
  const loadAthleteDashboardData = async (
    loginEmail = email,
    loginCode = athleteCode
  ) => {
    try {
      const response = await fetch("/api/athlete/dashboard-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          athleteCode: loginCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return;
      }

      setTrainingDays(result.trainingDays || []);
      setAthleteMetrics(result.athleteMetrics || []);
      setVideoSubmissions(result.videoSubmissions || []);
      setAthleteQuestions(result.athleteQuestions || []);
    } catch {
      return;
    }
  };

  const addProgressWidget = () => {
    if (!selectedProgressWidget) return;

    if (activeProgressWidgets.includes(selectedProgressWidget)) {
      setSelectedProgressWidget("");
      return;
    }

    const nextWidgets = [...activeProgressWidgets, selectedProgressWidget];

    setActiveProgressWidgets(nextWidgets);
    saveProgressWidgets(nextWidgets);
    setSelectedProgressWidget("");
  };

  const removeProgressWidget = (widgetKey: string) => {
    const nextWidgets = activeProgressWidgets.filter((key) => key !== widgetKey);

    setActiveProgressWidgets(nextWidgets);
    saveProgressWidgets(nextWidgets);
  };

  const saveProgressWidgets = async (widgets: string[]) => {
    if (!athlete) return;

    const nextProfileExtras = {
      ...(athlete.profile_extras || {}),
      [progressWidgetStorageKey]: widgets,
    };

    setAthlete({
      ...athlete,
      profile_extras: nextProfileExtras,
    });

    try {
      await supabase
        .from("athletes")
        .update({
          profile_extras: nextProfileExtras,
        })
        .eq("id", athlete.id);
    } catch {
      return;
    }
  };

  const saveCustomChartSettings = async (
    nextSettings: typeof defaultCustomChartSettings
  ) => {
    if (!athlete) return;

    const nextProfileExtras = {
      ...(athlete.profile_extras || {}),
      [customChartSettingsStorageKey]: nextSettings,
    };

    setAthlete({
      ...athlete,
      profile_extras: nextProfileExtras,
    });

    try {
      await supabase
        .from("athletes")
        .update({
          profile_extras: nextProfileExtras,
        })
        .eq("id", athlete.id);
    } catch {
      return;
    }
  };

  const updateCustomChartSetting = (
    field: keyof typeof defaultCustomChartSettings,
    value: string
  ) => {
    const nextSettings = {
      ...customChartSettings,
      [field]: value,
    };

    setCustomChartSettings(nextSettings);
    saveCustomChartSettings(nextSettings);
  };

  // ==============================
  // SUBMIT ATHLETE VIDEO LINK
  // Keeps Supabase storage safe by saving a video link, not the actual file.
  // ==============================
  const submitVideo = async () => {
    if (!videoTitle.trim() || !videoUrl.trim()) {
      setVideoNotice("Add a video title and link first.");
      return;
    }

    setVideoNotice("");

    try {
      const response = await fetch("/api/athlete/video-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          athleteCode,
          title: videoTitle,
          videoUrl,
          fileSizeMb: videoSizeMb,
          athleteNotes: videoNotes,
        }),
      });

      const responseText = await response.text();
      let result: any = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = {
          error: `The video route did not return JSON. Status: ${
            response.status
          }. Response: ${responseText.slice(0, 180)}`,
        };
      }

      if (!response.ok) {
        setVideoNotice(
          result.error || `Could not submit video. Status: ${response.status}`
        );
        return;
      }

      setVideoTitle("");
      setVideoUrl("");
      setVideoSizeMb("");
      setVideoNotes("");
      setVideoNotice("Video submitted.");
      await loadAthleteDashboardData();
    } catch (error: any) {
      setVideoNotice(error?.message || "Could not submit video.");
    }
  };

  // ==============================
  // SUBMIT ATHLETE QUESTION
  // Sends the question to the coach notification bar.
  // ==============================
  const submitQuestion = async () => {
    if (!athleteQuestion.trim()) {
      setQuestionNotice("Write a question first.");
      return;
    }

    setQuestionNotice("");

    try {
      const response = await fetch("/api/athlete/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          athleteCode,
          question: athleteQuestion,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setQuestionNotice(result.error || "Could not submit question.");
        return;
      }

      setAthleteQuestion("");
      setQuestionNotice("Question sent.");
      await loadAthleteDashboardData();
    } catch {
      setQuestionNotice("Could not submit question.");
    }
  };

  // ==============================
  // HANDLE ATHLETE LOGIN
  // Works from clicking the button, pressing Enter/Return, or saved login.
  // ==============================
  const handleLogin = async (
    savedEmail?: string,
    savedAthleteCode?: string
  ) => {
    setLoading(true);
    setError("");

    const loginEmail = (savedEmail || email).trim().toLowerCase();
    const loginCode = (savedAthleteCode || athleteCode).trim().toUpperCase();

    const { data, error } = await supabase
      .from("athletes")
      .select("*")
      .eq("email", loginEmail)
      .eq("athlete_code", loginCode)
      .single();

    if (error || !data) {
      setError("No athlete found with that email and athlete code.");
      setLoading(false);
      window.localStorage.removeItem("tipsWithT-athlete-login");
      return;
    }

    if (rememberLogin) {
      window.localStorage.setItem(
        "tipsWithT-athlete-login",
        JSON.stringify({
          email: loginEmail,
          athleteCode: loginCode,
        })
      );
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
    await loadAthleteDashboardData(loginEmail, loginCode);
    setSelectedWeek(0);
    setActiveProgressWidgets(getSavedProgressWidgets(data.profile_extras || {}));
    setCustomChartSettings(
      getSavedCustomChartSettings(data.profile_extras || {})
    );

    setPendingAthlete({
      ...data,
      profile_extras: data.profile_extras || {},
    });

    setIsWelcomeLoading(true);
  };

  // ==============================
  // AUTO LOGIN SAVED ATHLETE
  // If this device has a saved athlete login, open the dashboard automatically.
  // ==============================
  useEffect(() => {
    const savedLogin = window.localStorage.getItem("tipsWithT-athlete-login");

    if (!savedLogin) return;

    try {
      const parsedLogin = JSON.parse(savedLogin);

      if (parsedLogin.email && parsedLogin.athleteCode) {
        setEmail(parsedLogin.email);
        setAthleteCode(parsedLogin.athleteCode);

        window.setTimeout(() => {
          handleLogin(parsedLogin.email, parsedLogin.athleteCode);
        }, 250);
      }
    } catch {
      window.localStorage.removeItem("tipsWithT-athlete-login");
    }
  }, []);

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

    if (tab === "Videos") {
      markAthleteUpdatesSeen("videos");
    }

    if (tab === "Updates") {
      markAthleteUpdatesSeen("questions");
    }
  };

  const markAthleteUpdatesSeen = async (type: "videos" | "questions") => {
    if (!athlete) return;

    const seenAt = new Date().toISOString();

    if (type === "videos") {
      setVideoSubmissions((currentVideos) =>
        currentVideos.map((video) =>
          video.status === "reviewed" ||
          video.status === "returned" ||
          video.coach_feedback ||
          video.reviewed_video_url
            ? { ...video, athlete_seen_at: seenAt }
            : video
        )
      );
    }

    if (type === "questions") {
      setAthleteQuestions((currentQuestions) =>
        currentQuestions.map((question) =>
          question.coach_answer
            ? { ...question, athlete_seen_at: seenAt }
            : question
        )
      );
    }

    try {
      await fetch("/api/athlete/mark-seen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          athleteCode,
          type,
        }),
      });
    } catch {
      return;
    }
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
    setActiveProgressWidgets(getSavedProgressWidgets(data.profile_extras || {}));
    setCustomChartSettings(
      getSavedCustomChartSettings(data.profile_extras || {})
    );
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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#082f49] text-white">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
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
    const currentWeekNumber = Number(
      currentWeek?.week_number || selectedWeek + 1
    );
    const visibleTrainingDays = trainingDays.filter(
      (day) => Number(day.week_number) === currentWeekNumber
    );
    const filteredTrainingDays =
      selectedTrainingDay === "all"
        ? visibleTrainingDays
        : visibleTrainingDays.filter(
            (day) => day.day_name === selectedTrainingDay
          );
    const selectedTrainingDayDetails = visibleTrainingDays.find(
      (day) => day.day_name === selectedTrainingDay
    );
    const selectedWorkoutCategoryLabel = getWorkoutCategoryLabel(
      selectedWorkoutCategory
    );

    const videoUpdateCount = videoSubmissions.filter(
      (video) =>
        !video.athlete_seen_at &&
        (video.status === "reviewed" ||
          video.status === "returned" ||
          Boolean(video.coach_feedback) ||
          Boolean(video.reviewed_video_url))
    ).length;

    const answeredQuestionCount = athleteQuestions.filter(
      (question) => !question.athlete_seen_at && Boolean(question.coach_answer)
    ).length;

    const getTabBadgeCount = (tab: string) => {
      if (tab === "Videos") return videoUpdateCount;
      if (tab === "Updates") return answeredQuestionCount;
      return 0;
    };

    const printWorkoutSheet = (dayToPrint?: TrainingDay) => {
      const athleteName = `${athlete.first_name || "Athlete"} ${
        athlete.last_initial || ""
      }`.trim();
      const weekLabel = currentWeek
        ? `Week ${currentWeek.week_number}`
        : "Training Plan";
      const title =
        currentWeek?.title || currentWeek?.focus || "Training Plan";
      const plan =
        currentWeek?.plan ||
        athlete.plan ||
        "Your week-by-week training plan will appear here once Coach T adds it.";
      const printDays = dayToPrint
        ? [dayToPrint]
        : filteredTrainingDays.length
        ? filteredTrainingDays
        : visibleTrainingDays;
      const isSingleDayPrint = printDays.length === 1;

      const dayRows = printDays.length
        ? printDays
            .map((day) => {
              const workoutText = getWorkoutTextForCategory(
                day,
                selectedWorkoutCategory
              );

              return `
                <tr>
                  <td>${escapePrintHtml(day.day_name)}</td>
                  <td>${escapePrintHtml(day.focus || "-")}</td>
                  <td>${escapePrintHtml(workoutText || `No ${selectedWorkoutCategoryLabel.toLowerCase()} listed.`)}</td>
                  <td>${escapePrintHtml(day.coach_notes || "-")}</td>
                </tr>
              `;
            })
            .join("")
        : `
            <tr>
              <td colspan="4">No Monday-Friday workout details have been added yet.</td>
            </tr>
          `;

      const singleDayDetails =
        isSingleDayPrint && printDays[0]
          ? `
              <section class="day-sheet">
                <p class="eyebrow">${escapePrintHtml(printDays[0].day_name)}</p>
                <h2>${escapePrintHtml(printDays[0].focus || "Workout Day")}</h2>

                <div class="detail-block">
                  <h3>${escapePrintHtml(selectedWorkoutCategoryLabel)}</h3>
                  <p>${escapePrintHtml(
                    getWorkoutTextForCategory(printDays[0], selectedWorkoutCategory) ||
                      `No ${selectedWorkoutCategoryLabel.toLowerCase()} listed for this day.`
                  )}</p>
                </div>

                <div class="detail-block">
                  <h3>Coach Notes</h3>
                  <p>${escapePrintHtml(printDays[0].coach_notes || "-")}</p>
                </div>
              </section>
            `
          : "";

      const printWindow = window.open("", "_blank", "width=900,height=700");

      if (!printWindow) {
        return;
      }

      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>${escapePrintHtml(athleteName)} - ${escapePrintHtml(
              weekLabel
            )}</title>
            <style>
              body {
                margin: 0;
                padding: 40px;
                color: #111827;
                font-family: Arial, sans-serif;
              }

              .sheet {
                max-width: 900px;
                margin: 0 auto;
              }

              .eyebrow {
                color: #0369a1;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.22em;
                text-transform: uppercase;
              }

              h1 {
                margin: 10px 0 4px;
                font-size: 34px;
              }

              h2 {
                margin: 28px 0 10px;
                font-size: 20px;
              }

              .meta {
                color: #4b5563;
                font-size: 14px;
              }

              .plan {
                margin-top: 18px;
                padding: 18px;
                border: 1px solid #d1d5db;
                border-radius: 16px;
                white-space: pre-wrap;
                line-height: 1.65;
              }

              .day-sheet {
                margin-top: 26px;
                padding: 24px;
                border: 2px solid #bae6fd;
                border-radius: 20px;
                background: #f8fafc;
              }

              .day-sheet h2 {
                margin-top: 8px;
                font-size: 30px;
              }

              .detail-block {
                margin-top: 22px;
              }

              .detail-block h3 {
                margin: 0 0 8px;
                color: #0369a1;
                font-size: 13px;
                letter-spacing: 0.16em;
                text-transform: uppercase;
              }

              .detail-block p {
                margin: 0;
                white-space: pre-wrap;
                font-size: 19px;
                line-height: 1.7;
              }

              table {
                width: 100%;
                margin-top: 16px;
                border-collapse: collapse;
                font-size: 13px;
              }

              th,
              td {
                border: 1px solid #d1d5db;
                padding: 12px;
                text-align: left;
                vertical-align: top;
              }

              th {
                background: #e0f2fe;
                color: #0f172a;
                font-size: 11px;
                letter-spacing: 0.14em;
                text-transform: uppercase;
              }

              @media print {
                body {
                  padding: 24px;
                }

                .day-sheet {
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <main class="sheet">
              <p class="eyebrow">Tips With T Workout Sheet</p>
              <h1>${escapePrintHtml(athleteName)}</h1>
              <p class="meta">${escapePrintHtml(weekLabel)} - ${escapePrintHtml(
        getTodayLabel()
      )}</p>

              <h2>${escapePrintHtml(title)}</h2>
              <div class="plan">${escapePrintHtml(plan)}</div>

              ${
                isSingleDayPrint
                  ? singleDayDetails
                  : `
                    <h2>Monday-Friday Plan${
                      selectedWorkoutCategory === "all"
                        ? ""
                        : ` - ${escapePrintHtml(selectedWorkoutCategoryLabel)}`
                    }</h2>
                    <table>
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Focus</th>
                          <th>${escapePrintHtml(selectedWorkoutCategoryLabel)}</th>
                          <th>Coach Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${dayRows}
                      </tbody>
                    </table>
                  `
              }
            </main>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    };

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

    const activeProfileExtras = Object.keys(athlete.profile_extras || {}).filter(
      (key) =>
        key !== progressWidgetStorageKey && key !== customChartSettingsStorageKey
    );
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
                {/* =============================
                    CLICKABLE PROFILE PHOTO
                    Athlete clicks the circle to choose a photo.
                    No profile photo URL field is shown to the athlete.
                ============================= */}
                <label className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-sky-100/30 bg-sky-100/10 text-3xl font-black text-sky-100 shadow-[0_0_35px_rgba(125,211,252,0.25)] transition hover:border-sky-100 hover:bg-sky-100/20">
                  {athlete.profile_photo_url ? (
                    <img
                      src={athlete.profile_photo_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{(athlete.first_name || "A").slice(0, 1)}</span>
                  )}

                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-center text-xs font-bold uppercase tracking-[0.16em] text-white opacity-0 transition group-hover:opacity-100">
                    {photoUploading ? "Uploading..." : "Change Photo"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadProfilePhoto}
                    disabled={photoUploading}
                    className="hidden"
                  />
                </label>

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
                    window.localStorage.removeItem("tipsWithT-athlete-login");
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
              {tabs.map((tab) => {
                const badgeCount = getTabBadgeCount(tab);

                return (
                  <button
                    key={tab}
                    onClick={() => changeTab(tab)}
                    className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm uppercase tracking-[0.18em] transition duration-300 ${
                      activeTab === tab
                        ? "bg-sky-100 text-black shadow-[0_0_30px_rgba(186,230,253,0.42)]"
                        : "border border-white/15 bg-white/5 text-white/70 hover:border-sky-200/50 hover:bg-sky-200/10 hover:text-white"
                    }`}
                  >
                    <span>{tab}</span>

                    {badgeCount > 0 && (
                      <span
                        className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[10px] font-black tracking-normal ${
                          activeTab === tab
                            ? "bg-black text-sky-100"
                            : "bg-sky-100 text-black shadow-[0_0_18px_rgba(186,230,253,0.45)]"
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
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
                    <button
                      onClick={() => printWorkoutSheet(selectedTrainingDayDetails)}
                      title={
                        selectedTrainingDayDetails
                          ? `Print ${selectedTrainingDayDetails.day_name}`
                          : "Print workout sheet"
                      }
                      className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-sky-100/25 bg-white/10 text-sky-100 transition hover:bg-sky-100 hover:text-black"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 9V2h12v7" />
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <path d="M6 14h12v8H6z" />
                      </svg>
                      <span className="sr-only">Print workout sheet</span>
                    </button>

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
                            onClick={() => {
                              setSelectedWeek(index);
                              setSelectedTrainingDay("all");
                            }}
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

                    {visibleTrainingDays.length > 0 && (
                      <div className="mt-6">
                        <div className="rounded-3xl border border-sky-100/15 bg-white/[0.06] p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.28em] text-sky-100/50">
                                Workout Sections
                              </p>
                              <p className="mt-1 text-sm text-white/55">
                                Choose the day and section you want to review or
                                print.
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                printWorkoutSheet(selectedTrainingDayDetails)
                              }
                              className="rounded-full border border-sky-100/25 bg-sky-100 px-5 py-2 text-sm font-bold uppercase tracking-[0.14em] text-black transition hover:bg-white"
                            >
                              {selectedTrainingDayDetails
                                ? `Print ${selectedTrainingDayDetails.day_name}`
                                : "Print All Days"}
                            </button>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              onClick={() => setSelectedTrainingDay("all")}
                              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                                selectedTrainingDay === "all"
                                  ? "bg-sky-100 text-black"
                                  : "border border-white/15 bg-white/5 text-white/65 hover:bg-white/10"
                              }`}
                            >
                              All Days
                            </button>

                            {visibleTrainingDays.map((day) => (
                              <button
                                key={`filter-${day.id || day.day_name}`}
                                onClick={() =>
                                  setSelectedTrainingDay(day.day_name)
                                }
                                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                                  selectedTrainingDay === day.day_name
                                    ? "bg-sky-100 text-black"
                                    : "border border-white/15 bg-white/5 text-white/65 hover:bg-white/10"
                                }`}
                              >
                                {day.day_name}
                              </button>
                            ))}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                            {workoutCategoryOptions.map((option) => (
                              <button
                                key={option.key}
                                onClick={() =>
                                  setSelectedWorkoutCategory(option.key)
                                }
                                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                                  selectedWorkoutCategory === option.key
                                    ? "bg-white text-black"
                                    : "border border-white/15 bg-white/5 text-white/65 hover:bg-white/10"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:hidden">
                          {filteredTrainingDays.map((day) => {
                            const workoutText = getWorkoutTextForCategory(
                              day,
                              selectedWorkoutCategory
                            );

                            return (
                              <article
                                key={`mobile-${day.id || day.day_name}`}
                                className="rounded-3xl border border-white/10 bg-white/[0.05] p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-sky-100/55">
                                      {day.day_name}
                                    </p>
                                    <h3 className="mt-1 text-lg font-bold text-white">
                                      {day.focus || "Workout Day"}
                                    </h3>
                                  </div>

                                  <button
                                    onClick={() => printWorkoutSheet(day)}
                                    title={`Print ${day.day_name}`}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-100/25 bg-white/10 text-sky-100 transition hover:bg-sky-100 hover:text-black"
                                  >
                                    <svg
                                      aria-hidden="true"
                                      viewBox="0 0 24 24"
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M6 9V2h12v7" />
                                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                      <path d="M6 14h12v8H6z" />
                                    </svg>
                                    <span className="sr-only">
                                      Print {day.day_name}
                                    </span>
                                  </button>
                                </div>

                                <div className="workout-reading-panel mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100/55">
                                    {selectedWorkoutCategoryLabel}
                                  </p>
                                  <p className="workout-reading-text mt-3 whitespace-pre-wrap">
                                    {workoutText ||
                                      `No ${selectedWorkoutCategoryLabel.toLowerCase()} listed for this day.`}
                                  </p>
                                </div>

                                {day.coach_notes && (
                                  <div className="workout-reading-panel mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                                      Coach Notes
                                    </p>
                                    <p className="workout-reading-text mt-2 whitespace-pre-wrap text-white/72">
                                      {day.coach_notes}
                                    </p>
                                  </div>
                                )}
                              </article>
                            );
                          })}
                        </div>

                        <div className="mt-5 hidden overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.05] md:block">
                          <table className="w-full min-w-[780px] text-left text-sm">
                            <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.18em] text-white/45">
                              <tr>
                                <th className="px-4 py-4">Day</th>
                                <th className="px-4 py-4">Focus</th>
                                <th className="px-4 py-4">
                                  {selectedWorkoutCategoryLabel}
                                </th>
                                <th className="px-4 py-4">Coach Notes</th>
                                <th className="px-4 py-4">Print</th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-white/10">
                              {filteredTrainingDays.map((day) => {
                                const workoutText = getWorkoutTextForCategory(
                                  day,
                                  selectedWorkoutCategory
                                );

                                return (
                                  <tr key={day.id || day.day_name}>
                                    <td className="px-4 py-4 font-bold text-sky-100">
                                      {day.day_name}
                                    </td>
                                    <td className="px-4 py-4 text-white/70">
                                      {day.focus || "-"}
                                    </td>
                                    <td className="workout-reading-text whitespace-pre-wrap px-4 py-4">
                                      {workoutText ||
                                        `No ${selectedWorkoutCategoryLabel.toLowerCase()} listed for this day.`}
                                    </td>
                                    <td className="workout-reading-text whitespace-pre-wrap px-4 py-4 text-white/72">
                                      {day.coach_notes || "-"}
                                    </td>
                                    <td className="px-4 py-4">
                                      <button
                                        onClick={() => printWorkoutSheet(day)}
                                        title={`Print ${day.day_name}`}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-100/25 bg-white/10 text-sky-100 transition hover:bg-sky-100 hover:text-black"
                                      >
                                        <svg
                                          aria-hidden="true"
                                          viewBox="0 0 24 24"
                                          className="h-4 w-4"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M6 9V2h12v7" />
                                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                          <path d="M6 14h12v8H6z" />
                                        </svg>
                                        <span className="sr-only">
                                          Print {day.day_name}
                                        </span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-sky-100/50">
                        Progress
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        Your Progress Widgets
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <select
                      value={selectedProgressWidget}
                      onChange={(event) =>
                        setSelectedProgressWidget(event.target.value)
                      }
                      className="flex-1 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 outline-none transition focus:border-sky-200"
                    >
                      <option value="">Choose a progress view</option>
                      {progressWidgetGroups.map((group) => {
                        const availableGroupOptions = group.options.filter(
                          (option) => !activeProgressWidgets.includes(option.key)
                        );

                        if (!availableGroupOptions.length) return null;

                        return (
                          <optgroup key={group.label} label={group.label}>
                            {availableGroupOptions.map((option) => (
                              <option key={option.key} value={option.key}>
                                {option.label}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>

                    <button
                      onClick={addProgressWidget}
                      className="rounded-full border border-purple-200/30 bg-purple-300/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-purple-100 transition hover:bg-purple-200 hover:text-black"
                    >
                      Add View
                    </button>
                  </div>

                  <div className="mt-6 space-y-5">
                    {activeProgressWidgets.length ? (
                      activeProgressWidgets.map((widgetKey) => {
                        const option = progressWidgetOptions.find(
                          (item) => item.key === widgetKey
                        );
                        const isCustomChart = widgetKey === "chart_custom";
                        const chartPreset = chartWidgetPresets[widgetKey];
                        const chartSettings = isCustomChart
                          ? {
                              key: "chart_custom",
                              label: "Custom Chart",
                              metricType: customChartSettings.metricType,
                              chartType: customChartSettings.chartType,
                              xValue: customChartSettings.xValue,
                              xLabel:
                                chartXAxisOptions.find(
                                  (item) =>
                                    item.key === customChartSettings.xValue
                                )?.label || "Date",
                              yLabel:
                                chartYAxisOptions.find(
                                  (item) =>
                                    item.key === customChartSettings.metricType
                                )?.label || "Value",
                            }
                          : chartPreset;
                        const isChartWidget = Boolean(chartSettings);
                        const metricTypeForWidget =
                          chartSettings?.metricType || widgetKey;
                        const matchingMetrics = athleteMetrics.filter(
                          (metric) => metric.metric_type === metricTypeForWidget
                        );
                        const weightGoal =
                          athleteMetrics.find(
                            (metric) => metric.metric_type === "weight_goal"
                          )?.metric_value || 0;
                        const chartMetrics = matchingMetrics
                          .filter((metric) => metric.metric_value !== null)
                          .slice()
                          .reverse()
                          .slice(-8);
                        const chartValues = chartMetrics.map((metric) =>
                          Number(metric.metric_value || 0)
                        );
                        const maxChartValue =
                          Math.max(...chartValues, 1) || 1;
                        const chartTotal =
                          chartValues.reduce((sum, value) => sum + value, 0) ||
                          1;
                        const chartColors = [
                          "#e879f9",
                          "#a855f7",
                          "#22d3ee",
                          "#c084fc",
                          "#f0abfc",
                          "#7dd3fc",
                          "#d946ef",
                          "#38bdf8",
                        ];
                        let pieCursor = 0;
                        const pieGradient = chartMetrics
                          .map((metric, index) => {
                            const value = Number(metric.metric_value || 0);
                            const start = pieCursor;
                            const end = pieCursor + (value / chartTotal) * 100;
                            pieCursor = end;

                            return `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
                          })
                          .join(", ");
                        const linePoints = chartMetrics
                          .map((metric, index) => {
                            const x =
                              chartMetrics.length === 1
                                ? 50
                                : (index / (chartMetrics.length - 1)) * 100;
                            const y =
                              90 -
                              (Number(metric.metric_value || 0) /
                                maxChartValue) *
                                75;

                            return `${x},${y}`;
                          })
                          .join(" ");
                        const areaPoints = linePoints
                          ? `0,95 ${linePoints} 100,95`
                          : "";
                        const getChartXValue = (
                          metric: AthleteMetric,
                          index: number
                        ) => {
                          if (chartSettings?.xValue === "entry_number") {
                            return `Entry ${index + 1}`;
                          }

                          if (chartSettings?.xValue === "metric_label") {
                            return metric.metric_label || `Entry ${index + 1}`;
                          }

                          return metric.entry_date
                            ? new Date(metric.entry_date).toLocaleDateString(
                                undefined,
                                {
                                  month: "numeric",
                                  day: "numeric",
                                }
                              )
                            : `Entry ${index + 1}`;
                        };

                        return (
                          <div
                            key={widgetKey}
                            className="rounded-3xl border border-white/10 bg-black/20 p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-sky-100/45">
                                  Progress View
                                </p>
                                <h3 className="mt-2 text-xl font-bold">
                                  {option?.label ||
                                    chartSettings?.label ||
                                    "Progress"}
                                </h3>
                              </div>

                              <button
                                onClick={() => removeProgressWidget(widgetKey)}
                                className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/55 transition hover:bg-white hover:text-black"
                              >
                                Remove
                              </button>
                            </div>

                            {widgetKey === "weight_goal" ? (
                              <div className="mt-5 rounded-3xl border border-purple-300/25 bg-purple-500/10 p-5">
                                <div className="flex items-center justify-between gap-4">
                                  <p className="font-bold text-purple-100">
                                    Goal Progress
                                  </p>
                                  <p className="text-sm font-bold text-purple-100">
                                    {weightGoal}%
                                  </p>
                                </div>

                                <div className="mt-5 h-8 overflow-hidden rounded-full border border-fuchsia-200/25 bg-black/60 shadow-[inset_0_0_18px_rgba(0,0,0,0.75),0_0_30px_rgba(168,85,247,0.28)]">
                                  <div
                                    className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-fuchsia-700 via-purple-500 to-cyan-300 shadow-[0_0_30px_rgba(216,180,254,0.85)]"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(0, Number(weightGoal))
                                      )}%`,
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
                                        animation:
                                          "lavaShimmer 2.4s linear infinite",
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
                            ) : isChartWidget ? (
                              <div className="mt-5 rounded-3xl border border-purple-300/20 bg-gradient-to-br from-purple-950/45 via-black/30 to-sky-950/35 p-5">
                                {isCustomChart && (
                                  <div className="mb-5 grid gap-3 md:grid-cols-3">
                                    <select
                                      value={customChartSettings.chartType}
                                      onChange={(event) =>
                                        updateCustomChartSetting(
                                          "chartType",
                                          event.target.value
                                        )
                                      }
                                      className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 outline-none transition focus:border-purple-200"
                                    >
                                      {chartTypeOptions.map((chartType) => (
                                        <option
                                          key={chartType.key}
                                          value={chartType.key}
                                        >
                                          {chartType.label} Chart
                                        </option>
                                      ))}
                                    </select>

                                    <select
                                      value={customChartSettings.xValue}
                                      onChange={(event) =>
                                        updateCustomChartSetting(
                                          "xValue",
                                          event.target.value
                                        )
                                      }
                                      className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 outline-none transition focus:border-purple-200"
                                    >
                                      {chartXAxisOptions.map((xOption) => (
                                        <option
                                          key={xOption.key}
                                          value={xOption.key}
                                        >
                                          X: {xOption.label}
                                        </option>
                                      ))}
                                    </select>

                                    <select
                                      value={customChartSettings.metricType}
                                      onChange={(event) =>
                                        updateCustomChartSetting(
                                          "metricType",
                                          event.target.value
                                        )
                                      }
                                      className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 outline-none transition focus:border-purple-200"
                                    >
                                      {chartYAxisOptions.map((yOption) => (
                                        <option
                                          key={yOption.key}
                                          value={yOption.key}
                                        >
                                          Y: {yOption.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {chartMetrics.length ? (
                                  <>
                                    <div className="flex items-center justify-between gap-4">
                                      <p className="text-sm font-bold text-purple-100">
                                        {chartSettings?.yLabel || "Value"} by{" "}
                                        {chartSettings?.xLabel || "Date"}
                                      </p>
                                      <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                                        {chartSettings?.chartType || "chart"}{" "}
                                        chart
                                      </p>
                                    </div>

                                    {chartSettings?.chartType === "line" ||
                                    chartSettings?.chartType === "area" ||
                                    chartSettings?.chartType === "scatter" ? (
                                      <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4">
                                        <svg
                                          viewBox="0 0 100 100"
                                          className="h-64 w-full overflow-visible"
                                          preserveAspectRatio="none"
                                        >
                                          <defs>
                                            <linearGradient
                                              id={`progressGlow-${widgetKey}`}
                                              x1="0"
                                              y1="0"
                                              x2="1"
                                              y2="0"
                                            >
                                              <stop offset="0%" stopColor="#e879f9" />
                                              <stop offset="55%" stopColor="#a855f7" />
                                              <stop offset="100%" stopColor="#22d3ee" />
                                            </linearGradient>
                                          </defs>
                                          {[20, 40, 60, 80].map((line) => (
                                            <line
                                              key={line}
                                              x1="0"
                                              x2="100"
                                              y1={line}
                                              y2={line}
                                              stroke="rgba(255,255,255,0.08)"
                                              strokeWidth="0.4"
                                            />
                                          ))}

                                          {chartSettings?.chartType ===
                                            "area" && (
                                            <polygon
                                              points={areaPoints}
                                              fill="rgba(168,85,247,0.28)"
                                            />
                                          )}

                                          {chartSettings?.chartType !==
                                            "scatter" && (
                                            <polyline
                                              points={linePoints}
                                              fill="none"
                                              stroke={`url(#progressGlow-${widgetKey})`}
                                              strokeWidth="2.8"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          )}

                                          {chartMetrics.map((metric, index) => {
                                            const x =
                                              chartMetrics.length === 1
                                                ? 50
                                                : (index /
                                                    (chartMetrics.length - 1)) *
                                                  100;
                                            const y =
                                              90 -
                                              (Number(
                                                metric.metric_value || 0
                                              ) /
                                                maxChartValue) *
                                                75;

                                            return (
                                              <circle
                                                key={metric.id}
                                                cx={x}
                                                cy={y}
                                                r={
                                                  chartSettings?.chartType ===
                                                  "scatter"
                                                    ? 3.1
                                                    : 2.1
                                                }
                                                fill={
                                                  chartColors[
                                                    index % chartColors.length
                                                  ]
                                                }
                                                stroke="rgba(255,255,255,0.75)"
                                                strokeWidth="0.7"
                                              />
                                            );
                                          })}
                                        </svg>

                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.12em] text-white/45 sm:grid-cols-4">
                                          {chartMetrics.map((metric, index) => (
                                            <div key={metric.id}>
                                              {getChartXValue(metric, index)}:{" "}
                                              {metric.metric_value}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : chartSettings?.chartType === "pie" ||
                                      chartSettings?.chartType ===
                                        "doughnut" ? (
                                      <div className="mt-6 grid gap-5 rounded-3xl border border-white/10 bg-black/25 p-5 md:grid-cols-[220px_1fr] md:items-center">
                                        <div
                                          className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border border-fuchsia-200/20 shadow-[0_0_34px_rgba(168,85,247,0.35)]"
                                          style={{
                                            background: `conic-gradient(${pieGradient})`,
                                          }}
                                        >
                                          {chartSettings?.chartType ===
                                            "doughnut" && (
                                            <div className="h-24 w-24 rounded-full border border-white/10 bg-[#020713]" />
                                          )}
                                        </div>

                                        <div className="space-y-3">
                                          {chartMetrics.map((metric, index) => (
                                            <div
                                              key={metric.id}
                                              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                                            >
                                              <div className="flex items-center gap-3">
                                                <span
                                                  className="h-3 w-3 rounded-full"
                                                  style={{
                                                    backgroundColor:
                                                      chartColors[
                                                        index %
                                                          chartColors.length
                                                      ],
                                                  }}
                                                />
                                                <span className="text-sm text-white/75">
                                                  {getChartXValue(
                                                    metric,
                                                    index
                                                  )}
                                                </span>
                                              </div>
                                              <span className="font-bold text-purple-100">
                                                {metric.metric_value}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : chartSettings?.chartType === "bar" ? (
                                      <div className="mt-6 space-y-3 rounded-3xl border border-white/10 bg-black/25 p-4">
                                        {chartMetrics.map((metric, index) => {
                                          const value = Number(
                                            metric.metric_value || 0
                                          );
                                          const width = Math.max(
                                            7,
                                            Math.round(
                                              (value / maxChartValue) * 100
                                            )
                                          );

                                          return (
                                            <div
                                              key={metric.id}
                                              className="grid gap-2 sm:grid-cols-[120px_1fr_70px] sm:items-center"
                                            >
                                              <p className="text-xs uppercase tracking-[0.12em] text-white/45">
                                                {getChartXValue(metric, index)}
                                              </p>
                                              <div className="h-7 overflow-hidden rounded-full border border-fuchsia-200/20 bg-black/50">
                                                <div
                                                  className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-fuchsia-700 via-purple-400 to-cyan-200 shadow-[0_0_22px_rgba(216,180,254,0.65)]"
                                                  style={{ width: `${width}%` }}
                                                >
                                                  <span
                                                    className="absolute -inset-8 opacity-80 blur-sm"
                                                    style={{
                                                      background:
                                                        "radial-gradient(circle at 35% 20%, rgba(244,114,182,0.95) 0 12%, transparent 28%), radial-gradient(circle at 65% 65%, rgba(34,211,238,0.85) 0 14%, transparent 32%), radial-gradient(circle at 45% 85%, rgba(192,132,252,0.95) 0 16%, transparent 34%)",
                                                      backgroundSize:
                                                        "180% 220%",
                                                      animation:
                                                        "lavaDrift 6s ease-in-out infinite alternate",
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                              <p className="text-sm font-bold text-purple-100">
                                                {value}
                                              </p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="mt-6 flex h-64 items-end gap-3 overflow-x-auto rounded-3xl border border-white/10 bg-black/25 p-4">
                                        {chartMetrics.map((metric, index) => {
                                          const value = Number(
                                            metric.metric_value || 0
                                          );
                                          const height = Math.max(
                                            8,
                                            Math.round(
                                              (value / maxChartValue) * 100
                                            )
                                          );

                                          return (
                                            <div
                                              key={metric.id}
                                              className="flex min-w-[62px] flex-1 flex-col items-center justify-end gap-3"
                                            >
                                              <p className="text-xs font-bold text-purple-100">
                                                {value}
                                              </p>

                                              <div className="flex h-40 w-full items-end overflow-hidden rounded-2xl border border-fuchsia-200/20 bg-black/50 shadow-[inset_0_0_14px_rgba(0,0,0,0.7)]">
                                                <div
                                                  className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-t from-fuchsia-700 via-purple-400 to-cyan-200 shadow-[0_0_22px_rgba(216,180,254,0.65)]"
                                                  style={{
                                                    height: `${height}%`,
                                                  }}
                                                >
                                                  <span
                                                    className="absolute -inset-8 opacity-80 blur-sm"
                                                    style={{
                                                      background:
                                                        "radial-gradient(circle at 35% 20%, rgba(244,114,182,0.95) 0 12%, transparent 28%), radial-gradient(circle at 65% 65%, rgba(34,211,238,0.85) 0 14%, transparent 32%), radial-gradient(circle at 45% 85%, rgba(192,132,252,0.95) 0 16%, transparent 34%)",
                                                      backgroundSize:
                                                        "180% 220%",
                                                      animation:
                                                        "lavaDrift 6s ease-in-out infinite alternate",
                                                    }}
                                                  />
                                                  <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
                                                </div>
                                              </div>

                                              <p className="text-center text-[10px] uppercase tracking-[0.12em] text-white/45">
                                                {getChartXValue(metric, index)}
                                              </p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-white/55">
                                    No chart data yet. Once Coach T adds progress
                                    numbers, this graph will appear here.
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
                                <table className="w-full min-w-[700px] text-left text-sm">
                                  <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.18em] text-white/45">
                                    <tr>
                                      <th className="px-4 py-4">Date</th>
                                      <th className="px-4 py-4">Metric</th>
                                      <th className="px-4 py-4">Value</th>
                                      <th className="px-4 py-4">Notes</th>
                                    </tr>
                                  </thead>

                                  <tbody className="divide-y divide-white/10">
                                    {matchingMetrics.length ? (
                                      matchingMetrics.map((metric) => (
                                        <tr
                                          key={metric.id}
                                          className="bg-black/20"
                                        >
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
                                        <td
                                          className="px-4 py-5 text-white/45"
                                          colSpan={4}
                                        >
                                          No entries saved for this view yet.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-white/55">
                        Add a progress view from the dropdown.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Videos" && (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-100/50">
                    Videos
                  </p>
                  <h2 className="mt-2 text-2xl font-black">Submit A Video</h2>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    Upload your video to Google Drive first, then paste the
                    sharing link here. Keep videos under 200 MB.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                    placeholder="Paste your Google Drive video link"
                    className="mt-3 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                  />

                  <textarea
                    value={videoNotes}
                    onChange={(event) => setVideoNotes(event.target.value)}
                    placeholder="Tell Coach T what to review"
                    rows={4}
                    className="mt-3 w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                  />

                  <button
                    onClick={submitVideo}
                    className="mt-4 rounded-full bg-sky-100 px-6 py-4 font-bold uppercase tracking-[0.2em] text-black transition hover:bg-white"
                  >
                    Submit Video
                  </button>

                  {videoNotice && (
                    <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sky-100">
                      {videoNotice}
                    </p>
                  )}

                  <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.18em] text-white/45">
                        <tr>
                          <th className="px-4 py-4">Video</th>
                          <th className="px-4 py-4">Submitted</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-4 py-4">Link</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/10">
                        {videoSubmissions.length ? (
                          videoSubmissions.map((video) => (
                            <tr key={video.id} className="bg-black/20">
                              <td className="px-4 py-4">
                                <p className="font-bold">{video.title}</p>
                                {video.athlete_notes && (
                                  <p className="mt-1 text-white/50">
                                    {video.athlete_notes}
                                  </p>
                                )}
                                {video.coach_feedback && (
                                  <p className="mt-3 rounded-2xl border border-sky-100/10 bg-sky-100/5 p-3 text-sm text-sky-100/80">
                                    {video.coach_feedback}
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
                              <td className="px-4 py-4 capitalize text-white/65">
                                {video.status.replace("_", " ")}
                              </td>
                              <td className="px-4 py-4">
                                <a
                                  href={video.video_url}
                                  target="_blank"
                                  className="font-bold text-sky-100 underline"
                                >
                                  Original
                                </a>
                                {video.reviewed_video_url && (
                                  <a
                                    href={video.reviewed_video_url}
                                    target="_blank"
                                    className="mt-2 block font-bold text-purple-100 underline"
                                  >
                                    Reviewed
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-black/20">
                            <td className="px-4 py-5 text-white/45" colSpan={4}>
                              No videos submitted yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "Updates" && (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-100/50">
                    Updates
                  </p>
                  <h2 className="mt-2 text-2xl font-black">Ask Coach T</h2>

                  <textarea
                    value={athleteQuestion}
                    onChange={(event) => setAthleteQuestion(event.target.value)}
                    placeholder="Ask a question about your training, video, schedule, or progress..."
                    rows={5}
                    className="mt-5 w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-4 outline-none transition focus:border-sky-200"
                  />

                  <button
                    onClick={submitQuestion}
                    className="mt-4 rounded-full bg-sky-100 px-6 py-4 font-bold uppercase tracking-[0.2em] text-black transition hover:bg-white"
                  >
                    Send Question
                  </button>

                  {questionNotice && (
                    <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sky-100">
                      {questionNotice}
                    </p>
                  )}

                  <div className="mt-6 space-y-3">
                    {athleteQuestions.length ? (
                      athleteQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="rounded-2xl border border-white/10 bg-black/25 p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs uppercase tracking-[0.22em] text-sky-100/45">
                              {question.created_at
                                ? new Date(
                                    question.created_at
                                  ).toLocaleDateString()
                                : "Question"}
                            </p>
                            <p className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/45">
                              {question.status}
                            </p>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-white/80">
                            {question.question}
                          </p>

                          {question.coach_answer && (
                            <p className="mt-3 rounded-2xl border border-sky-100/10 bg-sky-100/5 p-3 text-sm text-sky-100/80">
                              {question.coach_answer}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-white/55">
                        No questions sent yet.
                      </p>
                    )}
                  </div>
                </div>
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

        <style jsx global>{`
          .workout-reading-text {
            color: rgba(255, 255, 255, 0.86);
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
              "Segoe UI", system-ui, sans-serif;
            font-size: 1rem;
            font-weight: 500;
            letter-spacing: 0;
            line-height: 1.75;
            overflow-wrap: anywhere;
          }

          @media (max-width: 640px) {
            .workout-reading-panel {
              padding: 1.125rem;
            }

            .workout-reading-text {
              font-size: 1.0625rem;
              line-height: 1.82;
            }
          }

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

  // ==============================
  // LOGIN SCREEN BEFORE DASHBOARD
  // Enter/Return works here because this is a real form.
  // Clicking Open Database also submits the same form.
  // ==============================
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#082f49] px-6 text-white">
      <div
        className={`pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#020713] px-6 text-center transition-opacity duration-1000 ${
          isEntryReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px), radial-gradient(circle, rgba(147,197,253,0.7) 1px, transparent 1px)",
            backgroundSize: "84px 84px, 136px 136px",
            backgroundPosition: "0 0, 42px 58px",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.22),transparent_48%)]" />

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.55em] text-sky-100/65">
            Loading
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-[0.16em] text-white sm:text-7xl">
            TIPS WITH T
          </h1>
          <div className="mx-auto mt-8 h-1 w-56 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-full origin-left animate-[entryLoad_2.1s_ease-in-out_infinite] rounded-full bg-sky-100" />
          </div>
        </div>
      </div>

      <video
        ref={loginVideoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onPlaying={() => setIsEntryReady(true)}
        onCanPlay={() => setIsEntryReady(true)}
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-sky-950/25 to-black/45" />

      <div
        className={`relative w-full max-w-md rounded-[2rem] border border-sky-100/20 bg-white/5 p-8 shadow-[0_25px_90px_rgba(14,165,233,0.18)] backdrop-blur-xl transition-opacity duration-1000 ${
          isEntryReady ? "opacity-100" : "opacity-0"
        }`}
      >
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
          onSubmit={(event) => {
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

          {/* ==============================
              REMEMBER LOGIN OPTION
              Keeps this athlete logged in on this device.
          ============================== */}
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
            <input
              type="checkbox"
              checked={rememberLogin}
              onChange={(event) => setRememberLogin(event.target.checked)}
              className="h-4 w-4"
            />
            Remember me on this device
          </label>

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

      <style jsx>{`
        @keyframes entryLoad {
          0% {
            transform: scaleX(0);
          }
          45% {
            transform: scaleX(0.72);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
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
