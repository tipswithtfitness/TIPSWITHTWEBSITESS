export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <h1 className="text-5xl font-bold sm:text-6xl">Contact</h1>

      <p className="mt-4 text-gray-400">tipswitht.fitness@gmail.com</p>

      <a
        href="/"
        className="mt-8 rounded-full border border-white/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
      >
        Back Home
      </a>
    </main>
  );
}
