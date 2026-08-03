/* ============================================================
   DOC TRADES HEDGE FUND — DATA FILE
   ------------------------------------------------------------
   This is the ONLY file you should need to edit day-to-day.
   Update numbers here and the site rebuilds itself on refresh.
   All monetary figures below are stored in USD; the site
   converts to INR automatically using CONFIG.usdToInr.
   ============================================================ */

const CONFIG = {
    // 1 USD = this many INR. Update this constant whenever you
    // want to refresh the peg used for the currency toggle.
    usdToInr: 98.22,

    fund: {
        name: "Doc Trades Hedge Fund",
        inceptionDate: "2026-08-01",   // YYYY-MM-DD
        totalRaisedUSD: 180,        // total capital raised to date
        totalProfitUSD: 0,         // cumulative profit to date
        totalInvestors: 4
    },

    // The next scheduled hedge trade, and the investment window
    // around it. All three are separate moments in time:
    //   windowOpenDateTime  -> investors may commit capital from this moment
    //   windowCloseDateTime -> after this moment, no more capital is accepted
    //   tradeDateTime       -> the actual trade execution moment
    // Use ISO 8601 with an explicit UTC offset so the countdown is
    // correct for every visitor regardless of their timezone.
    nextTrade: {
        windowOpenDateTime: "2026-08-03T18:00:00+05:30",
        windowCloseDateTime: "2026-08-06T21:00:00+05:30",
        tradeDateTime: "2026-08-07T18:00:00+05:30"
    },

    // Flip this to true once a trade has settled and you have
    // computed each investor's return. This reveals the
    // "Return", "ROI %", and "Payout Given" columns on the
    // leaderboard. Flip it back to false when a new round opens.
    payoutsRevealed: false
};

/* ------------------------------------------------------------
   LEADERBOARD
   ------------------------------------------------------------
   One entry per investor. investedUSD is always required.
   returnUSD, roiPercent, and payoutGiven are only shown once
   CONFIG.payoutsRevealed is set to true above — but keep them
   filled in here so they're ready the moment you flip it.
   ------------------------------------------------------------ */
const LEADERBOARD = [
    { name: "Naman Raj", investedUSD: 60, returnUSD: 0, roiPercent: 0, payoutGiven: false },
    { name: "Naman Dhw", investedUSD: 60, returnUSD: 0, roiPercent: 0, payoutGiven: false },
    { name: "Gitesh", investedUSD: 30, returnUSD: 0, roiPercent: 0, payoutGiven: false },
    { name: "Jiya", investedUSD: 30, returnUSD: 0, roiPercent: 0, payoutGiven: false },
    { name: "Navneet", investedUSD: 30, returnUSD: 0, roiPercent: 0, payoutGiven: false },
    { name: "Shiva", investedUSD: 30, returnUSD: 0, roiPercent: 0, payoutGiven: false },
    { name: "Shreyash", investedUSD: 30, returnUSD: 0, roiPercent: 0, payoutGiven: false },
    { name: "Shivansh", investedUSD: 30, returnUSD: 0, roiPercent: 0, payoutGiven: false },
    { name: "Snehil", investedUSD: 30, returnUSD: 0, roiPercent: 0, payoutGiven: false },



];
