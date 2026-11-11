import { Building, CreditCard, Smartphone } from 'lucide-react';
import { Card } from './ui';

export const PAY_METHODS = [
  { id: 'FPX online banking', Icon: Building },
  { id: 'E-wallet', Icon: Smartphone },
  { id: 'Debit / credit card', Icon: CreditCard },
];

/** Demo payment method picker, shared by Saver top-ups and the SunD Pass. */
export function PayMethodPicker({ value, onChange }: { value: string; onChange: (method: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[19px] font-bold">Pay with</legend>
      <Card className="divide-y divide-outline">
        {PAY_METHODS.map((m) => (
          <label key={m.id} className="flex min-h-14 cursor-pointer items-center gap-3 px-4">
            <m.Icon size={22} className="text-ink-muted" />
            <span className="flex-1 font-bold">{m.id}</span>
            <input type="radio" name="method" checked={value === m.id} onChange={() => onChange(m.id)} className="h-5 w-5 accent-[var(--color-sky)]" />
          </label>
        ))}
      </Card>
    </fieldset>
  );
}
