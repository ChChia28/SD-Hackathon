import qrcode from 'qrcode-generator';
import { useMemo } from 'react';

/** The public demo link, so judges can open it on their own phones. */
export const demoUrl = () => (typeof window === 'undefined' ? '' : `${window.location.origin}${window.location.pathname}`);

export function ShareQr({ size = 156 }: { size?: number }) {
  const url = demoUrl();
  const cells = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const n = qr.getModuleCount();
    const out: { x: number; y: number }[] = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) out.push({ x, y });
    return { n, out };
  }, [url]);
  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`-2 -2 ${cells.n + 4} ${cells.n + 4}`} width={size} height={size} className="shrink-0 rounded-xl bg-white" role="img" aria-label={`QR code for ${url}`} shapeRendering="crispEdges">
        <rect x={-2} y={-2} width={cells.n + 4} height={cells.n + 4} fill="#fff" />
        {cells.out.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill="#1A1F3A" />
        ))}
      </svg>
      <div className="min-w-0 text-[13px] leading-5 text-ink-muted">
        <div className="font-bold text-ink">Try it on your phone</div>
        <div className="break-all">{url.replace(/^https?:\/\//, '')}</div>
      </div>
    </div>
  );
}
