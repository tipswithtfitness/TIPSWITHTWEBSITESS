"use client";

import { useState } from "react";

const serviceOptions = [
  {
    name: "Athletic Training",
    className:
      "bg-red-500/20 border-red-400 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.8)]",
    hoverClassName:
      "border-white hover:bg-red-500/20 hover:shadow-[0_0_25px_rgba(239,68,68,0.8)]",
    fontFamily: "Impact, sans-serif",
  },
  {
    name: "Nutritional Counseling",
    className:
      "bg-green-500/20 border-green-400 text-green-200 shadow-[0_0_30px_rgba(34,197,94,0.8)]",
    hoverClassName:
      "border-white hover:bg-green-500/20 hover:shadow-[0_0_25px_rgba(34,197,94,0.8)]",
    fontFamily: "Georgia, serif",
  },
  {
    name: "General Fitness",
    className:
      "bg-blue-500/20 border-blue-400 text-blue-200 shadow-[0_0_30px_rgba(59,130,246,0.8)]",
    hoverClassName:
      "border-white hover:bg-blue-500/20 hover:shadow-[0_0_25px_rgba(59,130,246,0.8)]",
    fontFamily: "Trebuchet MS, sans-serif",
  },
  {
    name: "Sprinting",
    className:
      "bg-yellow-400/20 border-yellow-300 text-yellow-200 shadow-[0_0_35px_rgba(250,204,21,0.9)]",
    hoverClassName:
      "border-yellow-300 hover:bg-yellow-400/20 hover:shadow-[0_0_35px_rgba(250,204,21,0.9)]",
    fontFamily: "Arial Black, sans-serif",
  },
];

const lessonPlans = [
  {
    name: "4-Week Training Cycle",
    price: "$45 per cycle",
    image: "/red%20tipswitht.png",
    note: "Soft Launch Pricing",
    details: [
      "Personalized training plan",
      "Up to 5 video analyses per week",
      "Ongoing feedback",
      "End-of-cycle progress check-in",
      "Before & after comparison",
      "Rehab consultation",
      "Performance breakdown",
      "Next phase recommendations",
      "Additional video reviews: $10 per video",
    ],
  },
  {
    name: "For The Underdogs Who Want More",
    price: "$55 per month",
    image: "/bluetipswitht.png",
    note: "Monthly support option",
    details: [
      "For athletes who want more consistent support",
      "Personalized training plan",
      "UNLIMITED VIDEO ANALYSIS",
      "Ongoing feedback",
      "Progress check-ins",
      "FULL Personalized rehab plan added to avoid injury",
      "Personalized Nutritional plan",
      "Workout details sent by email",
      "Questions can be sent by email",
    ],
  },
  {
    name: "3-Month Commitment",
    price: "$108 every 12 weeks",
    image: "/underdogs.png",
    note: "Save 20% when you commit to 3 cycles",
    details: [
      "Three 4-week training cycles",
      "Personalized training progression",
      "UNLIMITED VIDEO ANALYSIS",
      "Ongoing feedback",
      "Progress check-ins",
      "FULL Personalized rehab plan added to avoid injury",
      "Personalized Nutritional plan",
      "Workout details sent by email",
      "Performance breakdown",
      "Next phase recommendations",
    ],
  },
];

const trainingPeriods = [
  "3 months",
  "A year",
  "Indoor season",
  "Outdoor season",
  "Off season",
  "Custom",
];

export default function LessonsPage() {
  // SERVICE SELECTION
  const [selectedService, setSelectedService] = useState("");
  const [confirmedService, setConfirmedService] = useState("");

  // CLIENT INFO
  const [firstName, setFirstName] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [confirmedName, setConfirmedName] = useState(false);

  // JOURNEY QUESTION
  const [selectedJourney, setSelectedJourney] = useState("");
  const [confirmedJourney, setConfirmedJourney] = useState("");

  // ABOUT QUESTION
  const [aboutText, setAboutText] = useState("");
  const [finishedAbout, setFinishedAbout] = useState(false);

  // SPECIAL EVENT QUESTION
  const [preparingEvent, setPreparingEvent] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [finishedEvents, setFinishedEvents] = useState(false);

  // BODY WEIGHT QUESTION
  const [bodyWeight, setBodyWeight] = useState("");
  const [finishedWeight, setFinishedWeight] = useState(false);

  // SPRINTER QUESTION
  const [isSprinter, setIsSprinter] = useState("");
  const [confirmedSprinter, setConfirmedSprinter] = useState(false);

  // SPRINTER-ONLY DETAILS
  const [maxSquat, setMaxSquat] = useState("");
  const [maxRdl, setMaxRdl] = useState("");
  const [maxDumbbellPushPress, setMaxDumbbellPushPress] = useState("");
  const [personalRecords, setPersonalRecords] = useState("");
  const [finishedSprintDetails, setFinishedSprintDetails] = useState(false);

  // TRAINING PERIOD QUESTION
  const [selectedTrainingPeriod, setSelectedTrainingPeriod] = useState("");
  const [customTrainingPeriod, setCustomTrainingPeriod] = useState("");
  const [finishedTrainingPeriod, setFinishedTrainingPeriod] = useState(false);

  // REVIEW, PRICING, AND MEETING
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [selectedPricingOption, setSelectedPricingOption] = useState("");
  const [confirmedPricing, setConfirmedPricing] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  // ATHLETE CODE AND FORM SUBMISSION
  const [athleteCode, setAthleteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const trainingPeriodAnswer =
    selectedTrainingPeriod === "Custom"
      ? customTrainingPeriod
      : selectedTrainingPeriod;

  const handleNavigation = (path: string) => {
    const confirmed = window.confirm(
      "Leaving this page will erase your progress. Continue?"
    );

    if (confirmed) {
      window.location.href = path;
    }
  };

  // CREATES A VERY UNIQUE ATHLETE CODE AFTER THEY SUBMIT THEIR REQUEST
  const generateAthleteCode = () => {
    const cleanName =
      firstName
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 4)
        .toUpperCase() || "TWT";

    const randomBytes = new Uint8Array(6);
    window.crypto.getRandomValues(randomBytes);

    const randomPart = Array.from(randomBytes, (byte) =>
      byte.toString(36).padStart(2, "0")
    )
      .join("")
      .toUpperCase();

    return `${cleanName}-${Date.now()
      .toString(36)
      .toUpperCase()}-${randomPart}`;
  };

  // RESETS THE WHOLE FORM WHEN SOMEONE WANTS TO START OVER
  const resetForm = () => {
    setSelectedService("");
    setConfirmedService("");
    setFirstName("");
    setLastInitial("");
    setClientEmail("");
    setConfirmedName(false);
    setSelectedJourney("");
    setConfirmedJourney("");
    setAboutText("");
    setFinishedAbout(false);
    setPreparingEvent("");
    setEventDetails("");
    setFinishedEvents(false);
    setBodyWeight("");
    setFinishedWeight(false);
    setIsSprinter("");
    setConfirmedSprinter(false);
    setMaxSquat("");
    setMaxRdl("");
    setMaxDumbbellPushPress("");
    setPersonalRecords("");
    setFinishedSprintDetails(false);
    setSelectedTrainingPeriod("");
    setCustomTrainingPeriod("");
    setFinishedTrainingPeriod(false);
    setReviewConfirmed(false);
    setSelectedPricingOption("");
    setConfirmedPricing(false);
    setMeetingDate("");
    setMeetingTime("");
    setAthleteCode("");
    setSubmitted(false);
    setSubmitError("");
  };

  const getServiceFont = () => {
    const service = serviceOptions.find(
      (option) => option.name === confirmedService
    );
    return service?.fontFamily || "Arial Black, sans-serif";
  };

  const getServiceHighlightClass = () => {
    const service = serviceOptions.find(
      (option) => option.name === confirmedService
    );
    return service?.className || serviceOptions[2].className;
  };

  const ServiceHeader = () => (
    <div
      className={`mb-12 px-8 py-4 rounded-full border text-xl tracking-[0.2em] backdrop-blur-md transition duration-500 ${getServiceHighlightClass()}`}
      style={{ fontFamily: getServiceFont() }}
    >
      {confirmedService}
    </div>
  );

  const emailSubject = `Tips With T Intake - ${firstName} ${lastInitial}. - ${confirmedService}`;

  // BUILDS THE EMAIL THAT GETS SENT TO YOU
  const createEmailBody = (codeForSubmission: string) => `
New client intake:

Name: ${firstName} ${lastInitial}.
Client Email: ${clientEmail}
Category: ${confirmedService}
Journey: ${confirmedJourney}

About:
${aboutText}

Special event:
${preparingEvent}

Event details:
${preparingEvent === "Yes" ? eventDetails || "No details provided." : "None"}

Body weight:
${bodyWeight}

Sprinter:
${isSprinter}

Sprinter details:
Max Squat: ${
    isSprinter === "Yes" ? maxSquat || "Not provided" : "Not a sprinter"
  }
Max RDL: ${isSprinter === "Yes" ? maxRdl || "Not provided" : "Not a sprinter"}
Max Dumbbell Push Press: ${
    isSprinter === "Yes"
      ? maxDumbbellPushPress || "Not provided"
      : "Not a sprinter"
  }
Personal Records: ${
    isSprinter === "Yes" ? personalRecords || "Not provided" : "Not a sprinter"
  }

Training period:
${trainingPeriodAnswer || "Not selected"}

Pricing option:
${selectedPricingOption || "Not selected"}

Athlete code:
${codeForSubmission}

Preferred Zoom meeting:
Date: ${meetingDate || "Not selected"}
Time: ${meetingTime || "Not selected"}

Meeting note:
Initial Zoom meetings are expected to take 15-45 minutes depending on how much the client wants to share and how long it takes to find the right options.
`;

  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    const codeForSubmission = athleteCode || generateAthleteCode();

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "43177f8a-72d6-4d12-b016-bca15f4f57e6",
          subject: emailSubject,
          from_name: "Tips With T Website",
          name: `${firstName} ${lastInitial}.`,
          email: clientEmail,
          replyto: clientEmail,
          recipient_email: "tipswitht.fitness@gmail.com",
          message: createEmailBody(codeForSubmission),
          category: confirmedService,
          journey: confirmedJourney,
          about: aboutText,
          special_event: preparingEvent,
          event_details:
            preparingEvent === "Yes"
              ? eventDetails || "No details provided."
              : "None",
          body_weight: bodyWeight,
          is_sprinter: isSprinter,
          max_squat: maxSquat,
          max_rdl: maxRdl,
          max_dumbbell_push_press: maxDumbbellPushPress,
          personal_records: personalRecords,
          training_period: trainingPeriodAnswer,
          pricing_option: selectedPricingOption,
          athlete_code: codeForSubmission,
          preferred_zoom_date: meetingDate,
          preferred_zoom_time: meetingTime,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAthleteCode(codeForSubmission);
        setSubmitted(true);
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-black text-white min-h-screen flex flex-col items-center px-6 py-20 relative overflow-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-6 backdrop-blur-md bg-black/30 border-b border-white/10">
        <h1
          className="text-2xl font-bold tracking-wide cursor-pointer hover:text-gray-300 transition"
          onClick={() => handleNavigation("/")}
        >
          TIPS WITH T
        </h1>

        <div className="flex gap-8 text-lg">
          <button
            onClick={() => handleNavigation("/")}
            className="hover:text-gray-300 transition"
          >
            Home
          </button>
          <button
            onClick={() => handleNavigation("/about")}
            className="hover:text-gray-300 transition"
          >
            About
          </button>
          <button
            onClick={() => handleNavigation("/summercamps")}
            className="hover:text-gray-300 transition"
          >
            Summer Camps
          </button>
          <button
            onClick={() => handleNavigation("/merch")}
            className="hover:text-gray-300 transition"
          >
            Merch
          </button>
          <button
            onClick={() => handleNavigation("/contact")}
            className="hover:text-gray-300 transition"
          >
            Contact
          </button>
        </div>
      </nav>

      {/* BACK BUTTON */}
      <button
        onClick={() => {
          if (submitted) setSubmitted(false);
          else if (meetingDate || meetingTime) {
            setMeetingDate("");
            setMeetingTime("");
          } else if (confirmedPricing) setConfirmedPricing(false);
          else if (selectedPricingOption) setSelectedPricingOption("");
          else if (reviewConfirmed) setReviewConfirmed(false);
          else if (finishedTrainingPeriod) setFinishedTrainingPeriod(false);
          else if (selectedTrainingPeriod || customTrainingPeriod) {
            setSelectedTrainingPeriod("");
            setCustomTrainingPeriod("");
          } else if (finishedSprintDetails) setFinishedSprintDetails(false);
          else if (
            maxSquat ||
            maxRdl ||
            maxDumbbellPushPress ||
            personalRecords
          ) {
            setMaxSquat("");
            setMaxRdl("");
            setMaxDumbbellPushPress("");
            setPersonalRecords("");
          } else if (confirmedSprinter) setConfirmedSprinter(false);
          else if (isSprinter) setIsSprinter("");
          else if (finishedWeight) setFinishedWeight(false);
          else if (bodyWeight) setBodyWeight("");
          else if (finishedEvents) setFinishedEvents(false);
          else if (preparingEvent) {
            setPreparingEvent("");
            setEventDetails("");
          } else if (finishedAbout) setFinishedAbout(false);
          else if (confirmedJourney) setConfirmedJourney("");
          else if (selectedJourney) setSelectedJourney("");
          else if (confirmedName) setConfirmedName(false);
          else if (confirmedService) setConfirmedService("");
          else if (selectedService) setSelectedService("");
          else window.location.href = "/";
        }}
        className="fixed bottom-8 left-8 text-gray-400 hover:text-white transition text-lg z-50"
      >
        {"< Back"}
      </button>

      {/* MAIN CONTENT */}
      <div className="w-full flex flex-col items-center mt-24">
        {/* QUESTION 1: SERVICE */}
        {!confirmedService && (
          <>
            <h1 className="text-5xl font-bold mb-12 text-center">
              What are you looking for?
            </h1>

            <div className="flex flex-col gap-6 w-full max-w-md">
              {serviceOptions.map((service) => (
                <button
                  key={service.name}
                  onClick={() => setSelectedService(service.name)}
                  className={`py-4 rounded-xl text-xl transition duration-300 border ${
                    selectedService === service.name
                      ? service.className
                      : service.hoverClassName
                  } ${
                    service.name === "Athletic Training" ||
                    service.name === "Sprinting"
                      ? "font-black tracking-wide"
                      : ""
                  } ${
                    service.name === "Sprinting" ? "italic tracking-widest" : ""
                  }`}
                  style={{ fontFamily: service.fontFamily }}
                >
                  {service.name === "Athletic Training" ||
                  service.name === "Sprinting"
                    ? service.name.toUpperCase()
                    : service.name}
                </button>
              ))}
            </div>

            {selectedService && (
              <button
                onClick={() => setConfirmedService(selectedService)}
                className="mt-12 px-10 py-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xl tracking-[0.3em] hover:scale-105 hover:bg-white hover:text-black transition duration-500 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                CONTINUE →
              </button>
            )}
          </>
        )}

        {/* QUESTION 2: NAME AND EMAIL */}
        {confirmedService && !confirmedName && (
          <div className="w-full max-w-xl flex flex-col items-center animate-fadeIn">
            <ServiceHeader />

            <h2 className="text-4xl font-bold text-center mb-6">
              What should I call you?
            </h2>

            <p className="text-gray-400 text-center mb-10 text-lg">
              First name, last initial, and email.
            </p>

            <div className="w-full flex flex-col gap-5">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-xl outline-none focus:border-white"
              />

              <input
                value={lastInitial}
                onChange={(e) =>
                  setLastInitial(e.target.value.slice(0, 1).toUpperCase())
                }
                placeholder="Last initial"
                className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-xl outline-none focus:border-white"
              />

              <input
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-xl outline-none focus:border-white"
              />
            </div>

            {firstName && lastInitial && clientEmail && (
              <button
                onClick={() => setConfirmedName(true)}
                className="mt-12 px-10 py-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xl tracking-[0.3em] hover:scale-105 hover:bg-white hover:text-black transition duration-500 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                CONTINUE →
              </button>
            )}
          </div>
        )}

        {/* QUESTION 3: JOURNEY */}
        {confirmedService && confirmedName && !confirmedJourney && (
          <div className="w-full max-w-2xl animate-fadeIn flex flex-col items-center">
            <ServiceHeader />

            <h2 className="text-4xl font-bold text-center mb-10">
              Where are you in your journey?
            </h2>

            <div className="w-full max-w-md mb-12">
              <h3 className="text-gray-200 text-xl font-semibold mb-5 tracking-[0.25em]">
                STUDENT ATHLETES
              </h3>

              <div className="flex flex-col gap-4">
                {[
                  "Middle School Athlete",
                  "High School Athlete",
                  "Collegiate Athlete",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedJourney(item)}
                    className={`py-3 rounded-xl border transition duration-300 ${
                      selectedJourney === item
                        ? "bg-white border-white text-black shadow-[0_0_25px_rgba(255,255,255,0.8)]"
                        : "border-white/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full max-w-md">
              <h3 className="text-yellow-100 text-xl font-semibold mb-5 tracking-[0.25em]">
                ADULTS
              </h3>

              <div className="flex flex-col gap-4">
                {["18–25", "26–39", "40+"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedJourney(item)}
                    className={`py-3 rounded-xl border transition duration-300 ${
                      selectedJourney === item
                        ? "bg-yellow-100 border-yellow-100 text-black shadow-[0_0_25px_rgba(254,249,195,0.8)]"
                        : "border-yellow-100 hover:bg-yellow-100/10 hover:shadow-[0_0_20px_rgba(254,249,195,0.5)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {selectedJourney && (
              <button
                onClick={() => setConfirmedJourney(selectedJourney)}
                className="mt-14 px-10 py-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xl tracking-[0.3em] hover:scale-105 hover:bg-white hover:text-black transition duration-500 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                CONTINUE →
              </button>
            )}
          </div>
        )}

        {/* QUESTION 4: ABOUT */}
        {confirmedJourney && !finishedAbout && (
          <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
            <ServiceHeader />

            <h2 className="text-5xl font-bold text-center mb-6">
              Tell me about yourself.
            </h2>

            <p className="text-gray-400 text-center mb-8 text-lg max-w-xl">
              What are your goals, motivations, or challenges?
            </p>

            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              maxLength={150}
              placeholder="Share your story..."
              className="w-full h-64 bg-white/5 border border-white/20 rounded-3xl p-8 text-xl outline-none focus:border-white focus:shadow-[0_0_35px_rgba(255,255,255,0.25)] transition duration-300 resize-none backdrop-blur-md"
            />

            <div className="text-right text-gray-500 mt-4 w-full">
              {aboutText.length}/150
            </div>

            {aboutText.length > 0 && (
              <button
                onClick={() => setFinishedAbout(true)}
                className="mt-10 px-12 py-5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xl tracking-[0.3em] hover:scale-105 hover:bg-white hover:text-black transition duration-500 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                NEXT SECTION →
              </button>
            )}
          </div>
        )}

        {/* QUESTION 5: SPECIAL EVENTS */}
        {finishedAbout && !finishedEvents && (
          <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
            <ServiceHeader />

            <h2 className="text-5xl font-bold text-center mb-8">
              Any special events you want to prepare for?
            </h2>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setPreparingEvent("Yes")}
                className={`px-10 py-4 rounded-2xl border text-xl transition duration-300 ${
                  preparingEvent === "Yes"
                    ? "bg-green-500/20 border-green-400 text-green-200 shadow-[0_0_30px_rgba(34,197,94,0.8)]"
                    : "border-white/20 hover:bg-green-500/10 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                }`}
              >
                Yes
              </button>

              <button
                onClick={() => {
                  setPreparingEvent("No");
                  setEventDetails("");
                }}
                className={`px-10 py-4 rounded-2xl border text-xl transition duration-300 ${
                  preparingEvent === "No"
                    ? "bg-white/20 border-white text-white shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    : "border-white/20 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                }`}
              >
                No
              </button>
            </div>

            {preparingEvent === "Yes" && (
              <div className="mt-12 w-full animate-fadeIn">
                <textarea
                  value={eventDetails}
                  onChange={(e) => setEventDetails(e.target.value)}
                  placeholder="Tell me more..."
                  className="w-full h-40 bg-white/5 border border-white/20 rounded-3xl p-8 text-lg outline-none focus:border-green-400 focus:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition duration-300 resize-none backdrop-blur-md"
                />
              </div>
            )}

            {preparingEvent && (
              <button
                onClick={() => setFinishedEvents(true)}
                className="mt-14 px-12 py-5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xl tracking-[0.3em] hover:scale-105 hover:bg-white hover:text-black transition duration-500 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                NEXT SECTION →
              </button>
            )}
          </div>
        )}

        {/* QUESTION 6: BODY WEIGHT */}
        {finishedEvents && !finishedWeight && (
          <div className="w-full max-w-xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
            <ServiceHeader />

            <h2 className="text-5xl font-bold text-center mb-6">
              What is your weight?
            </h2>

            <p className="text-gray-400 text-center mb-10 text-lg max-w-xl">
              Please include whether it is pounds or kilos.
            </p>

            <input
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              placeholder="Example: 145 lbs or 66 kg"
              className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-xl outline-none focus:border-white focus:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition duration-300"
            />

            {bodyWeight && (
              <button
                onClick={() => setFinishedWeight(true)}
                className="mt-10 h-16 w-16 rounded-full border border-green-400 bg-green-500/20 text-3xl text-green-100 hover:scale-110 hover:bg-green-400 hover:text-black transition duration-300 shadow-[0_0_30px_rgba(34,197,94,0.45)]"
                aria-label="Confirm weight"
              >
                ✓
              </button>
            )}
          </div>
        )}

        {/* QUESTION 7: SPRINTER YES OR NO */}
        {finishedWeight && !confirmedSprinter && (
          <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
            <ServiceHeader />

            <h2 className="text-5xl font-bold text-center mb-8">
              Are you a sprinter?
            </h2>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setIsSprinter("Yes")}
                className={`px-10 py-4 rounded-2xl border text-xl transition duration-300 ${
                  isSprinter === "Yes"
                    ? "bg-yellow-400/20 border-yellow-300 text-yellow-200 shadow-[0_0_35px_rgba(250,204,21,0.9)]"
                    : "border-yellow-300/60 hover:bg-yellow-400/10 hover:shadow-[0_0_25px_rgba(250,204,21,0.55)]"
                }`}
              >
                Yes
              </button>

              <button
                onClick={() => {
                  setIsSprinter("No");
                  setMaxSquat("");
                  setMaxRdl("");
                  setMaxDumbbellPushPress("");
                  setPersonalRecords("");
                  setFinishedSprintDetails(false);
                }}
                className={`px-10 py-4 rounded-2xl border text-xl transition duration-300 ${
                  isSprinter === "No"
                    ? "bg-white/20 border-white text-white shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    : "border-white/20 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                }`}
              >
                No
              </button>
            </div>

            {isSprinter && (
              <button
                onClick={() => setConfirmedSprinter(true)}
                className="mt-14 px-12 py-5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xl tracking-[0.3em] hover:scale-105 hover:bg-white hover:text-black transition duration-500 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                CONTINUE →
              </button>
            )}
          </div>
        )}

        {/* QUESTION 8: SPRINTER-ONLY LIFTS AND PERSONAL RECORDS */}
        {confirmedSprinter &&
          isSprinter === "Yes" &&
          !finishedSprintDetails && (
            <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
              <ServiceHeader />

              <h2 className="text-5xl font-bold text-center mb-6">
                Sprint details
              </h2>

              <p className="text-gray-400 text-center mb-10 text-lg max-w-2xl">
                Please include pounds or kilos for your lifts, and include the
                event name for your PRs.
              </p>

              <div className="w-full flex flex-col gap-5">
                <input
                  value={maxSquat}
                  onChange={(e) => setMaxSquat(e.target.value)}
                  placeholder="Max squat, example: 225 lbs or 102 kg"
                  className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-xl outline-none focus:border-yellow-300 transition duration-300"
                />
                <input
                  value={maxRdl}
                  onChange={(e) => setMaxRdl(e.target.value)}
                  placeholder="Max RDL, example: 185 lbs or 84 kg"
                  className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-xl outline-none focus:border-yellow-300 transition duration-300"
                />
                <input
                  value={maxDumbbellPushPress}
                  onChange={(e) => setMaxDumbbellPushPress(e.target.value)}
                  placeholder="Max dumbbell push press, example: 45 lb DBs or 20 kg DBs"
                  className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-xl outline-none focus:border-yellow-300 transition duration-300"
                />
                <textarea
                  value={personalRecords}
                  onChange={(e) => setPersonalRecords(e.target.value)}
                  placeholder="Personal records, example: 100m - 12.4, 200m - 25.8"
                  className="w-full h-40 bg-white/5 border border-white/20 rounded-3xl p-8 text-lg outline-none focus:border-yellow-300 transition duration-300 resize-none backdrop-blur-md"
                />
              </div>

              {maxSquat &&
                maxRdl &&
                maxDumbbellPushPress &&
                personalRecords && (
                  <button
                    onClick={() => setFinishedSprintDetails(true)}
                    className="mt-12 px-12 py-5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xl tracking-[0.3em] hover:scale-105 hover:bg-white hover:text-black transition duration-500 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                  >
                    CONTINUE →
                  </button>
                )}
            </div>
          )}

        {/* QUESTION 9: TRAINING PERIOD */}
        {((confirmedSprinter && isSprinter === "No") ||
          finishedSprintDetails) &&
          !finishedTrainingPeriod && (
            <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
              <ServiceHeader />

              <h2 className="text-5xl font-bold text-center mb-6">
                What is your training period?
              </h2>

              <p className="text-gray-400 text-center mb-10 text-lg max-w-2xl">
                Choose the timeline that best matches what you are preparing
                for.
              </p>

              <div className="w-full max-w-xl grid grid-cols-1 gap-4">
                {trainingPeriods.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSelectedTrainingPeriod(item);
                      if (item !== "Custom") setCustomTrainingPeriod("");
                    }}
                    className={`py-4 rounded-xl border text-lg transition duration-300 ${
                      selectedTrainingPeriod === item
                        ? "bg-white border-white text-black shadow-[0_0_25px_rgba(255,255,255,0.8)]"
                        : "border-white/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {selectedTrainingPeriod === "Custom" && (
                <textarea
                  value={customTrainingPeriod}
                  onChange={(e) => setCustomTrainingPeriod(e.target.value)}
                  placeholder="Explain how long you want to train for..."
                  className="mt-8 w-full h-36 bg-white/5 border border-white/20 rounded-3xl p-6 text-lg outline-none focus:border-white transition duration-300 resize-none backdrop-blur-md"
                />
              )}

              {selectedTrainingPeriod &&
                (selectedTrainingPeriod !== "Custom" ||
                  customTrainingPeriod) && (
                  <button
                    onClick={() => setFinishedTrainingPeriod(true)}
                    className="mt-12 px-12 py-5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xl tracking-[0.3em] hover:scale-105 hover:bg-white hover:text-black transition duration-500 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                  >
                    REVIEW →
                  </button>
                )}
            </div>
          )}

        {/* REVIEW PAGE */}
        {finishedTrainingPeriod && !reviewConfirmed && (
          <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
            <ServiceHeader />

            <h2 className="text-5xl font-bold text-center mb-6">
              Does everything look right?
            </h2>

            <p className="text-gray-400 text-center mb-10 text-lg max-w-xl">
              This helps me prepare for our first Zoom meeting where we’ll go
              over logistics, scheduling, and get to know you more.
            </p>

            <div className="w-full bg-white/5 border border-white/20 rounded-3xl p-8 text-lg space-y-5">
              <p>
                <strong>Name:</strong> {firstName} {lastInitial}.
              </p>
              <p>
                <strong>Email:</strong> {clientEmail}
              </p>
              <p>
                <strong>Category:</strong> {confirmedService}
              </p>
              <p>
                <strong>Journey:</strong> {confirmedJourney}
              </p>
              <p>
                <strong>About:</strong> {aboutText}
              </p>
              <p>
                <strong>Special event:</strong> {preparingEvent}
              </p>
              {preparingEvent === "Yes" && (
                <p>
                  <strong>Event details:</strong>{" "}
                  {eventDetails || "No details added."}
                </p>
              )}
              <p>
                <strong>Body weight:</strong> {bodyWeight}
              </p>
              <p>
                <strong>Sprinter:</strong> {isSprinter}
              </p>

              {isSprinter === "Yes" && (
                <>
                  <p>
                    <strong>Max squat:</strong> {maxSquat}
                  </p>
                  <p>
                    <strong>Max RDL:</strong> {maxRdl}
                  </p>
                  <p>
                    <strong>Max dumbbell push press:</strong>{" "}
                    {maxDumbbellPushPress}
                  </p>
                  <p>
                    <strong>Personal records:</strong> {personalRecords}
                  </p>
                </>
              )}

              <p>
                <strong>Training period:</strong> {trainingPeriodAnswer}
              </p>
            </div>

            <button
              onClick={() => setReviewConfirmed(true)}
              className="mt-14 px-12 py-5 rounded-full border border-green-400 bg-green-500/20 text-green-100 text-xl tracking-[0.2em] hover:scale-105 hover:bg-green-400 hover:text-black transition duration-500 shadow-[0_0_30px_rgba(34,197,94,0.45)]"
            >
              EVERYTHING LOOKS GOOD!
            </button>
          </div>
        )}

        {/* PRICING SECTION */}
        {reviewConfirmed && !confirmedPricing && (
          <div className="w-full max-w-6xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
            <ServiceHeader />

            <h2 className="text-5xl font-bold text-center mb-6">
              Choose your training option
            </h2>

            <p className="text-gray-400 text-center mb-10 text-lg max-w-3xl">
              Pricing for special events and hourly lessons can be discussed
              over Zoom. Your full training plan and service begin once payment
              is received.
            </p>

            <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-8">
              {lessonPlans.map((plan) => (
                <button
                  key={plan.name}
                  onClick={() => setSelectedPricingOption(plan.name)}
                  className={`text-center rounded-3xl border p-6 transition duration-500 hover:scale-[1.02] ${
                    selectedPricingOption === plan.name
                      ? "border-green-400 bg-green-500/20 shadow-[0_0_35px_rgba(34,197,94,0.45)]"
                      : "border-white/20 bg-white/5 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.18)]"
                  }`}
                >
                  <div className="mx-auto mb-6 h-44 w-44 overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.12)]">
                    <img
                      src={plan.image}
                      alt={plan.name}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-3xl font-black mb-2">{plan.price}</p>
                  <p className="text-green-200 text-sm uppercase tracking-[0.18em] mb-5">
                    {plan.note}
                  </p>

                  <div className="space-y-3 text-gray-300 text-base">
                    {plan.details.map((detail) => (
                      <p key={detail}>✓ {detail}</p>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedPricingOption("Discuss over Zoom")}
              className={`mt-8 px-10 py-4 rounded-full border text-lg tracking-[0.2em] transition duration-300 ${
                selectedPricingOption === "Discuss over Zoom"
                  ? "border-white bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                  : "border-white/20 bg-white/10 hover:bg-white hover:text-black"
              }`}
            >
              Hmmm not sure yet...
            </button>

            <div className="mt-10 max-w-3xl text-center text-gray-400 leading-8">
              <p>
                On the Zoom call, I will go over your training plan, pricing,
                and the best option for your goals.
              </p>
              <p className="mt-3">
                Please allow 24-48 hours after payment for me to fully complete
                your training plan. You will receive an email from Tips With T
                with workout details, video analysis instructions, and next
                steps.
              </p>
              <p className="mt-3 text-gray-500">
                3-month discounted plan available. Custom payment options can be
                discussed during consultation.
              </p>
            </div>

            {selectedPricingOption && (
              <button
                onClick={() => setConfirmedPricing(true)}
                className="mt-12 px-12 py-5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xl tracking-[0.3em] hover:scale-105 hover:bg-white hover:text-black transition duration-500 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                CONTINUE TO ZOOM →
              </button>
            )}
          </div>
        )}

        {/* MEETING SECTION */}
        {confirmedPricing && (
          <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
            <ServiceHeader />

            <h2 className="text-5xl font-bold text-center mb-6">
              Choose a Zoom meeting time
            </h2>

            <p className="text-gray-400 text-center mb-10 text-lg max-w-2xl">
              The first meeting usually takes 15–45 minutes depending on how
              much you want to share and how much time we need to find the right
              options for you.
            </p>

            <div className="w-full bg-white/5 border border-white/20 rounded-3xl p-8 flex flex-col gap-6">
              <label className="flex flex-col gap-3 text-lg">
                Preferred date
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="bg-black border border-white/20 rounded-2xl px-5 py-4 text-white outline-none focus:border-white"
                />
              </label>

              <label className="flex flex-col gap-3 text-lg">
                Preferred time
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="bg-black border border-white/20 rounded-2xl px-5 py-4 text-white outline-none focus:border-white"
                />
              </label>
            </div>

            {meetingDate && meetingTime && !submitted && (
              <button
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="mt-14 px-12 py-5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xl tracking-[0.3em] hover:scale-105 hover:bg-white hover:text-black transition duration-500 shadow-[0_0_30px_rgba(255,255,255,0.25)] disabled:opacity-50"
              >
                {isSubmitting ? "SENDING..." : "SEND REQUEST →"}
              </button>
            )}

            {submitted && (
              <>
                <p className="mt-8 text-green-300 text-xl text-center">
                  Request sent! I’ll reach out soon with Zoom details.
                </p>

                {athleteCode && (
                  <div className="mt-8 rounded-3xl border border-yellow-300/40 bg-yellow-400/10 px-8 py-6 text-center shadow-[0_0_30px_rgba(250,204,21,0.25)]">
                    <p className="text-sm uppercase tracking-[0.25em] text-yellow-200 mb-3">
                      Your Athlete Code
                    </p>

                    <p className="text-4xl font-black tracking-[0.18em] text-yellow-100 break-words">
                      {athleteCode}
                    </p>

                    <p className="mt-4 text-gray-300 max-w-xl">
                      This is your personalized code. Later, you will use it
                      with your email to log into your athlete database and view
                      your portfolio, progress, pictures, training details, and
                      updates.
                    </p>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => {
                      window.location.href = "/";
                    }}
                    className="px-6 py-3 rounded-full border border-white/20 bg-white/10 text-base tracking-[0.15em] hover:bg-white hover:text-black transition duration-300"
                  >
                    HOME
                  </button>

                  <button
                    onClick={resetForm}
                    className="px-6 py-3 rounded-full border border-white/20 bg-white/10 text-base tracking-[0.15em] hover:bg-white hover:text-black transition duration-300"
                  >
                    START ANOTHER FORM
                  </button>
                </div>
              </>
            )}

            {submitError && (
              <p className="mt-8 text-red-300 text-xl text-center">
                {submitError}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
