"use client";

import { useMemo, useState } from "react";

export default function LessonsPage() {
  const [selectedService, setSelectedService] = useState("");
  const [confirmedService, setConfirmedService] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [confirmedName, setConfirmedName] = useState(false);

  const [selectedJourney, setSelectedJourney] = useState("");
  const [confirmedJourney, setConfirmedJourney] = useState("");

  const [aboutText, setAboutText] = useState("");
  const [finishedAbout, setFinishedAbout] = useState(false);

  const [preparingEvent, setPreparingEvent] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [finishedEvents, setFinishedEvents] = useState(false);

  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleNavigation = (path: string) => {
    const confirmed = window.confirm(
      "Leaving this page will erase your progress. Continue?"
    );

    if (confirmed) {
      window.location.href = path;
    }
  };

  const getServiceFont = () => {
    if (confirmedService === "Athletic Training") {
      return "Impact, sans-serif";
    }

    if (confirmedService === "Nutritional Counseling") {
      return "Georgia, serif";
    }

    if (confirmedService === "General Fitness") {
      return "Trebuchet MS, sans-serif";
    }

    return "Arial Black, sans-serif";
  };

  const getServiceHighlightClass = () => {
    if (confirmedService === "Sprinting") {
      return "bg-yellow-400/20 border-yellow-300 text-yellow-200 shadow-[0_0_35px_rgba(250,204,21,0.9)]";
    }

    if (confirmedService === "Athletic Training") {
      return "bg-red-500/20 border-red-400 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.8)]";
    }

    if (confirmedService === "Nutritional Counseling") {
      return "bg-green-500/20 border-green-400 text-green-200 shadow-[0_0_30px_rgba(34,197,94,0.8)]";
    }

    return "bg-blue-500/20 border-blue-400 text-blue-200 shadow-[0_0_30px_rgba(59,130,246,0.8)]";
  };

  const ServiceHeader = () => (
    <div
      className={`mb-12 px-8 py-4 rounded-full border text-xl tracking-[0.2em] backdrop-blur-md transition duration-500 ${getServiceHighlightClass()}`}
      style={{ fontFamily: getServiceFont() }}
    >
      {confirmedService}
    </div>
  );

  const emailSubject = `${firstName} ${lastInitial}. - ${confirmedService}`;

  const emailBody = useMemo(() => {
    return `
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

Preferred Zoom meeting:
Date: ${meetingDate || "Not selected"}
Time: ${meetingTime || "Not selected"}

Meeting note:
Initial Zoom meetings are expected to take 15-45 minutes depending on how much the client wants to share and how long it takes to find the right options.
`;
  }, [
    firstName,
    lastInitial,
    clientEmail,
    confirmedService,
    confirmedJourney,
    aboutText,
    preparingEvent,
    eventDetails,
    meetingDate,
    meetingTime,
  ]);

  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    setSubmitError("");

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
          message: emailBody,
          category: confirmedService,
          journey: confirmedJourney,
          about: aboutText,
          special_event: preparingEvent,
          event_details:
            preparingEvent === "Yes"
              ? eventDetails || "No details provided."
              : "None",
          preferred_zoom_date: meetingDate,
          preferred_zoom_time: meetingTime,
        }),
      });

      const result = await response.json();

      if (result.success) {
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
          <button onClick={() => handleNavigation("/")} className="hover:text-gray-300 transition">
            Home
          </button>

          <button onClick={() => handleNavigation("/about")} className="hover:text-gray-300 transition">
            About
          </button>

          <button onClick={() => handleNavigation("/summercamps")} className="hover:text-gray-300 transition">
            Summer Camps
          </button>

          <button onClick={() => handleNavigation("/merch")} className="hover:text-gray-300 transition">
            Merch
          </button>

          <button onClick={() => handleNavigation("/contact")} className="hover:text-gray-300 transition">
            Contact
          </button>
        </div>
      </nav>

      {/* BACK BUTTON */}
      <button
        onClick={() => {
          if (submitted) {
            setSubmitted(false);
          } else if (meetingDate || meetingTime) {
            setMeetingDate("");
            setMeetingTime("");
          } else if (reviewConfirmed) {
            setReviewConfirmed(false);
          } else if (finishedEvents) {
            setFinishedEvents(false);
          } else if (preparingEvent) {
            setPreparingEvent("");
            setEventDetails("");
          } else if (finishedAbout) {
            setFinishedAbout(false);
          } else if (confirmedJourney) {
            setConfirmedJourney("");
          } else if (selectedJourney) {
            setSelectedJourney("");
          } else if (confirmedName) {
            setConfirmedName(false);
          } else if (confirmedService) {
            setConfirmedService("");
          } else if (selectedService) {
            setSelectedService("");
          } else {
            window.location.href = "/";
          }
        }}
        className="fixed bottom-8 left-8 text-gray-400 hover:text-white transition text-lg z-50"
      >
        {"< Back"}
      </button>

      {/* MAIN CONTENT */}
      <div className="w-full flex flex-col items-center mt-24">
        {/* QUESTION 1 */}
        {!confirmedService && (
          <>
            <h1 className="text-5xl font-bold mb-12 text-center">
              What are you looking for?
            </h1>

            <div className="flex flex-col gap-6 w-full max-w-md">
              <button
                onClick={() => setSelectedService("Athletic Training")}
                className={`py-4 rounded-xl text-xl font-black tracking-wide transition duration-300 border ${
                  selectedService === "Athletic Training"
                    ? "bg-red-500/20 border-red-400 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.8)]"
                    : "border-white hover:bg-red-500/20 hover:shadow-[0_0_25px_rgba(239,68,68,0.8)]"
                }`}
                style={{ fontFamily: "Impact, sans-serif" }}
              >
                ATHLETIC TRAINING
              </button>

              <button
                onClick={() => setSelectedService("Nutritional Counseling")}
                className={`py-4 rounded-xl text-xl transition duration-300 border ${
                  selectedService === "Nutritional Counseling"
                    ? "bg-green-500/20 border-green-400 text-green-200 shadow-[0_0_30px_rgba(34,197,94,0.8)]"
                    : "border-white hover:bg-green-500/20 hover:shadow-[0_0_25px_rgba(34,197,94,0.8)]"
                }`}
                style={{ fontFamily: "Georgia, serif" }}
              >
                Nutritional Counseling
              </button>

              <button
                onClick={() => setSelectedService("General Fitness")}
                className={`py-4 rounded-xl text-xl transition duration-300 border ${
                  selectedService === "General Fitness"
                    ? "bg-blue-500/20 border-blue-400 text-blue-200 shadow-[0_0_30px_rgba(59,130,246,0.8)]"
                    : "border-white hover:bg-blue-500/20 hover:shadow-[0_0_25px_rgba(59,130,246,0.8)]"
                }`}
                style={{ fontFamily: "Trebuchet MS, sans-serif" }}
              >
                General Fitness
              </button>

              <button
                onClick={() => setSelectedService("Sprinting")}
                className={`py-4 rounded-xl text-xl font-black italic tracking-widest transition duration-300 border ${
                  selectedService === "Sprinting"
                    ? "bg-yellow-400/20 border-yellow-300 text-yellow-200 shadow-[0_0_35px_rgba(250,204,21,0.9)]"
                    : "border-yellow-300 hover:bg-yellow-400/20 hover:shadow-[0_0_35px_rgba(250,204,21,0.9)]"
                }`}
                style={{ fontFamily: "Arial Black, sans-serif" }}
              >
                SPRINTING
              </button>
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

        {/* NAME SECTION */}
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
                onChange={(e) => setLastInitial(e.target.value.slice(0, 1).toUpperCase())}
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

        {/* QUESTION 2 */}
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
                {["Middle School Athlete", "High School Athlete", "Collegiate Athlete"].map((item) => (
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

        {/* QUESTION 3 */}
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

        {/* QUESTION 4 */}
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
                REVIEW →
              </button>
            )}
          </div>
        )}

        {/* REVIEW PAGE */}
        {finishedEvents && !reviewConfirmed && (
          <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
            <ServiceHeader />

            <h2 className="text-5xl font-bold text-center mb-6">
              Does everything look right?
            </h2>

            <p className="text-gray-400 text-center mb-10 text-lg max-w-xl">
              This helps me prepare for our first Zoom meeting where we’ll go over logistics,
              scheduling, and get to know you more.
            </p>

            <div className="w-full bg-white/5 border border-white/20 rounded-3xl p-8 text-lg space-y-5">
              <p><strong>Name:</strong> {firstName} {lastInitial}.</p>
              <p><strong>Email:</strong> {clientEmail}</p>
              <p><strong>Category:</strong> {confirmedService}</p>
              <p><strong>Journey:</strong> {confirmedJourney}</p>
              <p><strong>About:</strong> {aboutText}</p>
              <p><strong>Special event:</strong> {preparingEvent}</p>

              {preparingEvent === "Yes" && (
                <p><strong>Event details:</strong> {eventDetails || "No details added."}</p>
              )}
            </div>

            <button
              onClick={() => setReviewConfirmed(true)}
              className="mt-14 px-12 py-5 rounded-full border border-green-400 bg-green-500/20 text-green-100 text-xl tracking-[0.2em] hover:scale-105 hover:bg-green-400 hover:text-black transition duration-500 shadow-[0_0_30px_rgba(34,197,94,0.45)]"
            >
              EVERYTHING LOOKS GOOD!
            </button>
          </div>
        )}

        {/* MEETING SECTION */}
        {reviewConfirmed && (
          <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
            <ServiceHeader />

            <h2 className="text-5xl font-bold text-center mb-6">
              Choose a Zoom meeting time
            </h2>

            <p className="text-gray-400 text-center mb-10 text-lg max-w-2xl">
              The first meeting usually takes 15–45 minutes depending on how much you want
              to share and how much time we need to find the right options for you.
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
        onClick={() => {
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
          setReviewConfirmed(false);
          setMeetingDate("");
          setMeetingTime("");
          setSubmitted(false);
          setSubmitError("");
        }}
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




