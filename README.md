# Aurum — Finance Dashboard

An original personal / small-business finance dashboard, written from
scratch in React 19 + TypeScript + Vite + Tailwind CSS v4. All code,
copy, and demo content in this project is original. Dark "wealth
overview" theme (stone + gold), distinct from the light finance apps
elsewhere in the series (Tendly, Budget App, Embera-style).

## Honest note on the source

This project was inspired by a Code & Chill Facebook reel whose partial
title was "Finance Dashboard Animation". Only the partial title was
visible — Facebook's login wall blocked watching the video itself — so
this is **not a frame-by-frame copy**. It is a faithful interpretation
of that kind of dashboard (a finance dashboard) rebuilt in a clean
modern house style under the original brand name "Aurum".

## What it does

- **Net worth headline** — live-computed from the four accounts:
  Checking $8,425.60 + Savings $24,180.00 + Investments $52,640.75 −
  Credit card $2,318.40 = **$82,927.95** (verified by script).
- **Accounts list** — Checking, Savings, Investments, Credit card, each
  with its live balance (the credit card shows as money owed).
  Clicking an account filters the transaction list to that account
  (click again, or Clear filter, to show all).
- **Income vs expenses chart** — hand-drawn SVG grouped bars (income
  green, expenses rose) per week, with a **Sep / Oct / Nov 2026 month
  switcher** that genuinely re-aggregates that month's transactions
  and recomputes income, expenses, net and savings rate:
  - September 2026: income $6,174.50, expenses $2,474.24, net $3,700.26 (savings rate 59.9%)
  - October 2026: income $6,135.00, expenses $2,958.20, net $3,176.80 (savings rate 51.8%)
  - November 2026: income $6,438.75, expenses $2,718.19, net $3,720.56 (savings rate 57.8%)
  - All three verified by script from the seed data.
- **Investments portfolio** — six holdings (VTI, VXUS, BND, AAPL,
  MSFT, money-market cash) with an SVG allocation donut and per-holding
  value + share %. Holdings sum to **$52,640.75**, exactly the
  Investments account balance (verified by script): VTI 35.0%, VXUS
  18.7%, BND 14.3%, AAPL 11.8%, MSFT 8.8%, cash 11.4%.
- **Recent transactions** — 34 seed transactions across the three
  months, with category filter, account filter and text search. The
  list follows the selected month.
- **Add-transaction form** — description, amount, type
  (income/expense), category, account and date, with validation
  (description required, amount must be > $0). Submitting adds the
  transaction and updates the account balance, net worth, savings rate
  and chart live. Transactions you add can be deleted (which reverses
  their balance effect); seed transactions are fixed.
- **Bilingual EN / عربي** — full language toggle (saved in
  `localStorage` under `finance-dashboard-lang`); switches the whole UI
  to Arabic with RTL layout.
- **Reset demo data** — restores the original demo state.

Accounts, transactions and the selected month persist in
`localStorage` (keys prefixed `finance-dashboard-`); changes are stored
only in the visitor's own browser — nothing is sent anywhere. All money
math uses integer cents internally so sums are exact.

## Demo data

All accounts, holdings, transactions and figures are **fictional
sample data** for a made-up brand ("Aurum"), covering September –
November 2026. The footer labels the page as demo data.

## Run it

```bash
npm run build   # tsc + vite build -> dist/
npm run dev     # local dev server
npm run preview # serve the production build
```

## Tech

- React 19, TypeScript (strict), Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Phosphor icons (`@phosphor-icons/react`)
- Hand-rolled JSON i18n (`src/i18n.ts`, `locales/en/common.json`,
  `locales/ar/common.json`) — no i18n library
- Hand-drawn SVG charts (grouped bars + donut) — no chart library
