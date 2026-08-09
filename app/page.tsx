"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isEntryReady, setIsEntryReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const fallbackTimer = window.setTimeout(() => {
      setIsEntryReady(true);
    }, 2600);

    if (!video) {
      return () => window.clearTimeout(fallbackTimer);
    }

    video.playbackRate = 1;
    video
      .play()
      .then(() => {
        setIsEntryReady(true);
      })
      .catch(() => {
        return;
      });

    return () => window.clearTimeout(fallbackTimer);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
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

      {/* VIDEO BACKGROUND */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onPlaying={() => setIsEntryReady(true)}
        onCanPlay={() => setIsEntryReady(true)}
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* LIGHT OVERLAY */}
      <div className="absolute inset-0 bg-black/5"></div>

      {/* WEBSITE CONTENT */}
      <div
        className={`relative z-10 min-h-screen flex flex-col transition-opacity duration-1000 ${
          isEntryReady ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10 backdrop-blur-sm">
          <h1 className="text-2xl font-bold">TIPS WITH T</h1>

          <div className="flex gap-6 text-lg">
            <a href="/" className="hover:text-gray-300 transition">
              Home
            </a>

            <a href="/about" className="hover:text-gray-300 transition">
              About Me
            </a>

            <a href="/summercamps" className="hover:text-gray-300 transition">
              Summer Camps
            </a>

            <a href="/merch" className="hover:text-gray-300 transition">
              Merch
            </a>

            <a href="/contact" className="hover:text-gray-300 transition">
              Contact
            </a>
          </div>
        </nav>

        {/* LOGO */}
        <div
          className="w-full flex justify-start px-10 pt-10"
        >
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
        </div>

        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center text-center flex-1 px-6">
          <h1
            className="text-7xl font-bold animate-fadeIn"
          >
            TIPS WITH T
          </h1>

          <p
            className="text-2xl text-gray-100 mt-4 max-w-xl animate-fadeIn"
          >
            Private lessons, athletic development, and mentorship.
          </p>
          <div
            className="flex flex-col items-center gap-5 mt-10 animate-fadeIn"
          >
            <div className="flex gap-4">
              <a
                href="/lessons"
                className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
              >
                Book Lessons
              </a>

              <a
                href="/summercamps"
                className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition"
              >
                Summer Camps
              </a>
            </div>

            <a
              href="/login"
              className="rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:bg-white hover:text-black hover:shadow-[0_0_35px_rgba(255,255,255,0.45)]"
            >
              Sign In
            </a>
          </div>
        </section>

        {/* SLOGAN */}
        <footer className="text-center pb-10">
          <h2 className="slogan-text">
            FOR THE UNDERDOGS WHO WANT MORE
          </h2>
        </footer>
      </div>
      {/* =============================
          COACH DASHBOARD QUICK ACCESS
          Small private-looking lightning button for Coach T.
          This links to /coach without making it obvious or loud.
      ============================= */}
      <button
        onClick={() => (window.location.href = "/coach")}
        aria-label="Coach dashboard"
        title="Coach dashboard"
        className="fixed bottom-5 left-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 text-sky-100/70 shadow-[0_10px_35px_rgba(14,165,233,0.14)] backdrop-blur-md transition hover:border-sky-100/35 hover:bg-sky-100/10 hover:text-sky-100"
      >
        ⚡
      </button>

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
