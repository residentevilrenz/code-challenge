# Problem 2 - Crypto Exchange

Interactive crypto swap UI built with React + TypeScript + Vite, styled with Tailwind CSS.

## Features

- Real-time swap quote based on fetched token prices.
- Searchable currency dropdown with icon badges.
- Currency list sourced from Switcheo token icons GitHub contents.
- Optional display of no-price currencies (disabled state).
- Loading, error, and success feedback states.
- Light red/white gradient theme.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)

## Project Structure

- `src/components/SwapForm.tsx` - swap form container and submit flow.
- `src/components/CurrencyDropdown.tsx` - reusable searchable dropdown UI.
- `src/components/TokenSelect.tsx` - maps token/currency data to dropdown options.
- `src/components/AmountInput.tsx` - numeric input with decimal validation.
- `src/hooks/usePrices.ts` - fetches/caches prices and available currencies.

## Environment Variables

Create/update `src/problem2/.env`:

```bash
SHOW_NO_PRICE_ITEMS=true
VITE_PRICES_URL=https://interview.switcheo.com/prices.json
VITE_GITHUB_TOKENS_URL=https://api.github.com/repos/Switcheo/token-icons/contents/tokens
```

- `SHOW_NO_PRICE_ITEMS=true` (default): show no-price currencies and disable them.
- `SHOW_NO_PRICE_ITEMS=false`: hide no-price currencies from the dropdown.
- `VITE_PRICES_URL`: price feed endpoint used by `usePrices`.
- `VITE_GITHUB_TOKENS_URL`: GitHub contents API endpoint for currency icon list.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Live Deployment (GitHub Pages)

This repo includes workflow `.github/workflows/deploy-problem2-pages.yml` to deploy `problem2` automatically on push to `main`.

- Workflow builds from `src/problem2`
- Uses `VITE_BASE_PATH=/code-challenge/currency-swap/`
- Publishes `src/problem2/dist` to GitHub Pages
