// calculator.js
/* ============================================================
   EXPECTED RETURN CALCULATOR
   Reads live from CONFIG (data.js) — no numbers hardcoded here.
   ============================================================ */

(function () {
  const slider        = document.getElementById("calcSlider");
  const amountNum      = document.getElementById("calcAmountNum");
  const curSym         = document.getElementById("calcCurSym");
  const minLabel        = document.getElementById("calcMinLabel");
  const maxLabel        = document.getElementById("calcMaxLabel");
  const investedOut     = document.getElementById("calcInvested");
  const profitOut       = document.getElementById("calcProfit");
  const fundShareOut     = document.getElementById("calcFundShare");
  const totalOut        = document.getElementById("calcTotal");
  const multiplierLabel = document.getElementById("calcMultiplierLabel");
  const returnMultiplierLabel = document.getElementById("calcReturnMultiplierLabel");
  if (!slider) return;

  let currency = "USD";

  function symbol() {
    return currency === "USD" ? "$" : "₹";
  }

  function toDisplay(usdAmount) {
    const amt = currency === "USD" ? usdAmount : usdAmount * CONFIG.usdToInr;
    return amt.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  function render() {
    const investedUSD = Number(slider.value);
    const mult = CONFIG.fund.returnsMultiplyer;
    const split = CONFIG.fund.profitSplitMultiplier;

    const profitUSD    = investedUSD * mult;
    const investorShareUSD = profitUSD ;
    const fundShareUSD  = profitUSD * (1 - split);
    const totalUSD      =  investorShareUSD - fundShareUSD; //investedUSD +

    curSym.textContent = symbol();
    amountNum.textContent = toDisplay(investedUSD);

    investedOut.textContent  = symbol() + toDisplay(investedUSD);
    profitOut.textContent    = symbol() + toDisplay(investorShareUSD);
    fundShareOut.textContent = "−" + symbol() + toDisplay(fundShareUSD);
    totalOut.textContent     = symbol() + toDisplay(totalUSD );
    multiplierLabel.textContent = `${mult}x`;
    returnMultiplierLabel.textContent = `${(mult*split).toFixed(2)}x`;
    const pct = ((investedUSD - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty("--fill", pct + "%");
  }

  slider.addEventListener("input", render);

  // Stay in sync with the existing USD/INR toggle in the header.
  const btnUSD = document.getElementById("btnUSD");
  const btnINR = document.getElementById("btnINR");
  if (btnUSD) btnUSD.addEventListener("click", () => { currency = "USD"; render(); });
  if (btnINR) btnINR.addEventListener("click", () => { currency = "INR"; render(); });

  minLabel.textContent = "$" + slider.min;
  maxLabel.textContent = "$" + slider.max;

  render();
})();