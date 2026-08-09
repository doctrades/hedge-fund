# Doc Trades — Hedge Fund site

A static, no-build website. Open `index.html` in a browser (or drop the
folder on any static host — Netlify, GitHub Pages, Vercel, S3, etc.) and
it works.

## Structure

```
index.html            Home — hero, live stats, recent trades, calculator
performance.html       Full trade-by-trade log (expandable, per-investor)
investors.html          Investor directory with totals
template.html            Copy this to start a new page
assets/css/style.css      All styling (one file, CSS variables at the top)
assets/js/config.js        <-- THE ONLY FILE YOU EDIT DAY-TO-DAY
assets/js/app.js             Shared logic: currency, header/footer, calculator
assets/js/pages/*.js           Per-page rendering
```

Nothing is hard-coded in the HTML. Every number on every page — funds
raised, fund value, running days, trade tables, investor totals, the
calculator — is computed from `assets/js/config.js` at load time.

## Updating the fund

Open `assets/js/config.js`:

- **New trade** → add an entry to the `NEWS` array with a date, a
  `returnsMultiplier`, and the list of investors who rode it.
- **Payout actually sent** → flip that investor's `payoutGiven` to `true`
  on that trade. This is what moves the "overall %" on the homepage —
  unrealized gains don't count until a payout is marked given.
- **New investor** → just include them in a trade's `investors` array
  with a unique `id`.
- **Exchange rate** → update `usdToInr`.
- **Privacy** → `nameRevealed: false` shows investor IDs instead of
  names everywhere; `payoutsRevealed: false` masks payout figures on
  the Performance and Investors pages (fund-wide totals still show).
- **Calculator range** → `CONFIG.calculator` (min/max/step/default, in INR).

## Adding a new page

1. Copy `template.html`, rename it, edit the title/content.
2. Add it to `NAV_LINKS` in `assets/js/app.js` so it appears in the nav.
3. If it needs its own dynamic content, add
   `assets/js/pages/yourpage.js` following the pattern in
   `assets/js/pages/investors.js`, and include it at the bottom of the
   HTML file, after `app.js`.
4. Drop `<div data-component="calculator"></div>` anywhere you want the
   Expected Return Calculator to appear — it's a self-mounting widget.

## Notes

- Currency choice (USD/INR) is saved in `localStorage` and persists
  across pages.
- "Running for N days" is computed live from `fund.inceptionDate` vs.
  today's date — it's never stale.
- Fully responsive down to small phones; respects
  `prefers-reduced-motion`.
