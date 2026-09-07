/**
 * ============================================================
 *  DOC TRADES — SITE DATA
 * ============================================================
 *  This is the ONLY file you should need to edit day-to-day.
 *  Every page (index, performance, investors) reads from here.
 *  Nothing on the site is hard-coded HTML — it's all rendered
 *  from the objects below.
 * ============================================================
 */

const CONFIG = {
  // 1 USD = this many INR. Update this constant whenever you
  // want to refresh the peg used for the currency toggle.
  usdToInr: 97.25,

  fund: {
    name: "Doc Trades",
    tagline: "Hedge Fund",
    inceptionDate: "2026-08-01",       // YYYY-MM-DD
    profitSplitMultiplier: 0.8,        // investors keep 80% of gross return, fund keeps 20%
  },

  // Privacy switches.
  // nameRevealed:    true  -> show investor names
  //                  false -> show investor IDs only (e.g. "INV-NT")
  // payoutsRevealed: true  -> show computed payout / return figures per investor
  //                  false -> amounts are masked with "••••" on the Investors
  //                           and Performance pages (fund totals are unaffected)
  nameRevealed: true,
  payoutsRevealed: true,

  // Defaults for the "Expected Return Calculator" widget.
  // Values are in INR — the calculator converts to USD automatically
  // when the currency toggle is set to USD.
  calculator: {
    minINR: 500,
    maxINR: 50000,
    stepINR: 10,
    defaultINR: 2500,
  },
};

/**
 * Trade / performance log.
 * Add a new entry every time a trade closes. The most recent
 * entry (by date) is what drives the calculator's default
 * multiplier and the "latest trade" card on the homepage.
 *
 * investedINR   — the investor's standing capital that rode this trade
 * payoutGiven   — flip to true once the payout has actually been paid out
 */
const NEWS = [
  {
    id: "four_september_04",
    date: "2026-09-04",
    label: "Sept 4 trade",
    returnsMultiplier: 3.79,
    investors: [
      { id: "INV-NS", name: "Naman Raj Singh",   investedINR: 11000, payoutGiven: true },
      {id:"INV-SM", name:"Shreyash Mishra", investedINR:3800,payoutGiven:true},
      {id:"INV-YR", name:"Yash Rajpoot", investedINR:3200,payoutGiven:true},
    ],
  },

];
