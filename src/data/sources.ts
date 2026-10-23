/** The same sources the SunD deck and appendix cite (links copied from the PDFs). */
export interface Source {
  id: string;
  group: 'Sime Darby' | 'Energy & regulation' | 'EVs & charging' | 'Heat & people' | 'Costs & yield' | 'Balcony solar';
  title: string;
  by: string;
  url: string;
  /** What the app uses it for. */
  used: string;
}

export const SOURCES: Source[] = [
  { id: 'sdp-sr24', group: 'Sime Darby', title: 'Sustainability Report 2024, p.42–43', by: 'Sime Darby Property · May 2025', url: 'https://www.simedarbyproperty.com/sites/default/files/2025-05/SR2024.pdf', used: '228 homes, 1 MWp at Elmina Ridge 1; −40% Scope 1 & 2 by 2030' },
  { id: 'sdp-cream', group: 'Sime Darby', title: 'Residential solar launch under NETR', by: 'Sime Darby Property · Sep 2025', url: 'https://www.simedarbyproperty.com/press-releases/sime-darby-property-launches-nations-first-residential-solar-project-under-netr', used: 'CREAM roofs feed Elmina Innovation Park' },
  { id: 'sdp-elmina', group: 'Sime Darby', title: 'City of Elmina', by: 'Sime Darby Property', url: 'https://www.simedarbyproperty.com/commercial/city-of-elmina', used: '36,600 homes planned' },
  { id: 'sdp-netzero', group: 'Sime Darby', title: 'Net zero by 2050 pledge', by: 'Sime Darby Property · Nov 2023', url: 'https://www.simedarbyproperty.com/press-releases/sime-darby-property-pledges-achieve-net-zero-emission-2050', used: 'Net zero 2050' },
  { id: 'ec-gef', group: 'Energy & regulation', title: 'Grid Emission Factor 2022–2024 (provisional)', by: 'Energy Commission · Feb 2026', url: 'https://myenergystats.st.gov.my/documents/d/guest/grid-emission-factor-gef-in-malaysia-2022-2024-provisional-', used: '0.74 kg CO₂ per grid kWh' },
  { id: 'ec-atap', group: 'Energy & regulation', title: 'Guidelines for Solar ATAP', by: 'Energy Commission · 2026', url: 'https://www.st.gov.my/sites/default/files/2026-03/GUIDELINES-FOR-SOLAR-ACCELERATED_0.pdf', used: 'Solar car parks and covered walkways allowed (s.7.2)' },
  { id: 'ec-cac', group: 'Energy & regulation', title: 'SAC / CAC reduced by up to 40%', by: 'Energy Commission · Aug 2025', url: 'https://www.st.gov.my/system-access-charge-cress-and-community-access-charge-cream-reduced-40-driving-corporate-green', used: 'CREAM access charge 9 sen/kWh' },
  { id: 'edge-cress', group: 'Energy & regulation', title: 'CRESS system access charge now 18 sen/kWh', by: 'The Edge · Oct 2026', url: 'https://theedgemalaysia.com/node/821755', used: 'Cost of moving solar over the grid' },
  { id: 'star-sandbox', group: 'Energy & regulation', title: 'EC eyes 2027 energy regulatory sandbox', by: 'The Star · Jun 2026', url: 'https://www.thestar.com.my/business/business-news/2026/06/04/energy-commission-eyes-2027-launch-of-energy-regulatory-sandbox', used: 'SunD Balcony timing' },
  { id: 'tariff', group: 'Energy & regulation', title: 'TNB domestic tariff structure, July 2025', by: 'SoyaCincau · Jun 2025', url: 'https://soyacincau.com/2025/06/21/tnb-domestic-electricity-tariff-structure-july-2025-impact-changes/', used: '44.43 sen base rate' },
  { id: 'eei', group: 'Energy & regulation', title: 'Your new TNB bill explained', by: 'RinggitPlus · 2025', url: 'https://ringgitplus.com/en/blog/personal-finance-news/your-new-tnb-bill-explained-understanding-the-monthly-tariff-changes.html', used: '~35 sen / ~52 sen effective rates' },
  { id: 'tnb-afa', group: 'Energy & regulation', title: 'AFA and 600 kWh exemptions', by: 'TNB · 15 Sep 2026', url: 'https://www.tnb.com.my/assets/press_releases/20260915_23_bi.pdf', used: 'Effective rate above 600 kWh' },
  { id: 'gita', group: 'Energy & regulation', title: 'GITA asset list', by: 'MGTC / MyHIJAU · Apr 2025', url: 'https://www.myhijau.my/assets/pdf/Green%20Investement%20Tax%20Allowance%20(GITA)%20-%20April%202025.pdf', used: 'Tax allowance on chargers and solar' },
  { id: 'seda-p2p', group: 'Energy & regulation', title: 'Malaysia’s 1st pilot run of P2P energy trading', by: 'SEDA · 2020', url: 'https://www.seda.gov.my/malaysias-1st-pilot-run-of-peer-to-peer-p2p-energy-trading/', used: 'Why credits, not trading' },
  { id: 'kenanga', group: 'EVs & charging', title: 'EV Day 2026', by: 'Kenanga Research · Oct 2026', url: 'https://www.kenanga.com.my/wp-content/uploads/2026/10/Automotive-261019-SU-ESG-Thematic-Kenanga.pdf', used: '122,286 battery EVs' },
  { id: 'bt-bays', group: 'EVs & charging', title: 'EVs finally taking the lead in Malaysia', by: 'Business Today · Sep 2026', url: 'https://www.businesstoday.com.my/2026/09/21/evs-finally-taking-the-lead-in-malaysia/', used: '6,904 public charging bays' },
  { id: 'evsifu', group: 'EVs & charging', title: 'EV charging cost Malaysia 2026', by: 'EV Sifu', url: 'https://evsifu.com/ev-charging/ev-charging-cost-malaysia-2026/', used: 'Market DC RM 0.88–1.80/kWh' },
  { id: 'gentari', group: 'EVs & charging', title: 'DC charging price cut at select sites', by: 'SoyaCincau · Jul 2026', url: 'https://soyacincau.com/2026/07/15/gentari-dc-charging-fee-price-cut-select-locations/', used: 'RM 1.30–1.40 benchmark' },
  { id: 'emas', group: 'EVs & charging', title: 'Proton e.MAS 5 launched', by: 'Carz · Oct 2025', url: 'https://www.carz.com.my/2025/10/launched-proton-emas-5-2-variants-from-rm56800', used: '40.16 kWh, 325 km WLTP' },
  { id: 'edge-mix', group: 'EVs & charging', title: '2025 generation mix', by: 'Reuters / GSO via The Edge · Jan 2026', url: 'https://ceomorningbrief.theedgemalaysia.com/article/2026/1086/Home/8/788516', used: '58.6% coal, 33.1% gas' },
  { id: 'xu-bardhan', group: 'Heat & people', title: 'Street shade and heat stress (UTCI −3.1 °C)', by: 'Xu, Bardhan et al. · Sci. Total Environ. 958 (2025)', url: 'https://www.sciencedirect.com/science/article/pii/S0048969724080215', used: 'SunD Walk −3.1 °C feels-like' },
  { id: 'yong', group: 'Heat & people', title: 'Heatwaves and Selangor elderly hospitalisations', by: 'Yong et al. · IJERPH 20(10):5910 (2023)', url: 'https://www.mdpi.com/1660-4601/20/10/5910/htm', used: '+12.9% elderly admissions per +1 °C' },
  { id: 'bernama-600', group: 'Heat & people', title: '~1 million households past 600 kWh', by: 'Bernama TV · Sep 2026', url: 'https://www.bernama.com/tv/news.php?id=2608921', used: 'Heat turning into bills' },
  { id: 'dosm-lq', group: 'Heat & people', title: 'Special Report: Living Quarters, Census 2020', by: 'DOSM · Apr 2026', url: 'https://www.dosm.gov.my/uploads/release-content/file_20260423102527.pdf', used: '22.8% of homes are high-rise' },
  { id: 'dosm-pop', group: 'Heat & people', title: 'Current Population Estimates 2026', by: 'DOSM · Jul 2026', url: 'https://www.dosm.gov.my/uploads/release-content/file_20260730111244.pdf', used: '8.7% of Selangor is 65+' },
  { id: 'nhms', group: 'Heat & people', title: 'NHMS 2023 fact sheet', by: 'MOH', url: 'https://iku.nih.gov.my/images/nhms2023/fact-sheet-nhms-2023.pdf', used: 'Activity levels' },
  { id: 'heat-l1', group: 'Heat & people', title: '17 areas under Level 1 heat status', by: 'Bernama · Aug 2026', url: 'https://www.bernama.com/en/general/news.php?id=2598641', used: 'Heat-alert levels' },
  { id: 'sunveyor', group: 'Costs & yield', title: 'Kuala Lumpur solar yield (PVGIS / NASA POWER)', by: 'Sunveyor', url: 'https://www.sunveyor.com/solar/kuala-lumpur', used: '~1,402 kWh per kWp per year' },
  { id: 'trexon-carport', group: 'Costs & yield', title: 'Solar carport Malaysia', by: 'Trexon · 2026', url: 'https://trexon.my/solutions/solar-carport', used: '~2.5 kWp per bay' },
  { id: 'trexon-ev', group: 'Costs & yield', title: 'EV charger installation cost 2026', by: 'Trexon · Mar 2026', url: 'https://trexon.my/blog/ev-charger-installation-cost-malaysia-2026', used: 'Charger capex' },
  { id: 'cobler', group: 'Costs & yield', title: 'Commercial rooftop solar pricing', by: 'Cobler · Aug 2026', url: 'https://cobler.io/blog/rooftop-solar-cost-commercial-malaysia', used: 'Solar capex per kWp' },
  { id: 'kk-de', group: 'Balcony solar', title: 'Balkonkraftwerke: September 2026 figures', by: 'Bundesnetzagentur MaStR via kleineskraftwerk.de', url: 'https://kleineskraftwerk.de/blogs/magazin/balkonkraftwerke-september-2026-zahlen', used: '1.53 million plug-in systems in Germany' },
  { id: 'cap', group: 'Balcony solar', title: 'Balcony solar panels for clean energy transition', by: 'CAP via Aliran · 27 Aug 2026', url: 'https://aliran.com/civil-society-voices/program-solar-balkoni-dalam-peralihan-tenaga-bersih-balcony-solar-panels-for-clean-energy-transition', used: 'Call for a Malaysian scheme' },
  { id: 'selco', group: 'Balcony solar', title: 'SELCO guidelines', by: 'Energy Commission · 2025', url: 'https://www.st.gov.my/sites/default/files/2026-02/27032025-FULL-GUIDELINES-FOR-SOLAR-PHOTOVOLTAIC-INSTALLATION-FOR-SELCO_FINAL_0.pdf', used: 'No plug-in framework today' },
  { id: 'balkon-yield', group: 'Balcony solar', title: 'Balkonkraftwerk 2026: costs and yield', by: 'Verbraucherzentrale figures', url: 'https://www.monsterdealz.de/magazin/balkonkraftwerk', used: '~560 kWh per year per kit' },
];

/** Demo values that are the team's own, shown with an ASSUMPTION label (appendix A9 plus app-only demo values). */
export const ASSUMPTIONS = [
  'Solar yield 3.6 kWh/kWp/day (110 kWh per kW a month)',
  'Public price RM 1.40/kWh; surplus price RM 1.10/kWh',
  'Resident credit price 1.00 SC/kWh; surplus 0.80 SC/kWh',
  'Roof-host reward RM 0.10/kWh, +20% credit top-up, bill rebate capped at 50%, host charging price RM 0.90/kWh (SDP settings, A20)',
  'Real-world EV efficiency 7 km/kWh',
  'Session size 18 kWh; public share 70%; grid top-up RM 0.45/kWh; O&M RM 100/day (A3)',
  'Walkway roof carries one 1.2 m row of panels (~0.21 kWp per m²)',
  'Nudge savings per appliance (washer 1 kWh, pre-cool 1.5 kWh)',
  'Household use: Aisyah ≈490 kWh/month, bill ≈RM 162 (A11); slice credits at a flat 36 sen/kWh; Uncle Tan 200 kWh/month',
  'Cool-room visits, walkers, wallet counts and bay demand are simulated',
];
