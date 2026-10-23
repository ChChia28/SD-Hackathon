import { Building2, Coins, Gift, Home as HomeIcon, MapPin, PiggyBank, ReceiptText, Sun, Ticket, type LucideIcon } from 'lucide-react';
import { IconBubble, PageHeader } from '../../components/ui';
import { WhyCredits } from '../../components/visual';

type Tone = 'sky' | 'leaf' | 'sun' | 'berry' | 'slate';
const RULES: { Icon: LucideIcon; tone: Tone; title: string; fact: string; note: string }[] = [
  { Icon: Building2, tone: 'sun', title: 'Slice', fact: '1 kW', note: '≈110 kWh a month · no roof needed' },
  { Icon: ReceiptText, tone: 'sky', title: 'Slice value', fact: 'RM 40–57', note: 'a month at your own 35–52 sen TNB rate' },
  { Icon: HomeIcon, tone: 'sun', title: 'Roof host earns', fact: 'RM 0.10', note: 'per kWh, on top of the CREAM lease' },
  { Icon: Coins, tone: 'sun', title: 'Credit top-up', fact: '+20%', note: 'roof hosts: RM 1 → RM 1.20 in credits' },
  { Icon: Sun, tone: 'sky', title: '1 credit', fact: 'RM 1', note: 'at SunD Bays, SunD Cool, eBikes, clubhouse' },
  { Icon: Gift, tone: 'berry', title: 'Bonus', fact: '+5–10%', note: 'solar bay · surplus bay' },
  { Icon: Ticket, tone: 'leaf', title: 'Saver', fact: '+50%', note: 'RM 20 → 30 · 60%+ solar bays' },
  { Icon: MapPin, tone: 'slate', title: 'Cash-out', fact: 'Never', note: 'credits are SDP rebates, not electricity sales' },
];

export default function CreditRules() {
  return (
    <>
      <PageHeader title="Credit rules" />
      <div className="flex flex-col gap-5 px-5 pb-10 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {RULES.map((r) => (
            <div key={r.title} className="card flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2">
                <IconBubble tone={r.tone} size={36}>
                  <r.Icon size={18} />
                </IconBubble>
                <span className="text-[14px] font-bold text-ink-muted">{r.title}</span>
              </div>
              <div className="font-display text-[24px] font-bold leading-7 tabular">{r.fact}</div>
              <div className="text-[14px] leading-5 text-ink-muted">{r.note}</div>
            </div>
          ))}
        </div>

        <p className="-mt-2 text-center text-[13px] text-ink-subtle">Roof-host rate, top-up and bill cap are SDP settings and can change. Credits can’t be transferred, sold or cashed out.</p>

        <div className="card bg-leaf-wash border-leaf-soft p-4">
          <div className="mb-3 font-bold">Credits first, on purpose</div>
          <WhyCredits />
        </div>

        <div className="card bg-sky-wash border-sky-soft flex items-center gap-3 p-4">
          <IconBubble tone="sky">
            <PiggyBank size={22} />
          </IconBubble>
          <div>
            <div className="font-bold">Funded by</div>
            <div className="text-[14px] text-ink-muted">Share of the CREAM lease value · public charging margin · Saver pre-sales</div>
          </div>
        </div>
      </div>
    </>
  );
}
