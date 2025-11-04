import { BookMarked } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <section className="max-w-6xl mx-auto flex items-center justify-center py-28">
        <button
          type="button"
          className="group flex flex-col items-center gap-2"
          onClick={() => {
            // 'nueva reunión'
          }}
        >
          <div className="rounded-xl p-6 bg-[#ff6b3d] text-white shadow-md group-hover:shadow-lg transition">
            <BookMarked size={44} />
          </div>
          <span className="text-sm text-zinc-800 dark:text-zinc-200">
            Nueva reunión
          </span>
        </button>
      </section>
    </main>
  );
}