import { ChevronRight, Presentation, Smartphone } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import township from '../assets/sund-township.jpg';
import { SunMark } from '../components/shell';
import { useStore } from '../store/useStore';

/**
 * The first page every visitor sees (the site link opens here): choose the annotated pitch walkthrough
 * or the live, clickable prototype. Both have a Home button back to this page.
 */
export default function Landing() {
  const nav = useNavigate();
  const pitchOn = useStore((s) => s.pitch.on);
  const setPitch = useStore((s) => s.setPitch);
  const setSpeed = useStore((s) => s.setSpeed);

  // Arriving here (Home button or browser back) always leaves pitch mode.
  useEffect(() => {
    if (!pitchOn) return;
    setPitch({ on: false, step: 0 });
    setSpeed(60);
  }, [pitchOn, setPitch, setSpeed]);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-surface">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-sky-soft opacity-70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-40 h-[520px] w-[520px] rounded-full bg-sun-soft opacity-80 blur-3xl" />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1120px] flex-col px-5 pb-6 pt-[max(20px,env(safe-area-inset-top))] sm:px-8 sm:pt-8">
        <header className="flex items-center gap-2.5">
          <SunMark size={30} />
          <span className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-sun">SunD · Team UrbanByte</span>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-8 py-8 lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-12">
          <section>
            <h1 className="flex items-center gap-3 text-[56px] font-extrabold leading-none tracking-[-0.02em] text-ink sm:text-[72px]">
              <SunMark size={56} />
              <span>
                Sun<span className="text-sun">D</span>
              </span>
            </h1>
            <p className="mt-4 text-[24px] font-bold leading-8 text-ink sm:text-[30px] sm:leading-10">
              The township wallet, <span className="text-sun">powered by its own sun.</span>
            </p>
            <p className="mt-2 text-[16px] leading-6 text-ink-muted">One solar ecosystem: Wallet · Solar roofs · SunD Bay · Home solar · Balcony · Walk · Cool</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => nav('/pitch')}
                className="group flex min-h-[132px] flex-col justify-between rounded-[24px] bg-sky p-5 text-left text-white shadow-soft transition-transform active:scale-[0.98]"
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                    <Presentation size={22} />
                  </span>
                  <ChevronRight size={22} className="text-white/60 transition-transform group-hover:translate-x-1" />
                </span>
                <span>
                  <span className="block text-[22px] font-bold leading-7">Pitch mode</span>
                  <span className="block text-[15px] leading-5 text-white/75">Our 10 slides, one annotated app screen each</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => nav('/')}
                className="group flex min-h-[132px] flex-col justify-between rounded-[24px] bg-sun p-5 text-left text-white shadow-soft transition-transform active:scale-[0.98]"
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                    <Smartphone size={22} />
                  </span>
                  <ChevronRight size={22} className="text-white/70 transition-transform group-hover:translate-x-1" />
                </span>
                <span>
                  <span className="block text-[22px] font-bold leading-7">Live prototype</span>
                  <span className="block text-[15px] leading-5 text-white/85">Tap around the full app: charge, top up, ride, cool off</span>
                </span>
              </button>
            </div>
            <p className="mt-3 text-[14px] text-ink-subtle">Switch any time with the Home button at the top.</p>
          </section>

          <figure className="rounded-[28px] border border-outline bg-page p-3 shadow-soft">
            <img src={township} alt="The SunD township: mall roof solar and the SunD Bay (Phase 1, the pilot), then home solar, balcony solar, SunD Walk and SunD Cool (Phase 2)." className="w-full rounded-[20px]" />
          </figure>
        </div>

        <footer className="text-[13px] leading-5 text-ink-subtle">Team UrbanByte · Sime Darby Property University Hackathon 2026 · Concept demo with simulated data</footer>
      </div>
    </main>
  );
}
