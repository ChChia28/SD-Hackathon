# UrbanByte · SunD Wallet (v2)

Live demo for **SunD**, Team UrbanByte's township solar ecosystem for the Sime Darby Property University Hackathon 2026 (Township of Tomorrow). It follows the final pitch deck and appendix: every surface **generates**, one wallet **shares**, and the township **uses** the power where it is made.

- **Core:** SunD Bay (canopy + battery charging, 0 km transmission) and the SunD Wallet app
- **Complements:** SunD Walk (solar-roofed shaded walkways) and SunD Cool (solar-powered cool rooms on heat-alert days)
- **2027 extension:** SunD Balcony plug-in kits for condos, inside the Energy Commission's regulatory sandbox

**Live demo:** https://chchia28.github.io/SD-Hackathon/ (works offline after the first visit and can be installed to a phone's home screen)

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

## Four residents, one roof (deck slide 3)

| Person | Who | How SunD reaches them |
|---|---|---|
| **Aisyah**, 29 | Condo renter, no roof | 1 kW solar slice ≈ 110 kWh/month ≈ RM 40 off her bill at her own 36 sen rate |
| **Mr Lim**, 48 | Landed CREAM roof host (4.4 kWp = 1 MWp ÷ 228 roofs) | Credits on top of his lease; charges his e.MAS 5 with them |
| **Daniel**, 35 | Public EV driver | Pays per kWh (RM 1.40, surplus RM 1.10), Saver Credits RM 20 → 30 |
| **Uncle Tan**, 72 | B40, lives alone | Sponsored slice, 中文 + large text, heat alert → nearest SunD Cool in one tap |

## Pitch mode (deck order)

Open the presenter controls (beside the phone on a laptop; long-press the sun logo on a phone) and press **Start pitch mode**. Each step sets the person, time and screen, and shows the matching slide number above the phone. Use **← →**, a presentation clicker (Page Up/Down) or the arrows on the slide tag. **Esc** exits.

| # | Slide | What the audience sees |
|---|---|---|
| 1 | 3 · Target user | Aisyah's Home: her 1 kW slice |
| 2 | 4 · Solution | Bill today vs with her slice |
| 3 | 6 · How it works | 11 am solar-peak nudges (washer, pre-cool, charge) |
| 4 | 6 · How it works | Mr Lim at the 10-lot pilot bay in solar surplus |
| 5 | 6 · How it works | Charging, paid in credits |
| 6 | 5 · Innovation | Daniel's public price at the same bay vs market RM 1.30–1.80 |
| 7 | 6 · Hybrid | Night: bays on stored solar, grid only as backup |
| 8 | 7 · Visual concept | SunD Walk routes ranked by a heat map, −3.1 °C |
| 9 | 3 · People | Uncle Tan's heat alert in 中文, read aloud |
| 10 | 6 · How it works | SunD Cool check-in |
| 11 | 6 · 2027 extension | SunD Balcony waitlist |
| 12 | 9 · Feasibility | SDP dashboard: 7 KPIs + what-if calculator |
| 13 | 10 · Why win | One loop for Elmina |

## Presenter controls

| Control | What it does |
|---|---|
| Pitch mode | Guided demo in deck order (above) |
| Speed / fast-forward / weather | Simulated township clock and solar output |
| Viewing as | Aisyah, Mr Lim, Daniel, Uncle Tan; language EN / BM / 中文 and large text per person |
| Heat alert · 36 °C | MetMalaysia Level 1 alert: banner, SunD Cool open, read-aloud |
| Solar peak nudge | Jumps to 11 am to show the nudges |
| SDP pilot dashboard | Full-width dashboard for Sime Darby |
| QR code | The live link, so judges can open the demo on their phones |

## SDP pilot dashboard (`#/sdp`)

- **7 pilot KPIs** from appendix A5, each with baseline, month-6 target and status, plus the go / no-go on KPIs 1–3. Values are simulated live from the demo.
- **What-if calculator** using the appendix A3 formulas: bay size, sessions per lot per day, public price, public share and grid cost → net cash, payback after GITA, CO₂ and a payback curve. It reproduces the appendix table (e.g. 30 lots at 2.0 sessions → payback 4.7–6.8 years).
- Live status of every bay, tagged by roadmap phase (pilot, Phase 3 mall bay, Phase 4 network).

## Numbers and sources

All constants live in `src/data/constants.ts`, each tagged with its source or marked ASSUMPTION. The in-app **Sources** screen (Profile → Sources) lists the same links as the deck and appendix, plus the assumptions register. `tests/numbers.test.ts` (24 checks) fails the build if any figure drifts from the deck: Elmina Ridge 1 (228 homes, 1 MWp), 0.74 kg CO₂/kWh, slice value RM 40–57, A2 bay sizes and CO₂, A3 payback table, balcony figures, and translation placeholders.

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
  pages/       onboarding, home, wallet (slice, balcony), map (bays/walk/cool/eBike), cool, charge, rewards, sources, sdp dashboard
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
