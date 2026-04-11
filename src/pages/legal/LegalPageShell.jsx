import { Link } from 'react-router-dom';

const NAVY = '#1A365D';

export default function LegalPageShell({ title, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="font-heading text-lg font-bold tracking-tight text-[#1A365D] hover:opacity-90"
          >
            VaxTrack
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-[#1A365D]"
          >
            ← Back to home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1
          className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: NAVY }}
        >
          {title}
        </h1>
        {lastUpdated && (
          <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>
        )}
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-600 sm:text-base">
          {children}
        </div>
      </main>
    </div>
  );
}
