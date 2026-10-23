import { QrCode, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BayRow } from '../../components/bay';
import { Button, Card, IconBubble, PageHeader, SectionTitle } from '../../components/ui';
import { getBay } from '../../data/bays';
import { useBayViews } from '../../store/hooks';
import { useStore } from '../../store/useStore';

export default function Scan() {
  const nav = useNavigate();
  const views = useBayViews();
  const session = useStore((s) => s.session);
  const available = views.filter((v) => v.free > 0);
  const best = available.find((v) => v.status === 'surplus') ?? available[0];

  return (
    <>
      <PageHeader title="Scan to charge" />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        {session?.status === 'charging' && (
          <Card to="/charge/session" className="flex items-center gap-3 border-leaf bg-leaf-soft p-4">
            <IconBubble tone="leaf">
              <Zap size={22} fill="currentColor" />
            </IconBubble>
            <div className="font-bold">Charging at {getBay(session.bayId).name} · view</div>
          </Card>
        )}

        <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-[28px] bg-ink">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-ink-faint">
            <QrCode size={96} strokeWidth={1.25} className="text-ink-muted" />
            <span className="px-8 text-[15px]">Scan the charger QR</span>
          </div>
          {['left-5 top-5 border-l-4 border-t-4 rounded-tl-2xl', 'right-5 top-5 border-r-4 border-t-4 rounded-tr-2xl', 'left-5 bottom-5 border-l-4 border-b-4 rounded-bl-2xl', 'right-5 bottom-5 border-r-4 border-b-4 rounded-br-2xl'].map((c) => (
            <span key={c} className={`absolute h-12 w-12 border-sky-bright ${c}`} />
          ))}
          <span className="scan-line absolute inset-x-8 h-1 rounded-full bg-sky-bright shadow-[0_0_16px_var(--color-sky-bright)]" />
        </div>

        <Button size="lg" disabled={!best} onClick={() => best && nav(`/charge/setup/${best.bay.id}`)}>
          Tap to simulate scan
        </Button>

        <section>
          <SectionTitle>Or pick a SunD Bay</SectionTitle>
          <div className="flex flex-col gap-2">
            {available.slice(0, 4).map((v) => (
              <BayRow key={v.bay.id} v={v} to={`/charge/setup/${v.bay.id}`} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
