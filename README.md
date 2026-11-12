# UrbanByte · SunD Wallet (v2)

Live demo for **SunD**, Team UrbanByte's township solar ecosystem for the Sime Darby Property University Hackathon 2026 (Township of Tomorrow). It follows the final pitch deck and appendix: every surface **generates**, one wallet **shares**, and the township **uses** the power where it is made.

- **Core:** SunD Bay (canopy + battery charging, 0 km transmission) and the SunD Wallet app
- **Complements:** SunD Walk (solar-roofed shaded walkways) and SunD Cool (solar-powered cool rooms on heat-alert days)
- **2027 extension:** SunD Balcony plug-in kits for condos, inside the Energy Commission's regulatory sandbox

**Live demo:** https://chchia28.github.io/SD-Hackathon/ (works offline after the first visit and can be installed to a phone's home screen)

The link opens a **home page** with two buttons:

- **Pitch mode:** the 10-slide walkthrough, one annotated app screen per slide (below).
- **Live prototype:** the full, clickable app.

Both have a **Home** button in the top corner to come back and switch. Links straight into the app still work, for example `#/pitch` (slide 1), `#/pitch/4` (slide 4) or `#/map`.

Built on Chan Kin Chung's original SunD Wallet prototype. v2 keeps its layout and components, recolours it to the Sime Darby palette (navy `#1A1F3A`, red `#ED1B24`, Inter), and adds the features from the final deck.

## Run it

Needs Node 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # checks every figure against the deck and appendix
npm run build      # type-check + tests + static site in dist/
```

On Windows, run these in Command Prompt (not PowerShell) inside this folder.

## Five people, one township (deck slide 3, plus a SunD Pass member)

| Person | Who | How SunD reaches them |
|---|---|---|
| **Aisyah**, 29 | Condo renter, no roof | 1 kW solar slice ≈ 110 kWh/month ≈ RM 40 off her bill at her own 36 sen rate |
| **Mr Lim**, 48 | Landed CREAM roof host (4.4 kWp = 1 MWp ÷ 228 roofs) | Credits on top of his lease; charges his e.MAS 5 with them |
| **Daniel**, 35 | Public EV driver | Pays per kWh (RM 1.40, surplus RM 1.10), Saver Credits +10–30% (RM 1.08 a kWh after a RM 500 top-up), SunD Pass RM 129 a month |
| **Farah**, 31 | SunD Pass member, drives in to work at Elmina Central Mall | Public Pass, RM 129 a month: 100 kWh of charging, unlimited eBike rides and unlimited mall parking, each one tap from Home |
| **Uncle Tan**, 72 | B40, lives alone | Sponsored slice, 中文 + large text, heat alert → nearest SunD Cool in one tap |

## SunD Pass and Saver Credits

Added after the deck (10 Nov 2026), so the deck, PDF and video still show the old Saver offer (RM 20 → 30 at high-solar bays).

| | What you get | Price |
|---|---|---|
| **SunD Pass** (Wallet → SunD Pass) | 100 kWh at any SunD Bay (≈ RM 90 at the resident rate, RM 140 public) + unlimited SunD eBike + unlimited mall parking, every month | Residents RM 79 (12-month plan) or RM 89 month to month · public RM 129 |
| **Saver Credits** (Wallet → Buy Saver) | Top up more, get more, spendable anywhere in SunD: charging at every bay, eBikes, mall parking, the clubhouse (residents) and mall shops | RM 50 → 55 (+10%) · RM 100 → 115 (+15%) · RM 200 → 240 (+20%) · RM 300 → 375 (+25%) · RM 500 → 650 (+30%), the Sheet's and the v12 deck's tiers |

- **Why the Pass stays the better deal:** a typical Pass month (all 100 kWh + 8 eBike rides + 8 parking entries) is worth RM 180 for the public (+40% on RM 129) and RM 130 for residents (+46% on RM 89, +65% on RM 79). Saver is capped at +30%, and a test fails the build if the top Saver bonus ever catches up. The Saver screen shows each pack in kWh and points regular chargers to the Pass; the Pass screen shows its typical-month value against Saver's best.
- **Pay order at a bay:** Pass kWh first (they reset monthly), then SunD Credits, then Saver Credits, then card.
- **Where each one works:** SunD Credits stay on solar-powered facilities (bays, eBikes, clubhouse, SunD Cool). Saver Credits work everywhere. The Pass covers charging, eBikes and mall parking.
- **Elmina Central Mall** (Rewards tab): mall parking (RM 3 an entry, free with the Pass) and shop vouchers, paid with Saver Credits.
- **After buying:** Home and Wallet show a SunD Pass card with kWh left and three tiles: **Charge** (Scan to charge), **eBike** (unlocks the nearest dock) and **Parking** (car park exit code). eBike and parking cost RM 0 on the Pass.
- The Pass screen lists what the Pass covers, each line with its own button, then the value used with its working (e.g. 66 kWh × RM 1.40 + 6 × RM 2 + 10 × RM 3 = RM 134.40 against RM 129) and auto-renew (locked on for the 12-month term). Prices and plans live in `src/data/constants.ts` (`PASS_PLANS`, `SAVER_PACKS`).
- **Farah** opens on day 14 of her public Pass: 34 of 100 kWh left, 6 rides and 10 parking entries used (seeded in `src/store/seed.ts`; a test checks the numbers).

## Pitch mode (follows SunD_Pitch_v12_10slides.pdf)

Ten slides, one for each page of the deck, each one a still screen of the app. Phones and laptops look the same.

- **Top bar:** **Home** (back to the home page), the slide number (Slide 4/10) and the slide's title. Nothing else.
- **The app:** fills nearly all the screen. Up to three coloured rings mark what matters, each with a few words on a tag right next to it (blue, amber, purple). You can scroll the app to see more, but nothing in it can be tapped; the rings and tags follow as you scroll.
- **Bottom:** Back, a dot per slide and **Slide X** for the next slide (**Explore the app** on the last). On slide 4 a row above shows the time of Aisyah's day with a **Next** button that steps through 7:00 AM → 8:10 → 8:30 → 8:45 → 2:00 PM → 8:00 PM.
- **Keys and swipes:** ← → (or a clicker's Page Up/Down) move between slides, ↑ ↓ step through the times on slide 4, Esc goes home. On a phone, swipe left or right on the top bar or the buttons.
- **Held still:** the clock is paused, a charge holds at its value and pop-ups stay hidden.

| Slide | App screen | Tags |
|---|---|---|
| 1 · SunD | Home (Aisyah) | One wallet for the township · powered by Elmina's own solar · use power while the sun shines |
| 2 · The problem | Township Impact | Solar Sime Darby paid for alone · SunD: every resident feels it · used where it is made |
| 3 · The solution | Map | Phase 2: Walk and Cool · Phase 1: mall roof + SunD Bay · green pin = spare solar |
| 4 · Her day | Six screens, one per time: balcony (7:00), RM 500 → RM 650 top-up (8:10), SunD Walk (8:30), charging held at 72% (8:45), SunD Cool on a heat-alert day (2:00 PM), wallet activity (8:00 PM) | Two or three per screen, e.g. "RM 500 in, RM 650 to spend" |
| 5 · Why SunD | Daniel at the mall bay | Made on site, by the sun · RM 1.40 ÷ 1.30 = RM 1.08 a kWh |
| 6 · Business model | Rewards: eBikes and the mall | eBikes on Sime Darby's solar · spent in Sime Darby's own mall |
| 7 · The numbers | Pilot business case (new screen) | NPV RM 2.26M · IRR 12% · 9 years · top-ups pay 53% of the build · positive in every case |
| 8 · Impact | Receipt of the 8:45 charge | Sime Darby: its sun, its bay · residents: RM 0 cash · planet: CO₂ avoided |
| 9 · Feasibility | Sign-up, township list | One Elmina precinct first · next townships once proven |
| 10 · The ask | Home, nearest bay and shortcuts | Charge at SunD Bay, on sunshine · enjoy solar-driven facilities |

The steps live in `src/components/pitch.tsx` (`PITCH_STEPS`); each tag points at an element tagged `data-pitch="…"`. **Pilot business case** (`#/pilot`, also under Profile) is a phone screen for Sime Darby with the deck's slide 7 figures (`src/data/pilot.ts`). The SDP dashboard is not a pitch step: it still uses the older appendix figures (payback 4.7–6.8 years, a month-6 decision), which differ from the v12 deck.

## Presenter controls

| Control | What it does |
|---|---|
| Pitch mode | Guided demo in deck order (above) |
| Speed / fast-forward / weather | Simulated township clock and solar output |
| Viewing as | Aisyah, Mr Lim, Daniel, Farah, Uncle Tan; language EN / BM / 中文 and large text per person |
| Heat alert · 36 °C | MetMalaysia Level 1 alert: banner, SunD Cool open, read-aloud |
| Solar peak nudge | Jumps to 11 am to show the nudges |
| SDP pilot dashboard | Full-width dashboard for Sime Darby |
| QR code | The live link, so judges can open the demo on their phones |

## SDP pilot dashboard (`#/sdp`)

- **7 pilot KPIs** from appendix A5, each with baseline, month-6 target and status, plus the go / no-go on KPIs 1–3. Values are simulated live from the demo.
- **What-if calculator** using the appendix A3 formulas: bay size, sessions per lot per day, public price, public share and grid cost → net cash, payback after GITA, CO₂ and a payback curve. It reproduces the appendix table (e.g. 30 lots at 2.0 sessions → payback 4.7–6.8 years).
- Live status of every bay, tagged by roadmap phase (pilot, Phase 3 mall bay, Phase 4 network).

## Numbers and sources

All constants live in `src/data/constants.ts`, each tagged with its source or marked ASSUMPTION. The in-app **Sources** screen (Profile → Sources) lists the same links as the deck and appendix, plus the assumptions register. `tests/numbers.test.ts` (28 checks) fails the build if any figure drifts from the deck: Elmina Ridge 1 (228 homes, 1 MWp), 0.74 kg CO₂/kWh, slice value RM 40–57, A2 bay sizes and CO₂, A3 payback table, balcony figures, and translation placeholders. It also checks the SunD Pass and Saver prices, the payment order and where each balance can be spent.

## Built to survive the stage

- **Offline:** a service worker precaches the whole app; fonts are bundled, nothing loads from the internet after the first visit.
- **Crash guard:** any error shows a one-tap *Reset demo* instead of a blank screen.
- **No backend:** everything is simulated in the browser; state is kept in `localStorage`. Use **Reset** to return to the starting data.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/` to GitHub Pages. In the repo, Settings → Pages → Source must be **GitHub Actions**.

## Project structure

```
src/
  data/        constants (deck figures), personas, bays, SunD Walk/Cool, nudges, sources, rewards
  sim/         solar curve, bay battery/demand model, pilot KPIs
  store/       Zustand store (simulation, wallet, heat alert, pitch mode), seed data, hooks
  lib/         pricing, A3 economics, i18n (EN/BM/中文), formatting
  components/  phone shell, UI kit, SunD cards, map, pitch mode, presenter controls, QR, crash guard
  pages/       onboarding, home, wallet (slice, balcony, Saver, SunD Pass), map (bays/walk/cool/eBike), cool, charge, rewards (eBike, mall, clubhouse), sources, sdp dashboard
tests/         numbers.test.ts
pitch/         deck source, screenshots and concept visuals from v1
```

Stack: Vite, React 18, TypeScript, Tailwind CSS v4, React Router (hash routing), Zustand, lucide-react, vite-plugin-pwa, Vitest.

## Limitations

- A prototype: payments, QR scanning, sign-in, the CREAM register and smart-meter data are simulated.
- KPI values, cool-room visits, walkers and wallet counts are simulated; targets and baselines come from the appendix.
- The township map is stylised and not to scale.
- Translations cover the resident-facing screens (Home, slice, heat alert, SunD Cool, Walk, Balcony, navigation); other screens fall back to English.

Team UrbanByte: Chia Cai Hong (leader, Universiti Malaya) · Tae Jie Hui (Universiti Malaya) · Chan Kin Chung (Monash University Malaysia)
