import { Link } from 'react-router-dom';
import { FaLinkedin } from 'react-icons/fa';
import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiDatabase,
  FiGlobe,
  FiLayers,
  FiShield,
  FiZap,
} from 'react-icons/fi';

/** Dark brand blue — headings, logo, links */
const INK = '#15395a';
/** Primary action buttons */
const BTN = '#2563ea';

const navLinks = [
  { label: 'Overview', href: '#overview' },
  { label: 'Features', href: '#features' },
  { label: 'Guide', href: '#guide' },
  { label: 'For Whom', href: '#for-whom' },
];

const developers = [
  {
    name: 'Minidu',
    role: 'Identity & inventory systems',
    image: '/developers/minidu.png',
    linkedIn: 'https://www.linkedin.com/in/minidu0th/',
  },
  {
    name: 'Kaveen',
    role: 'Records, safety & notifications',
    image: '/developers/kaveen.png',
    linkedIn: 'https://www.linkedin.com/in/kaveenpsnd/',
  },
  {
    name: 'Nethmi',
    role: 'Locations & clinical scheduling',
    image: '/developers/nethmi.png',
    linkedIn: 'https://www.linkedin.com/in/nethmith/',
  },
  {
    name: 'Saniru',
    role: 'Appointments & queue intelligence',
    image: '/developers/saniru.png',
    linkedIn: 'https://www.linkedin.com/in/sanirurajapaksha/',
  },
];

function HeroGraphic() {
  return (
    <div className="relative mx-auto w-full max-w-md aspect-square flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.35), transparent 50%), radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.25), transparent 45%)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <div
            className="h-48 w-28 rounded-2xl border-2 border-white/80 shadow-2xl flex flex-col items-center justify-end pb-4 px-2"
            style={{
              background: 'linear-gradient(165deg, #e0f2fe 0%, #bae6fd 40%, #7dd3fc 100%)',
              boxShadow: '0 25px 50px -12px rgba(21, 57, 90, 0.22)',
            }}
          >
            <div className="absolute -top-3 left-1/2 h-8 w-10 -translate-x-1/2 rounded-t-lg border border-b-0 border-white/60 bg-sky-200/90" />
            <span
              className="text-[10px] font-bold tracking-widest text-[#15395a]/80"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              VACCINE
            </span>
            <div className="mt-2 h-16 w-12 rounded-lg bg-white/70 border border-sky-200/80" />
          </div>
          <div
            className="absolute -right-16 top-8 rounded-xl bg-white/95 px-3 py-2 shadow-lg border border-slate-100 text-xs font-semibold text-emerald-600 flex items-center gap-1.5"
            style={{ color: INK }}
          >
            <FiCheckCircle className="text-emerald-500 shrink-0" />
            Fully Protected
          </div>
          <div className="absolute -left-20 top-20 rounded-lg bg-white/95 px-2.5 py-1.5 shadow-md border border-slate-100 text-[11px] font-bold text-sky-600">
            98%
          </div>
          <div className="absolute -right-8 bottom-12 h-14 w-24 rounded-lg bg-gradient-to-br from-sky-100 to-cyan-50 border border-sky-200/60 shadow-md flex items-end justify-center pb-1 gap-0.5">
            {[40, 65, 45, 80, 55].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-sm bg-sky-400/90"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="font-heading text-xl font-bold tracking-tight"
            style={{ color: INK }}
          >
            VaxTrack
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[#15395a]"
              >
                {label}
              </a>
            ))}
          </nav>
          <Link
            to="/login"
            className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1d4ed8] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ea] focus-visible:ring-offset-2"
            style={{ backgroundColor: BTN }}
          >
            Track Now
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        id="overview"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-24 lg:px-8"
      >
        <div>
          <h1
            className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
            style={{ color: INK }}
          >
            Your Health, Perfectly Sequenced.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600 leading-relaxed">
            Empowering you to stay ahead of your health journey with clinical-grade vaccination
            tracking and digital safety management.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1d4ed8] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ea] focus-visible:ring-offset-2"
              style={{ backgroundColor: BTN }}
            >
              Get Started
            </Link>
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-7 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="mt-14 lg:mt-0">
          <HeroGraphic />
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-slate-100 bg-slate-50/80 py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <div className="flex justify-center lg:justify-start">
            <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 shadow-inner border border-sky-100/80">
              <FiGlobe className="h-28 w-28 text-sky-500/90" aria-hidden />
              <div className="absolute inset-6 rounded-full border border-dashed border-sky-300/50" />
              <FiActivity className="absolute top-10 right-10 h-8 w-8 text-[#15395a]/70" aria-hidden />
              <FiDatabase className="absolute bottom-14 left-8 h-7 w-7 text-sky-600/70" aria-hidden />
              <FiShield className="absolute bottom-10 right-12 h-7 w-7 text-cyan-600/70" aria-hidden />
            </div>
          </div>
          <div>
            <h2
              className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: INK }}
            >
              Bridging Technology and Immunity
            </h2>
            <p className="mt-6 text-slate-600 leading-relaxed">
              VaxTrack exists to give every family and facility a single, trusted view of
              immunization—so schedules, doses, and follow-ups are never left to guesswork.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We combine secure records, appointment orchestration, and proactive reminders in one
              platform built for real-world clinics and the people they serve.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2
              className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: INK }}
            >
              Precision Components
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Engineered to provide a comprehensive management layer for your vaccination ecosystem.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2 lg:gap-6">
            <article className="rounded-2xl border border-sky-100/80 bg-gradient-to-br from-sky-50 via-cyan-50/80 to-blue-50 p-8 shadow-sm lg:col-span-7 lg:row-span-2 lg:flex lg:flex-col lg:justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 text-[#15395a] shadow-sm">
                <FiLayers className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-heading text-xl font-bold" style={{ color: INK }}>
                Track Vaccines
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed max-w-lg">
                Real-time monitoring of your immunization timeline, due dates, and family coverage
                across dependents—aligned with how Sri Lankan facilities actually operate.
              </p>
            </article>
            <article className="rounded-2xl border border-sky-100/80 bg-gradient-to-br from-cyan-50 to-sky-100/60 p-6 shadow-sm lg:col-span-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[#15395a]">
                <FiDatabase className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold" style={{ color: INK }}>
                Vaccine Records
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Encrypted digital history available at your fingertips—with batch traceability for
                staff and clarity for patients.
              </p>
            </article>
            <article className="rounded-2xl border border-sky-100/80 bg-gradient-to-br from-sky-50 to-cyan-100/50 p-6 shadow-sm lg:col-span-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[#15395a]">
                <FiActivity className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold" style={{ color: INK }}>
                Side Effects
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Intelligent logging to track and manage post-vaccination symptoms with severity
                context for safer follow-up.
              </p>
            </article>
            <article className="rounded-2xl border border-sky-100/80 bg-gradient-to-br from-blue-50/90 to-sky-50 p-6 shadow-sm sm:col-span-1 lg:col-span-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[#15395a]">
                <FiZap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold" style={{ color: INK }}>
                Smart Notifications
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Automated email alerts for confirmations and overdue next-dose windows—so nothing
                slips through the cracks.
              </p>
            </article>
            <article className="rounded-2xl border border-sky-100/80 bg-gradient-to-br from-cyan-50/90 to-blue-50/80 p-6 shadow-sm sm:col-span-1 lg:col-span-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[#15395a]">
                <FiCalendar className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold" style={{ color: INK }}>
                Appointments
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Direct booking for patients and queue tools for clinical staff—including QR-ready
                check-in flows.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="guide" className="border-t border-slate-100 bg-slate-50/80 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-center text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: INK }}
          >
            The Journey to Safety
          </h2>
          <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                step: '01',
                title: 'Sign up',
                text: 'Create your secure medical profile in under 2 minutes.',
              },
              {
                step: '02',
                title: 'Add profile',
                text: 'Add dependents, historical context, or start fresh with guided data entry.',
              },
              {
                step: '03',
                title: 'Track',
                text: 'Relax while the system monitors immunization status and key milestones.',
              },
            ].map(({ step, title, text }) => (
              <div key={step} className="relative text-center md:text-left">
                <span
                  className="font-heading text-5xl font-bold select-none text-[#15395a]/[0.12]"
                >
                  {step}
                </span>
                <h3 className="mt-2 font-heading text-xl font-bold" style={{ color: INK }}>
                  {title}
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For whom */}
      <section id="for-whom" className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-sky-50/50 p-8 shadow-sm lg:p-10">
            <span className="inline-block rounded-full bg-[#15395a] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Staff portal
            </span>
            <h3 className="mt-6 font-heading text-2xl font-bold" style={{ color: INK }}>
              Medical management
            </h3>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Batch updates, inventory signals, clinic sessions, and queue control—built for hospital
              staff who need accuracy under pressure.
            </p>
            <div className="mt-8 flex justify-center rounded-xl bg-white/60 p-8 border border-sky-100">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-sky-200/80 border-2 border-white shadow-sm" />
                  <div className="h-2 w-12 rounded bg-slate-200" />
                </div>
                <div className="flex flex-col items-center gap-2 pt-4">
                  <div className="h-16 w-16 rounded-full bg-cyan-200/80 border-2 border-white shadow-sm" />
                  <div className="h-2 w-12 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          </article>
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-cyan-50/40 p-8 shadow-sm lg:p-10">
            <span className="inline-block rounded-full border-2 border-[#15395a] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#15395a]">
              Individual
            </span>
            <h3 className="mt-6 font-heading text-2xl font-bold" style={{ color: INK }}>
              Personal tracking
            </h3>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Personal and family dashboards: appointments, records, due doses, and side-effect
              reporting in one calm interface.
            </p>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex gap-2 border-b border-slate-100 pb-3">
                <div className="h-2 w-8 rounded bg-sky-300" />
                <div className="h-2 w-8 rounded bg-slate-200" />
                <div className="h-2 w-8 rounded bg-slate-200" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-[85%] rounded bg-slate-100" />
                <div className="h-3 w-[95%] rounded bg-sky-50" />
                <div className="h-3 w-[70%] rounded bg-slate-100" />
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Meet the Developers */}
      <section id="developers" className="border-t border-slate-100 bg-slate-50/80 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2
              className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: INK }}
            >
              Meet the Developers
            </h2>
            <p className="mt-4 text-slate-600">
              The clinical and technical experts behind the vision.
            </p>
          </div>
          <ul className="mt-14 grid auto-rows-fr gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {developers.map(({ name, role, image, linkedIn }) => (
              <li
                key={name}
                className="flex h-full min-h-0 flex-col items-center text-center"
              >
                <div className="mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md ring-2 ring-sky-100">
                  <img
                    src={image}
                    alt={`${name}, developer`}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
                <p className="mt-5 shrink-0 font-heading text-lg font-bold" style={{ color: INK }}>
                  {name}
                </p>
                <p className="mt-1 flex-1 px-2 text-sm leading-snug text-slate-600">{role}</p>
                <a
                  href={linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} on LinkedIn`}
                  className="mt-4 inline-flex h-11 w-full max-w-[11rem] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#2563ea] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ea] focus-visible:ring-offset-2"
                >
                  <FaLinkedin className="h-5 w-5 shrink-0" aria-hidden />
                  LinkedIn
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="font-heading text-lg font-bold" style={{ color: INK }}>
              VaxTrack
            </p>
            <p className="mt-1 text-sm text-slate-500">
              © {new Date().getFullYear()} VaxTrack. Developed for medical precision.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer">
            <Link to="/privacy" className="text-slate-600 hover:text-[#15395a]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-slate-600 hover:text-[#15395a]">
              Terms of Service
            </Link>
            <a href="#" className="text-slate-600 hover:text-[#15395a]">
              Developer Credits
            </a>
            <a href="#guide" className="text-slate-600 hover:text-[#15395a]">
              Documentation
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
