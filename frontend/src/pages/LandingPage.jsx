import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Brain, Eye, Activity, Stethoscope,
  MapPin, Phone, Mail, CheckCircle2, Check, AlertCircle
} from 'lucide-react';
import RecruiterWarning from '../components/RecruiterWarning';

/* -------------------------------------------------------------
   ONE-TIME SETUP (do this once in your project, not per-page):

   1) Add these fonts in index.html <head>:
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">

   2) In tailwind.config.js, extend the theme so classes like
      font-display / font-mono / text-teal-deep / text-amber work:

      theme: {
        extend: {
          fontFamily: {
            display: ['Fraunces', 'serif'],
            body: ['Inter', 'sans-serif'],
            mono: ['"IBM Plex Mono"', 'monospace'],
          },
          colors: {
            bone: '#F5F7F5',
            boneAlt: '#EBF0EC',
            ink: '#12241F',
            inkSoft: '#4B5D57',
            inkFaint: '#8A9A94',
            teal: '#1F5F5B',
            tealDark: '#12302E',
            amber: '#C8862B',
            amberSoft: '#F6E8CC',
            hline: '#DCE4DF',
          },
        },
      }

   If you don't want to touch tailwind.config.js right now, this file
   also works as-is using arbitrary value classes like bg-[#1F5F5B] —
   just leave the config edit for later.
--------------------------------------------------------------- */

const steps = [
  { tok: 'NO. 01', title: 'Create Account', desc: 'Sign up with your email and phone number in under a minute.' },
  { tok: 'NO. 02', title: 'Find Your Doctor', desc: 'Browse by department, or search a specialist by name.' },
  { tok: 'NO. 03', title: 'Book Appointment', desc: 'Pick a real open slot — what you see is what you get.' },
  { tok: 'NO. 04', title: 'Get Treatment', desc: 'Visit, get treated, and find your prescription online after.' },
];

const departments = [
  { name: 'Cardiology', desc: 'Heart care, pulse monitoring, and stroke recovery.', icon: Heart },
  { name: 'Neurology', desc: 'Brain, nervous system, and motor coordination.', icon: Brain },
  { name: 'Ophthalmology', desc: 'Eye diagnostics, vision checks, and laser care.', icon: Eye },
  { name: 'Pediatrics', desc: 'Child health, vaccination, and growth tracking.', icon: Activity },
  { name: 'General Medicine', desc: 'Everyday care, fevers, and full health check-ups.', icon: Stethoscope },
];

const specialists = [
  { name: 'Dr. Anjali Rajan', spec: 'Cardiologist', exp: '12 yrs exp', pulses: [1, 1, 1, 1, 0] },
  { name: 'Dr. Amit Verma', spec: 'Neurologist', exp: '10 yrs exp', pulses: [1, 1, 1, 0, 0] },
  { name: 'Dr. Neha Sharma', spec: 'Pediatrician', exp: '8 yrs exp', pulses: [1, 1, 1, 1, 1] },
  { name: 'Dr. Rohan Patel', spec: 'Dentist', exp: '7 yrs exp', pulses: [1, 1, 1, 0, 0] },
];

/** Counts up from 0 to `target` once it scrolls into view. */
function CountUp({ target, suffix = '', className = '' }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const duration = 1100;
            const start = performance.now();
            const tick = (now) => {
              const p = Math.min((now - start) / duration, 1);
              setValue(Math.floor(p * target));
              if (p < 1) requestAnimationFrame(tick);
              else setValue(target);
            };
            requestAnimationFrame(tick);
            io.unobserve(el);
          });
        },
        { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
      <span ref={ref} className={className}>
      {value}
        {target >= 100 ? '+' : ''}
        {suffix}
    </span>
  );
}

/** Fades + slides an element up once it scrolls into view. */
function Reveal({ as: Tag = 'div', className = '', children }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setInView(true);
              io.unobserve(el);
            }
          });
        },
        { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
      <Tag
          ref={ref}
          className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
      >
        {children}
      </Tag>
  );
}

function PulseBars({ pattern }) {
  return (
      <span className="flex items-end gap-[3px] h-4">
      {pattern.map((on, i) => (
          <i
              key={i}
              className={`block w-1 rounded-sm ${on ? 'bg-amber' : 'bg-hline'}`}
              style={{ height: `${8 + i * 2}px`, backgroundColor: on ? '#C8862B' : '#DCE4DF' }}
          />
      ))}
    </span>
  );
}

export default function LandingPage() {
  return (
      <div className="min-h-screen bg-bone text-ink font-body antialiased" style={{ backgroundColor: '#F5F7F5', color: '#12241F' }}>
        {/* keyframes that Tailwind's default config doesn't ship */}
        <style>{`
        @keyframes ecg-draw { to { stroke-dashoffset: -900; } }
        @keyframes pulse-dot { 0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(127,227,180,.5);} 50% { opacity:.55; box-shadow:0 0 0 6px rgba(127,227,180,0);} }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .ecg-line { fill:none; stroke:#C8862B; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:900; stroke-dashoffset:900; animation:ecg-draw 3.4s linear infinite; }
        .live-dot::before { content:''; display:inline-block; width:7px; height:7px; border-radius:50%; background:#7FE3B4; margin-right:6px; animation:pulse-dot 1.6s infinite; }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @media (prefers-reduced-motion: reduce) { .ecg-line { animation:none; stroke-dashoffset:0; } .live-dot::before { animation:none; } }
      `}</style>

        {/* ── NAVBAR ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(245,247,245,0.86)', borderColor: '#DCE4DF' }}>
          <div className="max-w-7xl mx-auto px-6 h-[74px] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg" style={{ color: '#12302E' }}>
            <span className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ backgroundColor: '#1F5F5B' }}>
              <svg viewBox="0 0 24 16" className="w-5 h-3.5">
                <polyline points="0,8 6,8 9,1 13,15 16,8 24,8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
              Priyansh Care
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: '#4B5D57' }}>
              <a href="#services" className="hover:text-[#12302E] transition-colors">Services</a>
              <a href="#doctors" className="hover:text-[#12302E] transition-colors">Doctors</a>
              <a href="#departments" className="hover:text-[#12302E] transition-colors">Departments</a>
              <a href="#about" className="hover:text-[#12302E] transition-colors">About</a>
              <a href="#contact" className="hover:text-[#12302E] transition-colors">Contact</a>
              <Link to="/api-tester" className="font-semibold hover:opacity-80" style={{ color: '#1F5F5B' }}>API Explorer</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2.5 text-[13.5px] font-semibold rounded-[11px] border transition-transform hover:-translate-y-px"
                  style={{ color: '#12302E', borderColor: '#DCE4DF' }}
              >
                Sign In
              </Link>
              <Link
                  to="/signup"
                  className="px-5 py-2.5 text-[13.5px] font-semibold rounded-[11px] text-white transition-transform hover:-translate-y-px"
                  style={{ backgroundColor: '#C8862B', boxShadow: '0 6px 16px rgba(200,134,43,0.28)' }}
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </header>

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section className="pt-16 pb-14 lg:pt-20 lg:pb-16">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">
            <div>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: '#C8862B' }}>
              <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#C8862B', boxShadow: '0 0 0 4px #F6E8CC' }} />
              Trusted by 50,000+ patients across India
            </span>

              <h1 className="font-display font-semibold leading-[1.06] text-[38px] lg:text-[52px] mt-4 mb-5" style={{ letterSpacing: '-0.01em' }}>
                Your health,<br />
                steadily <span style={{ color: '#C8862B' }}>monitored.</span>
              </h1>

              <p className="text-[16.5px] max-w-md mb-7" style={{ color: '#4B5D57' }}>
                Book real doctors, see real availability, and keep every prescription and record in one place — no waiting rooms required.
              </p>

              <div className="flex flex-wrap gap-3.5 mb-11">
                <Link to="/signup" className="px-6 py-3.5 text-sm font-bold rounded-xl text-white transition-transform hover:-translate-y-px" style={{ backgroundColor: '#C8862B', boxShadow: '0 6px 16px rgba(200,134,43,0.28)' }}>
                  Book Appointment
                </Link>
                <a href="#doctors" className="px-6 py-3.5 text-sm font-bold rounded-xl border transition-transform hover:-translate-y-px" style={{ color: '#12302E', borderColor: '#DCE4DF' }}>
                  Find a Doctor →
                </a>
              </div>

              <div className="flex border-t pt-5" style={{ borderColor: '#DCE4DF' }}>
                {[
                  { n: 500, l: 'Expert Doctors' },
                  { n: 50, s: 'K', l: 'Happy Patients' },
                  { n: 20, l: 'Departments' },
                  { n: 15, l: 'Years of Care' },
                ].map((s, i) => (
                    <div key={i} className={`flex-1 ${i > 0 ? 'border-l pl-4 ml-4' : ''}`} style={{ borderColor: '#DCE4DF' }}>
                      <div className="font-mono text-[23px] font-semibold" style={{ color: '#12302E' }}>
                        <CountUp target={s.n} suffix={s.s || ''} />
                      </div>
                      <div className="text-[10.5px] uppercase tracking-wider font-bold mt-1" style={{ color: '#8A9A94' }}>{s.l}</div>
                    </div>
                ))}
              </div>
            </div>

            {/* Live vitals card — signature element */}
            <div className="rounded-3xl p-7 text-white relative overflow-hidden" style={{ backgroundColor: '#12302E', boxShadow: '0 30px 60px -20px rgba(18,48,46,0.45)' }}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: '#9FC9C4' }}>Network Pulse</span>
                <span className="live-dot font-mono text-[11px]" style={{ color: '#7FE3B4' }}>LIVE</span>
              </div>

              <div className="rounded-2xl my-3.5 py-1.5 px-1" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg viewBox="0 0 300 90" preserveAspectRatio="none" className="w-full h-[90px]">
                  <polyline
                      className="ecg-line"
                      points="0,45 30,45 42,45 50,15 58,75 66,25 74,45 110,45 122,45 130,20 138,70 146,30 154,45 300,45 330,45 342,45 350,15 358,75 366,25 374,45"
                  />
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl p-3.5" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="font-mono text-xl font-semibold"><CountUp target={42} /></div>
                  <div className="text-[10.5px] mt-0.5" style={{ color: '#B7CFCB' }}>Doctors online</div>
                </div>
                <div className="rounded-xl p-3.5" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="font-mono text-xl font-semibold">8m</div>
                  <div className="text-[10.5px] mt-0.5" style={{ color: '#B7CFCB' }}>Avg. wait time</div>
                </div>
                <div className="rounded-xl p-3.5" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="font-mono text-xl font-semibold"><CountUp target={216} /></div>
                  <div className="text-[10.5px] mt-0.5" style={{ color: '#B7CFCB' }}>Booked today</div>
                </div>
              </div>

              <Link to="/signup" className="block w-full text-center py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: '#C8862B' }}>
                Check Live Slots
              </Link>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────── */}
        <section id="services" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="max-w-xl mb-12">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: '#C8862B' }}>
              <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#C8862B', boxShadow: '0 0 0 4px #F6E8CC' }} />
              How it works
            </span>
              <h2 className="font-display text-[28px] lg:text-[34px] font-semibold mt-3">Four steps, no queue tokens lost</h2>
              <p className="text-[15px] mt-3" style={{ color: '#4B5D57' }}>From registration to recovery, every step is tracked — the way it should have always worked.</p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((step, idx) => (
                  <Reveal key={idx}>
                    <span className="inline-block font-mono text-xs px-2.5 py-1 rounded-full mb-4" style={{ color: '#C8862B', backgroundColor: '#F6E8CC' }}>{step.tok}</span>
                    <h3 className="font-display font-semibold text-[17px] mb-2">{step.title}</h3>
                    <p className="text-[13.5px]" style={{ color: '#4B5D57' }}>{step.desc}</p>
                  </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── DEPARTMENTS ────────────────────────────────────────── */}
        <section id="departments" className="py-20" style={{ backgroundColor: '#EBF0EC' }}>
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="max-w-xl mb-12">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: '#C8862B' }}>
              <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#C8862B', boxShadow: '0 0 0 4px #F6E8CC' }} />
              Our departments
            </span>
              <h2 className="font-display text-[28px] lg:text-[34px] font-semibold mt-3">Care across every specialty</h2>
              <p className="text-[15px] mt-3" style={{ color: '#4B5D57' }}>Twenty departments, one shared record — so no doctor is ever starting from zero.</p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {departments.map((dep, idx) => {
                const Icon = dep.icon;
                return (
                    <Reveal key={idx}>
                      <div className="bg-white border rounded-2xl p-5 h-full transition-all hover:-translate-y-1" style={{ borderColor: '#DCE4DF' }}>
                        <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-white mb-3.5" style={{ backgroundColor: '#1F5F5B' }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-[15px] mb-1.5">{dep.name}</h3>
                        <p className="text-[12.5px] leading-relaxed" style={{ color: '#4B5D57' }}>{dep.desc}</p>
                      </div>
                    </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── DOCTORS ────────────────────────────────────────────── */}
        <section id="doctors" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="max-w-xl mb-12">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: '#C8862B' }}>
              <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#C8862B', boxShadow: '0 0 0 4px #F6E8CC' }} />
              Meet the team
            </span>
              <h2 className="font-display text-[28px] lg:text-[34px] font-semibold mt-3">Specialists you can actually get an appointment with</h2>
              <p className="text-[15px] mt-3" style={{ color: '#4B5D57' }}>Verified experience, live ratings, and a real seat waiting.</p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {specialists.map((doc, idx) => (
                  <Reveal key={idx}>
                    <div className="bg-white border rounded-2xl p-5 h-full flex flex-col transition-all hover:-translate-y-1" style={{ borderColor: '#DCE4DF' }}>
                      <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center font-display font-semibold text-lg mb-3.5" style={{ backgroundColor: '#EBF0EC', border: '1px solid #DCE4DF', color: '#12302E' }}>
                        {doc.name.charAt(4)}
                      </div>
                      <h3 className="font-semibold text-[16px] mb-0.5">{doc.name}</h3>
                      <span className="font-mono text-[10.5px] uppercase tracking-wide" style={{ color: '#C8862B' }}>{doc.spec}</span>

                      <div className="flex justify-between items-center mt-4 pt-3.5 border-t text-xs" style={{ borderColor: '#DCE4DF', color: '#4B5D57' }}>
                        <span>{doc.exp}</span>
                        <PulseBars pattern={doc.pulses} />
                      </div>

                      <Link to="/signup" className="mt-4 w-full text-center py-2.5 rounded-lg text-xs font-semibold border transition-colors" style={{ color: '#12302E', borderColor: '#DCE4DF' }}>
                        Book Session
                      </Link>
                    </div>
                  </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ──────────────────────────────────────── */}
        <section id="about" className="py-20" style={{ backgroundColor: '#EBF0EC' }}>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            <Reveal>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: '#C8862B' }}>
              <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#C8862B', boxShadow: '0 0 0 4px #F6E8CC' }} />
              Why choose us
            </span>
              <h2 className="font-display text-[26px] lg:text-[32px] font-semibold mt-3.5">Healthcare you can trust and rely on</h2>
              <p className="text-[14.5px] mt-3.5 max-w-md" style={{ color: '#4B5D57' }}>
                We pair real medical technology with people who pick up the phone — so care feels immediate, not automated.
              </p>

              <div className="flex flex-col gap-4 mt-6">
                {[
                  { t: 'NABH accredited hospital', d: 'Nationally certified for quality and safety standards.' },
                  { t: '24/7 emergency services', d: 'Round-the-clock care for critical situations.' },
                  { t: 'Digital health records', d: 'Every record secure and accessible, anytime.' },
                ].map((item, i) => (
                    <div key={i} className="flex gap-3.5">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: '#F6E8CC', color: '#C8862B' }}>
                    <Check className="w-3.5 h-3.5" />
                  </span>
                      <div>
                        <h4 className="font-semibold text-[14.5px]">{item.t}</h4>
                        <span className="text-[12.5px]" style={{ color: '#4B5D57' }}>{item.d}</span>
                      </div>
                    </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="grid grid-cols-2 gap-4">
              {[
                { n: '99%', l: 'Patient satisfaction' },
                { n: '500+', l: 'Specialist doctors' },
                { n: '24/7', l: 'Emergency support' },
                { n: '50K+', l: 'Lives touched' },
              ].map((s, i) => (
                  <div key={i} className="bg-white border rounded-2xl p-6 text-center" style={{ borderColor: '#DCE4DF' }}>
                    <span className="font-mono text-[30px] font-semibold block" style={{ color: '#12302E' }}>{s.n}</span>
                    <span className="text-[10.5px] uppercase tracking-wider font-bold block mt-1.5" style={{ color: '#8A9A94' }}>{s.l}</span>
                  </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ── CONTACT & BOOKING ──────────────────────────────────── */}
        <section id="contact" className="py-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-14 items-start">
          <Reveal>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: '#C8862B' }}>
            <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#C8862B', boxShadow: '0 0 0 4px #F6E8CC' }} />
            Contact us
          </span>
            <h2 className="font-display text-[26px] lg:text-[30px] font-semibold mt-3">Get in touch</h2>
            <p className="text-[13.5px] mt-2 mb-6" style={{ color: '#4B5D57' }}>Questions before you book? Our desk is staffed around the clock.</p>

            <div className="space-y-5">
              <div className="flex gap-3.5">
                <span className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F6E8CC', color: '#C8862B' }}><MapPin className="w-4 h-4" /></span>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#8A9A94' }}>Address</div>
                  <div className="font-semibold text-sm mt-0.5">Sector 14, Priyansh Care Hospital, New Delhi – 110001</div>
                </div>
              </div>
              <div className="flex gap-3.5">
                <span className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F6E8CC', color: '#C8862B' }}><Phone className="w-4 h-4" /></span>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#8A9A94' }}>Phone</div>
                  <div className="font-semibold text-sm mt-0.5">+91 98765 43210 · 011-2345-6789</div>
                </div>
              </div>
              <div className="flex gap-3.5">
                <span className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F6E8CC', color: '#C8862B' }}><Mail className="w-4 h-4" /></span>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#8A9A94' }}>Email</div>
                  <div className="font-semibold text-sm mt-0.5">care@priyanshcare.com</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="rounded-[22px] p-9 text-white" as="div">
            <div style={{ backgroundColor: '#12302E', borderRadius: '22px', padding: '38px', marginTop: '-38px', marginLeft: '-38px', width: 'calc(100% + 76px)' }}>
              <h3 className="font-display text-[22px] font-semibold text-white mb-2">Book an appointment</h3>
              <p className="text-[13.5px] mb-6" style={{ color: '#B7CFCB' }}>Create a free account to browse every doctor, see live availability, and book online in minutes.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                {['500+ specialist doctors', 'Real-time open slots', 'Digital prescriptions', 'Records that follow you'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12.5px]" style={{ color: '#E4EFED' }}>
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#7FE3B4' }} />
                      {f}
                    </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Link to="/signup" className="px-5 py-2.5 text-xs font-bold rounded-lg text-white" style={{ backgroundColor: '#C8862B' }}>
                  Create Account
                </Link>
                <Link to="/login" className="px-5 py-2.5 text-xs font-semibold rounded-lg border text-white" style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
        <footer className="border-t py-9" style={{ borderColor: '#DCE4DF', backgroundColor: '#EBF0EC' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2.5 font-display font-bold" style={{ color: '#12302E' }}>
              <span className="w-[26px] h-[26px] rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1F5F5B' }}>
                <svg viewBox="0 0 24 16" width="16" height="11">
                  <polyline points="0,8 6,8 9,1 13,15 16,8 24,8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
                Priyansh Care Hospital
              </div>
              <div className="flex gap-6 text-[12.5px]" style={{ color: '#4B5D57' }}>
                <a href="#about" className="hover:opacity-80">Privacy Policy</a>
                <a href="#about" className="hover:opacity-80">Terms of Service</a>
              </div>
            </div>
            <div className="text-center font-mono text-[11px] mt-6" style={{ color: '#8A9A94' }}>
              © 2026 PRIYANSH CARE HOSPITAL — ALL VITALS NORMAL
            </div>
          </div>
        </footer>
        <RecruiterWarning />
      </div>
  );
}