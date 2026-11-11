// SunD mentor progress update: 10 simple slides (16:9), printed to PDF with headless Chrome.
// Run from the repo root:  node pitch/progress-update/build.mjs
// Numbers come from the team's Google Sheet "SunD financial model and research tracker" and research doc (10 Nov 2026).
// Every money or sen figure is either worked out on the slide or tagged with where it comes from:
//   sourced (published rate, quote or law) · assumption (team assumption or placeholder) · design choice · model (Sheet output).
// All money figures use one scope, SunD's own business: 2 SunD Bays + 714 kWp of roof solar (Sheet "Book 1").
// Nothing here edits the Sheet or the doc.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const OUT_HTML = join(here, 'slides.html');
const OUT_PDF = join(root, 'SunD_Progress_Update_Mentors.pdf');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/* ---------- icons (lucide, from node_modules), font, images ---------- */
const ICON_DIR = join(root, 'node_modules/lucide-react/dist/esm/icons');
function icon(name, size = 18) {
  const src = readFileSync(join(ICON_DIR, `${name}.js`), 'utf8');
  const nodes = new Function(`return ${src.match(/createLucideIcon\("[^"]+", (\[[\s\S]*?\])\);/)[1]}`)();
  const inner = nodes.map(([tag, a]) => `<${tag} ${Object.entries(a).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
  return `<svg class="i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
const font = readFileSync(join(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).toString('base64');
const IMG = (file) => `data:image/jpeg;base64,${readFileSync(join(here, 'img', file)).toString('base64')}`;

/** One colour per section: it tints the top bar, the label badge and the headline accent. */
const TONES = { navy: '#1A1F3A', blue: '#3E63DD', amber: '#C2680A', red: '#ED1B24', green: '#2F9E6B' };

/* ---------- building blocks ---------- */
const f = (t) => `<span class="f">${t}</span>`; // the working behind a number
const yes = `<span class="ok">${icon('circle-check', 16)}</span>`;
const no = `<span class="no">${icon('circle-x', 16)}</span>`;
const warn = `<span class="wa">${icon('triangle-alert', 16)}</span>`;
const bottom = (t, tone = '') => `<div class="bottom ${tone}">${icon('arrow-right', 18)}<span>${t}</span></div>`;
/** Where a figure comes from. s = sourced, a = assumption / placeholder, d = design choice, m = model output. */
const tag = (t, k = 's') => `<span class="tg ${k}">${t}</span>`;
const LEGEND = `<span class="legend">${tag('sourced')} ${tag('assumption', 'a')} ${tag('design choice', 'd')} ${tag('model', 'm')}</span>`;
const hbar = (w, cls) => `<i class="hb ${cls}" style="width:${Math.round(w)}px"></i>`;

function slide({ n, label, title, sub, body, src, tone = 'navy', ic = 'sun', legend = true }) {
  // Headline accent follows the section colour; navy sections use red so the accent still stands out.
  return `<section class="slide" style="--tone:${TONES[tone]};--accent:${tone === 'navy' ? TONES.red : TONES[tone]}">
  <div class="topbar"></div>
  <div class="lbl"><span class="badge">${icon(ic, 15)}</span>${label}</div>
  <h1>${title}</h1>
  ${sub ? `<p class="sub">${sub}</p>` : ''}
  <div class="body">${body}</div>
  <footer><span>${src ?? ''}</span><span class="right">${legend ? LEGEND : ''}<span class="pg">${n} / 10</span></span></footer>
</section>`;
}

/* ---------- 1 · cover ---------- */
const week = [
  ['blue', 'route', 'Transmission cost', 'Use solar <b>where it’s made</b>; grid only tops up', 'p3–4'],
  ['amber', 'hard-hat', 'Upfront cost', '<b>RM 1.76M</b> per bay · buyers fund the solar', 'p5–6'],
  ['red', 'sun', 'SunD e-Panel', '<b class="bad">Rejected</b>', 'p7'],
  ['green', 'ticket', 'Saver + SunD Pass', 'Saver <b>chosen</b> · Pass for <b>public drivers</b>', 'p8'],
  ['navy', 'trending-up', 'Business model', 'NPV <b>RM 2.26M</b> · IRR <b>12%</b> · payback <b>9 yrs</b>', 'p9–10'],
];
const s1 = `<section class="slide cover">
  <div class="topbar"></div>
  <div class="cv-l">
    <div class="lbl plain">Sime Darby Property · University Hackathon 2026</div>
    <div class="logo">${icon('sun', 46)}<span>Sun<b>D</b></span></div>
    <h1 class="cv-h">Progress update</h1>
    <p class="sub">Mentor check-in · 11 Nov 2026 · Team UrbanByte</p>
    <div class="cv-week">${week.map(([t, ic, k, v, pg]) => `<div class="wk"><span class="badge" style="--tone:${TONES[t]}">${icon(ic, 15)}</span><b>${k}</b><span>${v}</span><i>${pg}</i></div>`).join('')}</div>
    <p class="names">Chia Cai Hong · Tae Jie Hui · Chan Kin Chung</p>
  </div>
  <div class="cv-img"><img src="${IMG('township.jpg')}" alt="SunD township concept: solar roofs, canopies and bays"></div>
  <footer><span>Figures: team Google Sheet “SunD financial model and research tracker” and research doc (10 Nov 2026). Details and sources on the pages shown.</span></footer>
</section>`;

/* ---------- 2 · recap ---------- */
const s2 = slide({
  n: 2,
  label: 'Recap',
  ic: 'target',
  title: 'The problem and our solution',
  legend: false,
  body: `<div class="g3">
    <div class="tile"><span class="tic">${icon('building-2', 20)}</span><div class="big">22.8%</div><div>of homes are high-rise: <b>no roof</b> for solar</div>${f('DOSM Census 2020')}</div>
    <div class="tile"><span class="tic">${icon('plug-zap', 20)}</span><div class="big">18 : 1</div><div>EVs per public charging bay: <b>no clean charging</b></div>${f('122,286 battery EVs ÷ 6,904 public bays (Kenanga, Business Today 2026)')}</div>
    <div class="tile"><span class="tic">${icon('utility-pole', 20)}</span><div class="big">0 kWh</div><div>of Elmina’s CREAM solar reaches <b>condo residents</b></div>${f('CREAM roofs sell their power to SDP’s Innovation Park (SDP, 2025)')}</div>
  </div>
  <div class="g2 mt24">
    <div class="sol"><img class="phone" src="${IMG('app-home.jpg')}" alt="SunD Wallet app home screen"><div><span class="k">Core 1</span><b>SunD Wallet</b><span>Township solar → credits for residents</span></div></div>
    <div class="sol"><img class="art" src="${IMG('bay.jpg')}" alt="SunD Bay: solar canopy over EV charging lots"><div><span class="k">Core 2</span><b>SunD Bay</b><span>Solar canopy + battery EV charging</span></div></div>
  </div>
  <p class="around">Around it: SunD Walk · SunD Cool · eBikes · balcony kits (2027)</p>
  ${bottom('This week we tested: <b>transmission cost · upfront cost · e-Panel · Saver & Pass · business model</b>')}`,
  src: 'Source: original pitch deck, slides 2–4.',
});

/* ---------- 3 · transmission: same kWh, two routes ---------- */
const val = [
  ['store', 'Mall', 'medium-voltage meter', 33.5, '29.83 energy + 3.67 AFA', 24.5, '29.83 energy + 3.67 AFA − 9 toll', 27],
  ['zap', 'SunD Bay / clubhouse', 'low-voltage meter', 54.4, '27.03 energy + 8.83 capacity + 14.82 network + 3.67 AFA', 21.7, '27.03 energy + 3.67 AFA − 9 toll', 60],
  ['house', 'Landed home', 'domestic meter', 44.4, '27.03 energy + 4.55 capacity + 12.85 network', 18.0, '27.03 energy − 9 toll', 59],
];
const s3 = slide({
  n: 3,
  label: 'Transmission cost · 1/2',
  tone: 'blue',
  ic: 'route',
  title: 'Solar is worth more <em>used where it’s made</em>',
  sub: 'We compared the same 1 kWh of solar, used two ways',
  body: `<div class="g2 routes">
    <div class="route good">${icon('building-2', 22)}<div><b>A · Use it on site</b><span>Panels feed the building’s own meter (Solar ATAP / SELCO). Each kWh saves the building’s <b>full TNB rate</b>.</span></div></div>
    <div class="route bad">${icon('utility-pole', 22)}<div><b>B · Send it through TNB’s lines (CREAM)</b><span>Power goes to a buyer ≤ 5 km away. The buyer saves only the <b>energy part</b> of the bill, and the seller pays a <b>9 sen toll</b> per kWh.</span></div></div>
  </div>
  <table class="tbl val mt16">
    <tr><th>Value of 1 kWh, sen</th><th class="r">A · On site</th><th class="r">B · Through TNB</th><th>Compare</th><th class="r">Value lost</th></tr>
    ${val
      .map(
        ([ic, place, meter, a, fa, b, fb, lost]) => `<tr><td>${icon(ic, 16)} <b>${place}</b><br><small>${meter}</small></td><td class="num good r">${a.toFixed(1)}${f(fa)}</td><td class="num bad r">${b.toFixed(1)}${f(fb)}</td><td class="cmp2">${hbar(a * 3.4, 'g')}${hbar(b * 3.4, 'r')}</td><td class="num r">−${lost}%${f(`(${a.toFixed(1)} − ${b.toFixed(1)}) ÷ ${a.toFixed(1)}`)}</td></tr>`,
      )
      .join('')}
  </table>
  ${f(`${tag('TNB tariff, Jul 2025')} energy, capacity and network charges per kWh · ${tag('TNB / EC')} AFA = monthly fuel surcharge, +3.67 sen in Sep 2026 · ${tag('Energy Commission')} 9 sen = CREAM access charge (was 15 sen) · CREAM only allows landed rooftops, not mall canopies`)}`,
  src: 'Source: TNB tariff schedule (1 Jul 2025) via myenergystats.st.gov.my; AFA Sep 2026 (paultan.org); Sheet Research list R-16, R-76, R-77, R-89, R-97.',
});

/* ---------- 4 · transmission: SDP's CREAM programme ---------- */
const wfMax = 1.6;
const wf = [
  ['Revenue', '5.91M kWh × RM 0.27', 1.6, 'pos', ''],
  ['− Toll', '5.91M kWh × RM 0.09', 0.53, 'neg', '−'],
  ['− Roof lease', '450 homes × RM 50 × 12', 0.27, 'neg2', '−'],
  ['− Upkeep', '4,500 kWp × RM 50', 0.23, 'neg2', '−'],
  ['= Profit a year', '1.60 − 0.53 − 0.27 − 0.23', 0.57, 'net', ''],
];
const s4 = slide({
  n: 4,
  label: 'Transmission cost · 2/2',
  tone: 'blue',
  ic: 'calculator',
  title: 'Check: SDP’s own CREAM programme <em class="neg">never pays back</em>',
  sub: '450 Elmina homes host rooftop solar; SDP sends the power through TNB’s lines to its Innovation Park',
  body: `<div class="g-55">
    <div>
      <h3>What goes in</h3>
      <table class="tbl small ins">
        <tr><th>Input</th><th>Value</th><th>Source</th></tr>
        <tr><td>Solar installed</td><td>450 homes × 10 kWp = <b>4,500 kWp</b></td><td>${tag('SDP report 2024')}</td></tr>
        <tr><td>Solar made</td><td>3.6 kWh per kWp a day → 4,500 × 3.6 × 365 = <b>5.91M kWh a year</b></td><td>${tag('PVGIS')}</td></tr>
        <tr><td>Price Innovation Park pays</td><td><b>RM 0.27</b> per kWh: the most a CREAM kWh is worth (energy part only, p3); real price is private</td><td>${tag('estimate', 'a')}</td></tr>
        <tr><td>Toll (access charge)</td><td><b>RM 0.09</b> per kWh sent</td><td>${tag('Energy Commission')}</td></tr>
        <tr><td>Roof lease</td><td>rent SDP pays each homeowner: <b>RM 50</b> a month</td><td>${tag('placeholder', 'a')}</td></tr>
        <tr><td>Upkeep</td><td>cleaning and repairs: <b>RM 50</b> per kWp a year (market RM 75–90, so likely worse)</td><td>${tag('placeholder', 'a')}</td></tr>
        <tr><td>Build cost</td><td><b>RM 3,500</b> per kWp installed (quotes RM 3,000–4,000)</td><td>${tag('installer quotes')}</td></tr>
      </table>
    </div>
    <div>
      <h3>What comes out, each year</h3>
      <div class="wf">${wf.map(([l, c, v, cls, sign]) => `<div class="wfr ${cls === 'net' ? 'net' : ''}"><div class="wfl"><b>${l}</b>${f(c)}</div><div class="wfb">${hbar((v / wfMax) * 240, cls)}<span>${sign}RM ${v.toFixed(2)}M</span></div></div>`).join('')}</div>
      <div class="g3 res mt16">
        <div><span>Build cost</span><b>RM 15.75M</b>${f('4,500 kWp × RM 3,500')}</div>
        <div><span>Payback</span><b class="bad">27.7 yrs</b>${f('15.75 ÷ 0.57 · longer than the 25-yr panel life')}</div>
        <div><span>NPV ${tag('model', 'm')}</span><b class="bad">−RM 9.67M</b>${f('value today of 25 yrs of profit at 8% a year, minus the build cost')}</div>
      </div>
    </div>
  </div>
  ${bottom('Our design: <b>use solar where it’s made → battery for the evening → TNB grid only tops up</b>', 'navy')}`,
  src: 'Source: Sheet CREAM tab and Inputs R1–R7 (8% discount rate = SDP’s cost of money, 25 yrs); Research list R-01, R-02, R-13, R-78, R-89. SDP has since stopped the programme.',
});

/* ---------- 5 · upfront cost: one bay ---------- */
// Colour by what the money buys: chargers blue, solar amber, battery green, the rest grey (validated palette).
const capex = [
  ['DC chargers 60 kW', '6 × RM 70,000', 420000, `RM 60–80k installed ${tag('Trexon 2026')}`, '#3E63DD'],
  ['AC chargers 22 kW', '24 × RM 11,500', 276000, `RM 8–15k installed ${tag('Trexon 2026')}`, '#3E63DD'],
  ['Solar canopy', '75 kWp × RM 4,250', 318750, `middle of RM 3,500–5,000 per kWp ${tag('Cobler, Progressture')}`, '#C2680A'],
  ['Battery', '180 kWh × RM 1,750', 315000, `middle of RM 1,500–2,000 per kWh ${tag('assumption', 'a')}`, '#2F9E6B'],
  ['Grid connection + substation', 'one-off', 300000, `TNB RM 45/kW + substation; RM 0 if mall has spare capacity ${tag('assumption', 'a')}`, '#A9AEBC'],
  ['Civil works, metering, design', '10% × RM 1,329,750 equipment', 132975, `${tag('assumption', 'a')}`, '#C9CCD4'],
];
const total = capex.reduce((a, c) => a + c[2], 0);
const s5 = slide({
  n: 5,
  label: 'Upfront cost · 1/2',
  tone: 'amber',
  ic: 'hard-hat',
  title: 'One 30-lot SunD Bay costs <em>RM 1.76M</em> to build',
  sub: '30 lots · one charger per lot (6 DC + 24 AC) · 75 kWp canopy (30 lots × 2.5 kWp) · 180 kWh battery for the evening',
  body: `<table class="tbl capex">
    <tr><th>Item</th><th>Qty × unit cost</th><th class="r">RM</th><th>Share</th><th>Where the unit cost comes from</th></tr>
    ${capex.map(([l, c, v, m, col]) => `<tr><td><span class="dot" style="background:${col}"></span><b>${l}</b></td><td>${c}</td><td class="num">${v.toLocaleString('en-MY')}</td><td><div class="share"><i style="width:${Math.round((v / total) * 360)}px;background:${col}"></i><span>${Math.round((v / total) * 100)}%</span></div></td><td class="muted">${m}</td></tr>`).join('')}
    <tr class="tot"><td>Total, one bay</td><td></td><td class="num">${total.toLocaleString('en-MY')}</td><td>100%</td><td></td></tr>
  </table>
  <table class="tbl small mt18">
    <tr><th>Replacements later</th><th>Calculation</th><th class="r">RM</th><th>Where it comes from</th></tr>
    <tr><td>Year 9 · DC charger power modules</td><td>25% × RM 420,000</td><td class="num">105,000</td><td>modules wear out in 8–10 yrs ${tag('assumption', 'a')}</td></tr>
    <tr><td>Year 12 · inverters</td><td>75 kWp × RM 350</td><td class="num">26,250</td><td>RM 270–400 per kWp installed ${tag('R-78')}</td></tr>
    <tr><td>Year 16 · battery</td><td>60% × RM 315,000</td><td class="num">189,000</td><td>battery prices keep falling ${tag('assumption', 'a')}</td></tr>
  </table>`,
  src: 'Source: Sheet Inputs S4–S8, C1–C10, L5, M1–M4; Summary (build cost RM 1,762,725); Research list R-13, R-14, R-15, R-77, R-78.',
});

/* ---------- 6 · upfront cost: who pays ---------- */
const s6 = slide({
  n: 6,
  label: 'Upfront cost · 2/2',
  tone: 'amber',
  ic: 'coins',
  title: 'Who pays? <em>Prepaid buyers fund the solar</em>, SDP the rest',
  sub: 'SunD’s own business at the start: 2 SunD Bays + solar on the mall, clubhouse and hall roofs',
  body: `<div class="g-64">
    <div>
      <table class="tbl build">
        <tr><th>What we build at the start</th><th>Calculation</th><th class="r">RM</th></tr>
        <tr><td>${icon('zap', 16)} <b>2 SunD Bays</b></td><td>2 × RM 1.76M (p5)</td><td class="num">3.53M</td></tr>
        <tr><td>${icon('sun', 16)} <b>Roof solar</b> on mall, clubhouse, hall</td><td>714 kWp × RM 3,500 per kWp</td><td class="num">2.50M</td></tr>
        <tr class="tot"><td>Total build</td><td></td><td class="num">6.02M</td></tr>
      </table>
      <h3 class="mt20">Who pays for it</h3>
      <div class="split"><div class="sp-b" style="width:50.2%">${icon('users', 16)} Prepaid buyers <b>RM 3.02M</b></div><div class="sp-a">${icon('building-2', 16)} SDP <b>RM 3.00M</b></div></div>
      <div class="g2 mt8 splitnote">
        <div><b>Prepaid buyers</b> pay for the <b>solar panels</b>${f('roof panels RM 2.50M + bay canopy panels 150 kWp × RM 3,500 = RM 0.53M')}</div>
        <div><b>SDP</b> pays for <b>everything else</b>: chargers, batteries, canopy frames, grid link${f('RM 6.02M − RM 3.02M = RM 3.00M · plus RM 0.12M to sell the packs (5% × RM 2.50M) = <b>RM 3.13M SDP cash at the start</b>')}</div>
      </div>
      ${f('Buyers prepay ringgit and get SunD credits worth 30% more (p7, p8); SDP keeps the panels and the power for 25 yrs ' + tag('design choice', 'd'))}
    </div>
    <div class="helps">
      <h3>What helps with the cost</h3>
      <div class="help good">${icon('circle-check', 20)}<div><b>Tax allowance (GITA)</b> ${tag('LHDN / MGTC')}<span>Not cash: SDP deducts 60% of what it spends on solar (100% for batteries) from taxable profit. Saves about <b>14.4%</b> of the solar cost.</span>${f('60% × 24% company tax = 14.4% · for EV chargers it drops from 100% to 60% in 2027 (Budget 2027)')}</div></div>
      <div class="help bad">${icon('circle-x', 20)}<div><b>Cash grants</b> ${tag('MIDA, SEDA, Selangor')}<span>None for a commercial solar car park or chargers.</span></div></div>
      <div class="help good">${icon('circle-check', 20)}<div><b>Green loans</b> ${tag('RHB, BNM')}<span>From <b>4.5%</b> a year (RHB); Bank Negara fund up to RM 10M at ≤ 5%.</span></div></div>
    </div>
  </div>`,
  src: 'Source: Sheet Precinct strategies (option 5: SDP cash at year 0 RM 3,125,400; option 1: RM 6,024,450), Inputs G3, G15, G21; Research list R-19 (GITA, Budget 2027), R-38, R-39. Year-2 canopy expansion and township items (home roofs, SunD Walk) not included.',
});

/* ---------- 7 · e-Panel ---------- */
const s7 = slide({
  n: 7,
  label: 'Feature · SunD e-Panel',
  tone: 'red',
  ic: 'sun',
  title: `SunD e-Panel <span class="stamp">${icon('ban', 22)}Rejected</span>`,
  sub: 'Idea: residents buy a solar panel on an SDP roof and get SunD credits back',
  body: `<table class="tbl ep">
    <tr><th>Version tested</th><th>Buyer pays</th><th>Buyer gets</th><th>Money back in</th><th>Result</th></tr>
    <tr><td><b>v1</b></td><td>RM 2,608 a panel${f('RM 1,925 panel + RM 683 share of a mall battery')}</td><td>30 sen credit per kWh, 20 yrs ${tag('design choice', 'd')}${f('0.55 kWp × 1,300 kWh × 30 sen = RM 214 a year')}</td><td><b>12 yrs</b>${f('2,608 ÷ 214')}</td><td>${no} ~5% a year, below EPF (~6%): nobody buys</td></tr>
    <tr><td><b>v2</b></td><td>RM 1,925 a panel${f('0.55 kWp × RM 3,500 per kWp')}</td><td>RM 322 credit a year, 10 yrs ${tag('design choice', 'd')}${f('715 kWh × 45 sen')}</td><td><b>6 yrs</b>${f('1,925 ÷ 322')}</td><td>${no} 10-yr wait, reads like an investment</td></tr>
    <tr><td><b>v3</b></td><td>RM 385 for 0.2 panel${f('0.2 × RM 1,925')}</td><td>RM 500 of credits at once ${tag('design choice', 'd')}</td><td><b>day one</b>${f('500 ÷ 385 = 1.30, i.e. +30%')}</td><td>${warn} works, but “own a panel” is still an investment risk</td></tr>
  </table>
  ${f('One panel = 0.55 kWp (550 W) · 1,300 kWh per kWp a year (conservative; Malaysia 1,350–1,450) · RM 3,500 per kWp installed (R-13)')}
  <div class="g3 mt18">
    <div class="why">${icon('gavel', 22)}<b>Investment law</b><span>Paying for a panel to get a benefit from SDP’s effort counts as an <b>interest scheme</b>: register it, or up to 10 yrs jail / RM 50M fine ${tag('Interest Schemes Act 2016')}</span></div>
    <div class="why">${icon('hourglass', 22)}<b>Slow for buyers</b><span>v1–v2 take 6–12 yrs to pay back; a home’s own roof solar pays back in <b>5.2 yrs</b>${f('5 kW system RM 19,000 ÷ RM 3,672 saved a year (R-85)')}</span></div>
    <div class="why">${icon('file-text', 22)}<b>Hard to explain</b><span>Panel ownership, sell-back prices and 20-yr terms: too complex for a resident buying a discount</span></div>
  </div>
  ${bottom('Kept: the prepay idea (pay RM 1, get RM 1.30 of credits) as <b>Saver top-ups</b>, with no panel attached (p8)')}`,
  src: 'Source: research doc tabs 1–3; Sheet Design review 1, 2, 18; Inputs G1–G21; Research list R-13, R-79, R-85; Credit plan (“adopt a panel” dropped 10 Nov).',
});

/* ---------- 8 · Saver + Pass ---------- */
const tiers = [
  [50, 55],
  [100, 115],
  [200, 240],
  [300, 375],
  [500, 650],
];
const s8 = slide({
  n: 8,
  label: 'Features · Saver Credits + SunD Pass',
  tone: 'green',
  ic: 'ticket',
  title: 'Saver top-ups <em>chosen</em>; SunD Pass works for public drivers',
  body: `<div class="g2 gap28">
    <div>
      <h3>Saver top-ups · top up more, get more ${tag('design choice', 'd')}</h3>
      <table class="tbl saver">
        <tr><th>Pay</th><th>Get in credits</th><th>Bonus</th><th class="r">Same as % off<br><small>1 − pay ÷ get</small></th></tr>
        ${tiers.map(([p, g]) => `<tr><td>RM ${p}</td><td>RM ${g}</td><td><div class="bonus"><i style="width:${Math.round(((g / p - 1) / 0.3) * 70)}px"></i><b>+${Math.round((g / p - 1) * 100)}%</b></div></td><td class="num r">${Math.round((1 - p / g) * 100)}% off</td></tr>`).join('')}
      </table>
      <table class="tbl small mt16">
        <tr><th>Market today ${tag('operator price lists')}</th><th>Price</th><th class="r">% off</th></tr>
        <tr><td>JomCharge Elite</td><td>RM 9.90 a month</td><td class="r">10%</td></tr>
        <tr><td>Gentari GO</td><td>RM 350–699 a year</td><td class="r">15–30%</td></tr>
        <tr><td>Shell Recharge Gold</td><td>RM 835 a year</td><td class="r">40%</td></tr>
        <tr><td>Our old Saver: RM 20 → 30, free ${tag('original deck')}</td><td>cut: beat every paid plan</td><td class="r bad">33%</td></tr>
      </table>
    </div>
    <div>
      <h3>SunD Pass · one monthly price ${tag('design choice', 'd')}</h3>
      <p class="passline"><b>RM 79</b> residents · <b>RM 129</b> public · up to 100 kWh of charging + eBike rides + mall parking</p>
      <table class="tbl pass">
        <tr><th>What a subscriber pays vs gets, a month</th><th class="r">Residents</th><th class="r">Public</th></tr>
        <tr><td>Pays for the Pass</td><td class="num r">RM 79</td><td class="num r">RM 129</td></tr>
        <tr><td>Same charging at the normal price${f('85 kWh used × RM 0.90 residents / RM 1.40 public')}</td><td class="num r">RM 76.50</td><td class="num r">RM 119</td></tr>
        <tr><td>+ eBike rides and parking included${f('assumed use, at list price')}</td><td class="num r">RM 40</td><td class="num r">RM 40</td></tr>
        <tr class="tot"><td>Value the subscriber gets</td><td class="num r good">RM 116.50</td><td class="num r good">RM 159</td></tr>
      </table>
    </div>
  </div>`,
  src: 'Source: Sheet Credit plan, Inputs D6, D7, D9, D12, G21, SunD Pass tab SP1–SP14, Design review 4; Research list R-68, R-82 (operator price lists). 85 kWh = 85% of the 100 kWh used (assumption).',
});

/* ---------- 9 · business models ---------- */
const strat = [
  [1, 'SDP pays for everything; no customer product', 1.52, 6.02, 'No money loop', 's'],
  [2, 'SDP pays; renters get free credit slices (original deck)', 1.0, 6.02, 'Gives credits away', 's'],
  [3, 'Buyers get tradeable tokens (NFT) + a cash share', -0.59, 5.65, 'Rejected', 'r'],
  [4, 'A partner owns the bays; SDP pays the roof solar', 0.94, 2.5, 'Fallback', 'a'],
  [5, 'SDP builds the bays; prepaid buyers fund the solar', 2.26, 3.13, 'Chosen', 'g'],
  [6, 'A partner owns the bays; prepaid buyers fund the solar', 1.38, 0.12, 'Fallback', 'a'],
];
const s9 = slide({
  n: 9,
  label: 'Business model · 1/2',
  ic: 'trending-up',
  title: '6 ways to run it: <em>who pays</em> is the difference',
  sub: 'Same 2 SunD Bays + roof solar in every option · NPV = value today of 25 yrs of cash at 8% a year · SDP cash = what SDP puts in at the start',
  body: `<div class="g-bm">
    <div>
      <table class="tbl bm">
        <tr><th>#</th><th>Who pays</th><th>NPV to SDP ${tag('model', 'm')}</th><th class="nw r">SDP cash ${tag('model', 'm')}</th><th>Verdict</th></tr>
        ${strat.map(([i, w, npv, cash, v, k]) => `<tr class="${i === 5 ? 'best' : ''}"><td>${i}</td><td>${w}</td><td><div class="bar"><i class="${npv < 0 ? 'neg' : ''}" style="width:${Math.round((Math.abs(npv) / 2.6) * 100)}px"></i><span>${npv < 0 ? '−' : ''}RM ${Math.abs(npv).toFixed(2)}M</span></div></td><td class="num r">RM ${cash.toFixed(2)}M</td><td><span class="vchip ${k}">${v}</span></td></tr>`).join('')}
      </table>
      ${f('Option 1: SDP pays the full RM 6.02M build (p6) · option 5: RM 3.13M (p6) · “prepaid buyers” = Saver top-ups: pay RM 1, get RM 1.30 of credits (p8)')}
    </div>
    <div class="whynot">
      <h3>Why not NFT, tokens or an investment product?</h3>
      <div class="wn">${icon('gavel', 20)}<div><b>The law</b>A tradeable token is a <b>security</b>: SC approval, RM 2,000 cap per buyer ${tag('Securities Commission')}. Selling for a return is an <b>interest scheme</b>: register, or up to 10 yrs jail / RM 50M ${tag('Interest Schemes Act')}</div></div>
      <div class="wn">${icon('banknote', 20)}<div><b>The money</b>Tokens lose <b>RM 0.59M</b> (option 3). The same roofs sold as an investment earn RM 0.14–0.30M vs <b>RM 1.20M</b> as prepaid credits ${tag('model', 'm')}</div></div>
      <div class="wn">${icon('users', 20)}<div><b>The buyers</b>Token buyers wait <b>9 yrs</b> to get their money back ${tag('model', 'm')}; a 6% cash return only matches EPF (~6%)</div></div>
    </div>
  </div>`,
  src: 'Source: Sheet Precinct strategies, Why this model, Public investment tab, Business models (model A); Research list R-79, R-93; Inputs G21. Option 5 was modelled as the e-Panel pack; the same RM 1 → RM 1.30 prepay now runs as Saver top-ups.',
});

/* ---------- 10 · chosen ---------- */
const s10 = slide({
  n: 10,
  label: 'Business model · 2/2',
  tone: 'green',
  ic: 'circle-check',
  title: 'Chosen: SDP builds the bays, <em>prepaid buyers fund the solar</em>',
  sub: `Option 5 (p9) · 2 SunD Bays + 714 kWp roof solar (+ canopy expansion in year 2) · 25 yrs · before tax ${tag('model', 'm')}`,
  body: `<div class="kpis">
    <div>${icon('trending-up', 20)}<span>NPV to SDP</span><b>RM 2.26M</b><small>value today of 25 yrs of cash, at 8% a year</small></div>
    <div>${icon('chart-no-axes-column', 20)}<span>IRR</span><b>12%</b><small>yearly return on the money put in</small></div>
    <div>${icon('calendar-clock', 20)}<span>Payback</span><b>9 yrs</b><small>until cash in covers cash out</small></div>
    <div>${icon('landmark', 20)}<span>SDP cash at the start</span><b>RM 3.13M</b><small>of the RM 6.02M build (p6)</small></div>
  </div>
  <div class="g2 gap28 mt18">
    <div>
      <h3>Why this one</h3>
      <ol class="whys">
        <li><b>Use power where it’s made</b> · no 9 sen toll (p3)</li>
        <li><b>Pay people in credits, not cash</b> · RM 1 of credit costs SDP about RM 0.65 ${tag('model', 'm')}${f('most credits are spent on SDP’s own services; e.g. RM 1 of charging only costs SDP the electricity behind it')}</li>
        <li><b>Sell a discount, not an investment</b> · no scheme to register (p9)</li>
      </ol>
      <p class="note">If nobody prepays, SDP pays for the solar itself (option 1): NPV still <b>RM 1.52M</b>.</p>
    </div>
    <div>
      <h3>How sure</h3>
      <table class="tbl scen">
        <tr><th></th><th>Bear</th><th>Base</th><th>Bull</th></tr>
        <tr><td>Charging sessions per lot a day ${tag('assumption', 'a')}</td><td>1.3</td><td>1.6</td><td>2.0</td></tr>
        <tr><td>Running cost per bay a day ${tag('assumption', 'a')}</td><td>RM 180</td><td>RM 180</td><td>RM 120</td></tr>
        <tr><td>Grid connection per bay ${tag('assumption', 'a')}</td><td>RM 450k</td><td>RM 300k</td><td>RM 0</td></tr>
        <tr><td>Years buyers take to spend credits ${tag('assumption', 'a')}</td><td>1</td><td>2</td><td>4</td></tr>
        <tr class="tot"><td>NPV ${tag('model', 'm')}</td><td>RM 0.69M</td><td class="good">RM 2.26M</td><td>RM 4.82M</td></tr>
        <tr><td>Payback ${tag('model', 'm')}</td><td>10.6 yrs</td><td>9.0 yrs</td><td>7.0 yrs</td></tr>
      </table>
    </div>
  </div>
  ${bottom('Need from SDP: <b>car-park traffic · transformer capacity · mall load data</b> · From regulators: <b>SSM view · BNM notice · SEDA registration</b>')}`,
  src: 'Source: Sheet Summary (NPV RM 2,256,654, IRR 12.0%, payback 9.0), Precinct strategies, Why this model, Scenarios tab, USP money loop (credit cost 0.65).',
});

/* ---------- styles ---------- */
const css = `
@font-face { font-family: 'Inter'; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 100 900; }
@page { size: 1280px 720px; margin: 0; }
:root { --blue-c: #3E63DD; --ink: #1A1F3A; --muted: #5B6270; --subtle: #8A8E9C; --line: #E4E5EA; --soft: #F4F5F7; --red: #ED1B24; --green: #1F8A5B; --amber: #C46A12; --blue: #2440A8; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #D9DBE1; }
body { font-family: 'Inter', system-ui, sans-serif; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.slide { --tone: #1A1F3A; width: 1280px; height: 720px; position: relative; overflow: hidden; background: #fff; padding: 44px 64px 0; break-after: page; }
@media screen { .slide { margin: 24px auto; box-shadow: 0 10px 30px rgba(0,0,0,.12); } }
.topbar { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: var(--tone); z-index: 3; }
.lbl { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--tone); }
.lbl.plain { color: var(--red); }
.badge { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: var(--tone); color: #fff; flex-shrink: 0; }
h1 { font-size: 34px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.15; margin-top: 6px; }
h1 em { font-style: normal; color: var(--accent, var(--tone)); } h1 em.neg { color: var(--red); }
.sub { font-size: 15.5px; color: var(--muted); margin-top: 6px; } .sub b { color: var(--ink); }
.body { margin-top: 20px; }
h3 { font-size: 15.5px; font-weight: 800; margin-bottom: 8px; }
h3 em { font-style: normal; color: var(--tone); }
footer { position: absolute; left: 64px; right: 64px; bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; font-size: 10.5px; color: var(--subtle); line-height: 1.35; }
footer .right { display: flex; align-items: center; gap: 14px; white-space: nowrap; }
.legend { display: inline-flex; gap: 4px; } .legend .tg { font-size: 9.5px; }
.pg { font-weight: 700; white-space: nowrap; }
.i { flex-shrink: 0; }
.mt8 { margin-top: 8px; } .mt16 { margin-top: 16px; } .mt18 { margin-top: 18px; } .mt20 { margin-top: 20px; } .mt24 { margin-top: 24px; }
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } .gap28 { gap: 32px; }
.g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.g-55 { display: grid; grid-template-columns: 1.05fr 1fr; gap: 32px; }
.g-64 { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 32px; }
.good { color: var(--green); } .bad { color: var(--red); } .muted { color: var(--muted); }
.ok { color: var(--green); display: inline-flex; vertical-align: -3px; } .no { color: var(--red); display: inline-flex; vertical-align: -3px; } .wa { color: var(--amber); display: inline-flex; vertical-align: -3px; }
.f { display: block; font-size: 11px; font-weight: 500; color: var(--subtle); margin-top: 3px; letter-spacing: 0; line-height: 1.45; }
.f .tg { font-size: 9.5px; }
.note { font-size: 13px; color: var(--muted); margin-top: 8px; line-height: 1.45; }

/* source tags */
.tg { display: inline-block; vertical-align: 1px; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: .02em; line-height: 1.5; white-space: nowrap; }
.tg.s { background: #E7ECFB; color: #2440A8; } .tg.a { background: #FCF0E3; color: #94470C; } .tg.d { background: #E4F3EB; color: #175C3C; } .tg.m { background: #E6E7EC; color: #1A1F3A; }

/* tables */
table.tbl { width: 100%; border-collapse: collapse; }
.tbl th { text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--subtle); padding: 0 10px 7px 0; border-bottom: 2px solid var(--ink); vertical-align: bottom; }
.tbl th small { font-size: 10px; text-transform: none; letter-spacing: 0; font-weight: 500; }
.tbl th .tg { text-transform: none; letter-spacing: 0; }
.tbl th.r, .tbl td.r { text-align: right; } .tbl th.nw { white-space: nowrap; }
.tbl td { font-size: 14px; padding: 8px 10px 8px 0; border-bottom: 1px solid var(--line); vertical-align: top; line-height: 1.35; }
.tbl td small { font-size: 11.5px; color: var(--muted); }
.tbl td .i { vertical-align: -3px; color: var(--tone); }
.tbl .num { font-weight: 800; white-space: nowrap; }
.tbl tr.tot td { font-weight: 800; border-bottom: 2px solid var(--ink); background: var(--soft); }
.tbl tr.best td { background: #EEF7F2; }
.tbl.small td { font-size: 12.5px; padding: 6px 8px 6px 0; }
.capex .num, .tbl.small td.num, .build .num { text-align: right; }

/* slide 3 */
.route { display: flex; gap: 12px; align-items: flex-start; border-radius: 12px; padding: 12px 16px; font-size: 13.5px; line-height: 1.45; color: var(--muted); }
.route.good { background: #EEF7F2; } .route.bad { background: #FDF1F1; }
.route.good .i { color: var(--green); } .route.bad .i { color: var(--red); }
.route b { display: block; font-size: 15px; color: var(--ink); margin-bottom: 2px; } .route span b { display: inline; font-size: inherit; }
.val td { vertical-align: middle; } .val .num { font-size: 20px; } .val td .f { font-size: 10.5px; font-weight: 500; }
.cmp2 { width: 210px; } .hb { display: block; height: 10px; border-radius: 0 3px 3px 0; margin: 3px 0; }
.hb.g { background: #2F9E6B; } .hb.r { background: #ED1B24; }

/* slide 4 */
.ins td:first-child { font-weight: 700; white-space: nowrap; } .ins td:last-child { white-space: nowrap; }
.wf { display: flex; flex-direction: column; gap: 6px; }
.wfr { display: grid; grid-template-columns: 210px 1fr; align-items: center; padding-bottom: 6px; border-bottom: 1px solid var(--line); }
.wfr.net { border-bottom: 2px solid var(--ink); }
.wfl b { font-size: 14px; } .wfl .f { margin-top: 1px; }
.wfb { display: flex; align-items: center; gap: 8px; } .wfb .hb { height: 14px; margin: 0; } .wfb span { font-size: 14px; font-weight: 800; white-space: nowrap; }
.hb.pos { background: #2F9E6B; } .hb.neg { background: #ED1B24; } .hb.neg2 { background: #F3A3A7; } .hb.net { background: var(--ink); }
.res > div { background: var(--soft); border-radius: 10px; padding: 10px 12px; }
.res > div > span:first-child { display: block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--subtle); }
.res > div > span:first-child .tg { text-transform: none; letter-spacing: 0; }
.res b { display: block; font-size: 22px; font-weight: 800; margin-top: 2px; }

/* slide 5 */
.capex .num { font-size: 15px; }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 8px; }
.share { display: flex; align-items: center; gap: 8px; } .share i { display: block; height: 12px; border-radius: 0 3px 3px 0; } .share span { font-size: 12.5px; color: var(--muted); }
.capex td:last-child { font-size: 12.5px; }

/* slide 6 */
.build .num { font-size: 16px; }
.split { display: flex; height: 46px; border-radius: 8px; overflow: hidden; font-size: 13.5px; color: #fff; }
.split > div { display: flex; align-items: center; padding: 0 14px; gap: 8px; } .sp-a { flex: 1; background: var(--ink); } .sp-b { background: #2F9E6B; } .split b { font-weight: 800; }
.splitnote > div { font-size: 13px; line-height: 1.45; color: var(--muted); } .splitnote b { color: var(--ink); }
.helps { background: var(--soft); border-radius: 12px; padding: 16px 18px; }
.help { display: flex; gap: 10px; margin-top: 12px; font-size: 13px; line-height: 1.45; color: var(--muted); }
.help.good > .i { color: var(--green); } .help.bad > .i { color: var(--red); }
.help b { color: var(--ink); } .help > div > b:first-child { font-size: 14.5px; } .help > div > span:not(.tg) { display: block; margin-top: 2px; }

/* slide 7 */
.ep td { font-size: 13.5px; }
.stamp { display: inline-flex; align-items: center; gap: 8px; margin-left: 14px; padding: 4px 14px; border: 3px solid var(--red); border-radius: 10px; color: var(--red); font-size: 24px; text-transform: uppercase; letter-spacing: .04em; transform: rotate(-3deg); vertical-align: 4px; }
.why { border-top: 3px solid var(--red); padding-top: 10px; font-size: 13.5px; line-height: 1.45; color: var(--muted); }
.why .i { color: var(--red); } .why > b { display: block; font-size: 15.5px; color: var(--ink); margin: 6px 0 2px; } .why span b { color: var(--ink); }

/* slide 8 */
.saver td { font-size: 14px; padding: 6px 10px 6px 0; } .saver .num { font-size: 14px; }
.bonus { display: flex; align-items: center; gap: 8px; } .bonus i { display: block; height: 12px; background: #2F9E6B; border-radius: 0 3px 3px 0; } .bonus b { font-size: 14px; }
.passline { font-size: 13.5px; color: var(--muted); margin-bottom: 8px; } .passline b { color: var(--ink); }
.pass td { font-size: 13.5px; padding: 6px 10px 6px 0; } .pass .num { font-size: 14.5px; }

/* slide 9 */
.g-bm { display: grid; grid-template-columns: 1.5fr 1fr; gap: 28px; }
.bm td { font-size: 13px; padding: 8px 10px 8px 0; vertical-align: middle; } .bm td:first-child { color: var(--subtle); font-weight: 700; width: 20px; } .bm td:nth-child(3) { width: 175px; }
.bm tr.best td:nth-child(2) { font-weight: 800; }
.bar { display: flex; align-items: center; gap: 8px; } .bar i { display: block; height: 14px; background: #A9AEBC; border-radius: 0 3px 3px 0; } .bar span { font-size: 13px; font-weight: 800; white-space: nowrap; }
.bm tr.best .bar i { background: #2F9E6B; } .bar i.neg { background: #F3A3A7; }
.vchip { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.vchip.g { background: var(--green); color: #fff; } .vchip.r { background: #FDECEC; color: #A10F16; } .vchip.a { background: #FCF0E3; color: #94470C; } .vchip.s { background: var(--soft); color: var(--muted); }
.whynot { background: var(--soft); border-radius: 12px; padding: 16px 18px; }
.wn { display: flex; gap: 10px; margin-top: 12px; font-size: 13px; line-height: 1.5; color: var(--muted); }
.wn .i { color: var(--red); margin-top: 1px; } .wn b { color: var(--ink); } .wn > div > b:first-child { display: block; font-size: 14.5px; }

/* slide 10 */
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.kpis > div { position: relative; background: #EEF7F2; border-radius: 12px; padding: 12px 16px; }
.kpis .i { position: absolute; top: 12px; right: 14px; color: var(--green); }
.kpis span { display: block; font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--subtle); }
.kpis b { display: block; font-size: 34px; font-weight: 800; letter-spacing: -0.03em; margin-top: 2px; }
.kpis small { display: block; font-size: 11.5px; color: var(--muted); }
.whys { padding-left: 20px; font-size: 14.5px; line-height: 1.5; color: var(--muted); } .whys li { margin-bottom: 8px; } .whys b { color: var(--ink); }
.scen td { font-size: 13px; padding: 6px 10px 6px 0; } .scen td:not(:first-child), .scen th:not(:first-child) { text-align: right; white-space: nowrap; }

/* cover */
.cover { display: grid; grid-template-columns: 610px 1fr; padding: 0; --tone: var(--red); }
.cv-l { padding: 44px 0 0 64px; }
.cv-img { position: relative; height: 720px; overflow: hidden; }
.cv-img img { width: 100%; height: 100%; object-fit: cover; object-position: 42% 62%; }
.cv-img::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0) 18%); z-index: 1; }
.logo { display: flex; align-items: center; gap: 10px; margin-top: 22px; color: var(--red); }
.logo span { font-size: 56px; font-weight: 800; letter-spacing: -0.04em; color: var(--ink); line-height: 1; } .logo b { color: var(--red); }
.cv-h { font-size: 40px; margin-top: 12px; }
.cv-week { margin-top: 26px; display: flex; flex-direction: column; gap: 10px; }
.wk { display: grid; grid-template-columns: 28px 150px 1fr 42px; gap: 12px; align-items: center; font-size: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.wk > span:nth-child(3) { color: var(--muted); } .wk > span:nth-child(3) b { color: var(--ink); } .wk b.bad { color: var(--red) !important; }
.wk i { font-style: normal; font-size: 11.5px; font-weight: 700; color: var(--subtle); text-align: right; }
.names { margin-top: 22px; font-size: 13.5px; color: var(--muted); }
.cover footer { right: auto; width: 520px; }

/* recap */
.tile { position: relative; border-top: 3px solid var(--red); padding-top: 12px; font-size: 15.5px; line-height: 1.4; color: var(--muted); }
.tile b { color: var(--ink); }
.tic { position: absolute; top: 14px; right: 0; width: 38px; height: 38px; border-radius: 10px; background: #FDECEC; color: var(--red); display: inline-flex; align-items: center; justify-content: center; }
.big { font-size: 46px; font-weight: 800; letter-spacing: -0.03em; color: var(--ink); line-height: 1.1; margin-bottom: 4px; }
.sol { display: flex; gap: 18px; align-items: center; background: var(--soft); border-radius: 14px; padding: 12px 18px 12px 12px; overflow: hidden; }
.sol img { flex-shrink: 0; border-radius: 10px; object-fit: cover; }
.sol img.phone { width: 96px; height: 150px; object-position: top; border: 3px solid var(--ink); border-radius: 14px; }
.sol img.art { width: 230px; height: 150px; object-position: 40% 55%; }
.sol .k { display: block; font-size: 11.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--red); }
.sol b { display: block; font-size: 21px; color: var(--ink); margin-top: 2px; } .sol span:not(.k) { display: block; font-size: 15px; color: var(--muted); margin-top: 4px; }
.around { font-size: 15px; color: var(--muted); margin-top: 14px; }

/* bottom line */
.bottom { display: flex; align-items: center; gap: 10px; margin-top: 16px; padding: 11px 16px; border-radius: 10px; background: var(--soft); font-size: 14.5px; }
.bottom .i { color: var(--red); }
.bottom.navy { background: var(--ink); color: #fff; } .bottom.navy .i { color: #FF8A8F; }
`;

/* ---------- assemble, write, print ---------- */
const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>SunD · mentor progress update · 11 Nov 2026</title><style>${css}</style></head>
<body>
${[s1, s2, s3, s4, s5, s6, s7, s8, s9, s10].join('\n')}
</body></html>`;
writeFileSync(OUT_HTML, html);
console.log('wrote', OUT_HTML);

if (existsSync(CHROME)) {
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw', '--virtual-time-budget=5000', `--print-to-pdf=${OUT_PDF}`, pathToFileURL(OUT_HTML).href], { stdio: 'ignore' });
  console.log('wrote', OUT_PDF);
} else {
  console.log('Chrome not found: open slides.html in a browser and print to PDF (landscape, no margins).');
}
