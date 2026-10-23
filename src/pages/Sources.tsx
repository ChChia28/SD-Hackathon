import { ExternalLink, FlaskConical } from 'lucide-react';
import { Card, PageHeader, SectionTitle } from '../components/ui';
import { ASSUMPTIONS, SOURCES, type Source } from '../data/sources';
import { useT } from '../lib/i18n';

const GROUPS: Source['group'][] = ['Sime Darby', 'Energy & regulation', 'EVs & charging', 'Heat & people', 'Costs & yield', 'Balcony solar'];

/** Every figure in the app traces back to the deck's sources, or is labelled as an assumption. */
export default function Sources() {
  const t = useT();
  return (
    <>
      <PageHeader title={t('Sources')} />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        <p className="text-[15px] text-ink-muted">{t('The same sources as the SunD deck and appendix. Everything else is labelled as an assumption below.')}</p>
        {GROUPS.map((g) => (
          <section key={g}>
            <SectionTitle>{t(g)}</SectionTitle>
            <Card className="divide-y divide-outline">
              {SOURCES.filter((s) => s.group === g).map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="flex items-start gap-3 px-4 py-3 hover:bg-surface">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold leading-5">{s.title}</div>
                    <div className="text-[13px] text-ink-subtle">{s.by}</div>
                    <div className="mt-0.5 text-[14px] text-ink-muted">{s.used}</div>
                  </div>
                  <ExternalLink size={16} className="mt-1 shrink-0 text-ink-subtle" />
                </a>
              ))}
            </Card>
          </section>
        ))}
        <section>
          <SectionTitle>{t('Assumptions (team estimates and demo values)')}</SectionTitle>
          <Card tone="sun" className="flex flex-col gap-2 p-4">
            {ASSUMPTIONS.map((a) => (
              <div key={a} className="flex items-start gap-2 text-[14px] leading-5">
                <FlaskConical size={15} className="mt-0.5 shrink-0 text-sun-deep" />
                <span>{a}</span>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </>
  );
}
