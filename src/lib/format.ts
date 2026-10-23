const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('en-MY', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-MY');

export const fmtRm = (n: number) => `RM ${Math.abs(n).toFixed(2)}`;

export function fmtTime(t: number): string {
  const d = new Date(t);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h < 12 ? 'am' : 'pm'}`;
}

export const fmtDate = (t: number) => {
  const d = new Date(t);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const fmtDateTime = (t: number) => `${fmtDate(t)}, ${fmtTime(t)}`;

export const monthName = (t: number) => MONTHS_LONG[new Date(t).getMonth()];

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/** Real-world minutes shown as m:ss. */
export const fmtDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};
