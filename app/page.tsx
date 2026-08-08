"use client";

import Image from "next/image";
import { useRef } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
      videoRef.current.play();
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      onMouseMove={playVideo}
    >
      {/* VIDEO BACKGROUND */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* LIGHT OVERLAY */}
      <div className="absolute inset-0 bg-black/5"></div>

      {/* WEBSITE CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* NAVBAR */}
        <nav
          onMouseEnter={pauseVideo}
          className="flex flex-col items-center justify-between gap-4 border-b border-white/10 px-4 py-5 text-center backdrop-blur-sm sm:px-8 md:flex-row md:text-left"
        >
          <h1 className="text-xl font-bold sm:text-2xl">TIPS WITH T</h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm sm:gap-5 sm:text-base lg:gap-6 lg:text-lg">
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
          onMouseEnter={pauseVideo}
          className="flex w-full justify-center px-4 pt-6 sm:justify-start sm:px-10 sm:pt-10"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="h-20 w-20 sm:h-[100px] sm:w-[100px]"
          />
        </div>

        {/* HERO SECTION */}
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
          <h1
            onMouseEnter={pauseVideo}
            className="animate-fadeIn text-5xl font-bold sm:text-6xl lg:text-7xl"
          >
            TIPS WITH T
          </h1>

          <p
            onMouseEnter={pauseVideo}
            className="mt-4 max-w-xl animate-fadeIn text-lg leading-7 text-gray-100 sm:text-2xl"
          >
            Private lessons, athletic development, and mentorship.
          </p>
          <div
            onMouseEnter={pauseVideo}
            className="flex flex-col items-center gap-5 mt-10 animate-fadeIn"
          >
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <a
                href="/lessons"
                className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:scale-105"
              >
                Book Lessons
              </a>

              <a
                href="/summercamps"
                className="rounded-xl border border-white px-6 py-3 transition hover:bg-white hover:text-black"
              >
                Summer Camps
              </a>
            </div>

            <a
              href="/login"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:bg-white hover:text-black hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] sm:px-8 sm:text-sm sm:tracking-[0.3em]"
            >
              Sign In
            </a>
          </div>
        </section>

        {/* SLOGAN */}
        <footer className="text-center pb-10">
          <h2 onMouseEnter={pauseVideo} className="slogan-text">
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
    </main>
  );
}
