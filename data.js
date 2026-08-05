const CONFIG = {
    // 1 USD = this many INR. Update this constant whenever you
    // want to refresh the peg used for the currency toggle.
    usdToInr: 104,

    fund: {
        name: "Doc Trades Hedge Fund",
        inceptionDate: "2026-08-01",   // YYYY-MM-DD
        returnsMultiplyer: 0, //0x,1x,2x,3x,4x
        profitSplitMultiplier: 0.8, // 80% of profit is distributed to investors, 20% is retained by the fund
    },

    nextTrade: {
        windowOpenDateTime: "2026-08-03T18:00:00+05:30",
        windowCloseDateTime: "2026-08-05T21:00:00+05:30",
        tradeDateTime: "2026-08-07T18:00:00+05:30"
    },

    nameRevealed: true,
    // Placeholder — actual value is derived right below, once
    // CONFIG.fund exists and can be safely referenced.
    payoutsRevealed: false
};

// Auto-reveal the Return / ROI / Payout columns once a real
// multiplier has been entered above.
CONFIG.payoutsRevealed = CONFIG.fund.returnsMultiplyer > 0;

/* ------------------------------------------------------------
   LEADERBOARD
   ------------------------------------------------------------ */
const LEADERBOARD = [
    { id: "INV-NT", name: "Navneet", investedUSD: 24, payoutGiven: false },
    { id: "INV-YR", name: "Yash", investedUSD: 30.769, payoutGiven: false },
    { id: "INV-SP", name: "Snehil", investedUSD: 30.769, payoutGiven: false },
    { id: "INV-SG", name: "Shiva", investedUSD: 30.769, payoutGiven: false },
     { id: "INV-GK", name: "Gitesh", investedUSD: 30.769, payoutGiven: false },
    { id: "INV-SM", name: "Shreyash", investedUSD: 25.9, payoutGiven: false },
     { id: "INV-NS", name: "Naman Raj", investedUSD: 59.61, payoutGiven: false },
     { id: "INV-ND", name: "Naman Dhw", investedUSD: 59.61, payoutGiven: false },
];
