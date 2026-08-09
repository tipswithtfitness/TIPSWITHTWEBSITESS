export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <h1 className="text-5xl font-bold sm:text-6xl">About Me</h1>

      <p className="mt-4 max-w-xl text-gray-400">
        Welcome to Tips With T. I help athletes grow through private coaching,
        mentorship, and athletic development.
      </p>

      <a
        href="/"
        className="mt-8 rounded-full border border-white/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
      >
        Back Home
      </a>
    </main>
  );
}
