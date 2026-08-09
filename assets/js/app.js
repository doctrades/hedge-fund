/**
 * ============================================================
 *  DOC TRADES — SHARED APP LOGIC
 * ============================================================
 *  Loaded on every page, after config.js.
 *  Provides: currency toggle, formatting helpers, the header/
 *  footer/subnav templates, data aggregation over NEWS, and
 *  the reusable Return Calculator component.
 *
 *  To add a new static page:
 *    1. Copy template.html, rename it, add it to NAV_LINKS below.
 *    2. Give <body data-page="yourpage">.
 *    3. Include a <div id="site-header"></div> and
 *       <div id="site-footer"></div> where you want them.
 *    4. Drop a <div data-component="calculator"></div> anywhere
 *       you want the calculator to appear.
 *    5. Write assets/js/pages/yourpage.js for anything page-
 *       specific, and include it after app.js.
 * ============================================================
 */

const Site = (() => {
  const CURRENCY_KEY = "doctrades:currency";

  const NAV_LINKS = [
    { href: "index.html", label: "Home" },
    { href: "performance.html", label: "Performance" },
    { href: "investors.html", label: "Investors" },
  ];

  /* ---------------- currency ---------------- */

  function getCurrency() {
    return localStorage.getItem(CURRENCY_KEY) || "USD";
  }

  function setCurrency(cur) {
    localStorage.setItem(CURRENCY_KEY, cur);
    document.dispatchEvent(new CustomEvent("currencychange", { detail: cur }));
  }

  function toDisplay(amountINR, currency = getCurrency()) {
    return currency === "USD" ? amountINR / CONFIG.usdToInr : amountINR;
  }

  function fmtMoney(amountINR, currency = getCurrency()) {
    const value = toDisplay(amountINR, currency);
    const symbol = currency === "USD" ? "$" : "\u20B9";
    const rounded = Math.round(value);
    const locale = currency === "USD" ? "en-US" : "en-IN";
    return symbol + rounded.toLocaleString(locale);
  }

  function fmtSigned(amountINR, currency = getCurrency()) {
    const sign = amountINR < 0 ? "-" : "";
    return sign + fmtMoney(Math.abs(amountINR), currency);
  }

  /* ---------------- date helpers ---------------- */

  function daysRunning() {
    const start = new Date(CONFIG.fund.inceptionDate + "T00:00:00");
    const now = new Date();
    const ms = now.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor(ms / 86400000));
  }

  function fmtDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  /* ---------------- data aggregation ---------------- */

  // Unique investors across every trade, most recent entry wins
  // for their standing invested amount.
  function uniqueInvestors() {
    const byId = new Map();
    [...NEWS].sort((a, b) => a.date.localeCompare(b.date)).forEach((trade) => {
      trade.investors.forEach((inv) => byId.set(inv.id, inv));
    });
    return [...byId.values()];
  }

  function latestTrade() {
    return [...NEWS].sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  }

  function payoutForEntry(inv, trade) {
    const gross = inv.investedINR * trade.returnsMultiplier;
    const split = gross * (1 - CONFIG.fund.profitSplitMultiplier);
    return { gross, split, payout: gross - split };
  }

  function fundStats() {
    const investors = uniqueInvestors();
    const totalInvestedINR = investors.reduce((s, i) => s + i.investedINR, 0);

    // Overall % reflects realized (paid-out) returns only — unrealized
    // gains don't move the headline number until a payout is marked given.
    let realizedProfit = 0;
    let realizedBase = 0;
    NEWS.forEach((trade) => {
      trade.investors.forEach((inv) => {
        if (inv.payoutGiven) {
          const { payout } = payoutForEntry(inv, trade);
          realizedProfit += payout - inv.investedINR;
          realizedBase += inv.investedINR;
        }
      });
    });

    const overallPercent = totalsAcrossTrades().overallPercent;
    const fundValueINR = totalInvestedINR + realizedProfit;

    return {
      investorCount: investors.length,
      totalInvestedINR,
      fundValueINR,
      overallPercent,
    };
  }

  /* ---------------- header / footer / nav ---------------- */

  function renderHeader(activePage) {
    const mount = document.getElementById("site-header");
    if (!mount) return;

    const tabs = NAV_LINKS.map(
      (l) =>
        `<a href="${l.href}" class="${l.href === activePage ? "active" : ""}">${l.label}</a>`
    ).join("");

    mount.innerHTML = `
      <header class="site">
        <div class="wrap header-row">
          <a href="index.html" class="brand">
            <span class="name">${CONFIG.fund.name}</span>
            <span class="kind">${CONFIG.fund.tagline}</span>
          </a>
          <div class="toggle" id="currency-toggle">
            <button type="button" data-cur="USD">USD</button>
            <button type="button" data-cur="INR">INR</button>
          </div>
        </div>
      </header>
      <nav class="subnav">
        <div class="wrap">${tabs}</div>
      </nav>
    `;

    initCurrencyToggle();
  }

  function renderFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;

    mount.innerHTML = `
      <footer class="site">
        <div class="wrap">
          <div class="footer-row">
            <span>&copy; ${new Date().getFullYear()} ${CONFIG.fund.name} ${CONFIG.fund.tagline}</span>
            <div class="footer-links">
              ${NAV_LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
            </div>
          </div>
          <p class="disclaimer">
            Figures on this page track a private, informal fund among friends and
            family and are provided for transparency between participants only.
            Nothing here is a public offer, financial advice, or a solicitation
            to invest. Past trade performance does not guarantee future results.
          </p>
        </div>
      </footer>
    `;
  }

  function initCurrencyToggle() {
    const root = document.getElementById("currency-toggle");
    if (!root) return;

    function paint() {
      const cur = getCurrency();
      root.querySelectorAll("button").forEach((b) => {
        b.classList.toggle("active", b.dataset.cur === cur);
      });
    }

    root.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => setCurrency(b.dataset.cur));
    });

    document.addEventListener("currencychange", paint);
    paint();
  }

  /* ---------------- ticker (hero signature element) ---------------- */

  function renderTicker(mountId) {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    const items = [...NEWS].sort((a, b) => a.date.localeCompare(b.date));
    if (!items.length) return;

    const strip = items
      .map((t) => `<span class="up">${t.label} &nbsp;+${t.returnsMultiplier}x</span>`)
      .join("<span>&middot;</span>");

    // duplicate the strip so the marquee loop is seamless
    mount.innerHTML = `<div class="ticker-track">${strip}${strip}</div>`;
  }

  /* ---------------- calculator component ---------------- */

  function initCalculators() {
    document.querySelectorAll('[data-component="calculator"]').forEach(mountCalculator);
  }

  function mountCalculator(root) {
    const trade = latestTrade();
    const { minINR, maxINR, stepINR, defaultINR } = CONFIG.calculator;
    const splitPercent = Math.round((1 - CONFIG.fund.profitSplitMultiplier) * 100);

    root.innerHTML = `
      <div class="calc">
        <div class="calc-head">
          <span class="eyebrow"><span class="dot"></span>Try it</span>
          <h2>Expected Return Calculator</h2>
          <p>Calculate your expected return on investment, based on the most recent trade.</p>
          ${trade ? `<p class="calc-basis">Modelled on the ${trade.label} (${fmtDate(trade.date)}) &mdash; ${trade.returnsMultiplier}x gross</p>` : ""}
        </div>

        <div class="calc-amount">
          <span class="sign" id="calc-symbol">$</span><span class="num" id="calc-amount">0</span>
        </div>

        <input type="range" id="calc-slider" min="${minINR}" max="${maxINR}" step="${stepINR}" value="${defaultINR}" />
        <div class="range-labels">
          <span id="calc-min"></span>
          <span id="calc-max"></span>
        </div>

        <div class="calc-rows">
          <div class="calc-row">
            <span class="rlabel">Gross Return <span class="tag" id="calc-multi-tag">${trade ? trade.returnsMultiplier : 1}x</span></span>
            <span class="rvalue" id="calc-gross">$0</span>
          </div>
          <div class="calc-row">
            <span class="rlabel">Profit Split (${splitPercent}%)</span>
            <span class="rvalue" id="calc-split">-$0</span>
          </div>
          <div class="calc-row total">
            <span class="rlabel">Your Payout <span class="tag" id="calc-x-tag">1.00x</span></span>
            <span class="rvalue" id="calc-payout">$0</span>
          </div>
        </div>
      </div>
    `;

    const slider = root.querySelector("#calc-slider");
    const els = {
      symbol: root.querySelector("#calc-symbol"),
      amount: root.querySelector("#calc-amount"),
      min: root.querySelector("#calc-min"),
      max: root.querySelector("#calc-max"),
      gross: root.querySelector("#calc-gross"),
      split: root.querySelector("#calc-split"),
      payout: root.querySelector("#calc-payout"),
      xTag: root.querySelector("#calc-x-tag"),
    };

    const multiplier = trade ? trade.returnsMultiplier : 1;

    function paint() {
      const cur = getCurrency();
      const investedINR = Number(slider.value);
      const { gross, split, payout } = trade
        ? payoutForEntry({ investedINR }, trade)
        : { gross: investedINR, split: 0, payout: investedINR };

      els.symbol.textContent = cur === "USD" ? "$" : "\u20B9";
      els.amount.textContent = Math.round(toDisplay(investedINR, cur)).toLocaleString(cur === "USD" ? "en-US" : "en-IN");
      els.min.textContent = fmtMoney(minINR, cur);
      els.max.textContent = fmtMoney(maxINR, cur);
      els.gross.textContent = fmtMoney(gross, cur);
      els.split.textContent = "-" + fmtMoney(split, cur);
      els.payout.textContent = fmtMoney(payout, cur);
      els.xTag.textContent = (payout / investedINR || multiplier * CONFIG.fund.profitSplitMultiplier).toFixed(2) + "x";

      const pct = ((investedINR - minINR) / (maxINR - minINR)) * 100;
      slider.style.setProperty("--fill", pct + "%");
    }

    slider.addEventListener("input", paint);
    document.addEventListener("currencychange", paint);
    paint();
  }

/**
 * Fund-wide totals across ALL trades (not deduped per investor —
 * every trade entry counts, since capital can be reused across trades).
 *
 * totalInvestedINR        — sum of investedINR across every trade entry
 * totalReturnsGrossINR    — sum of (investedINR * returnsMultiplier),
 *                            BEFORE the profit split is applied
 * totalReturnsSplitINR    — sum of (investedINR * returnsMultiplier * profitSplitMultiplier),
 *                            AFTER the profit split is applied (what investors actually get)
 */
function totalsAcrossTrades() {
  let totalInvestedINR = 0;
  let totalReturnsGrossINR = 0;
  let totalReturnsSplitINR = 0;

  NEWS.forEach((trade) => {
    trade.investors.forEach((inv) => {
      totalInvestedINR += inv.investedINR;
      totalReturnsGrossINR += inv.investedINR * trade.returnsMultiplier;
      totalReturnsSplitINR +=
        inv.investedINR * trade.returnsMultiplier * CONFIG.fund.profitSplitMultiplier;
    });
  });
  overallPercent = totalInvestedINR > 0 ? (totalReturnsGrossINR / totalInvestedINR ) * 100 : 0;

  return { totalInvestedINR, totalReturnsGrossINR, totalReturnsSplitINR, overallPercent };
}

  /* ---------------- init ---------------- */

  function init(activePage) {
    renderHeader(activePage);
    renderFooter();
    initCalculators();
  }

  return {
    init,
    getCurrency,
    setCurrency,
    toDisplay,
    fmtMoney,
    fmtSigned,
    daysRunning,
    fmtDate,
    uniqueInvestors,
    latestTrade,
    payoutForEntry,
    fundStats,
    totalsAcrossTrades,
    renderTicker,
    NAV_LINKS,
  };
})();
