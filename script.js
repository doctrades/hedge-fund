// script.js
/* ============================================================
   DOC TRADES HEDGE FUND — RENDER LOGIC
   Reads CONFIG and LEADERBOARD from data.js and paints the page.
   ============================================================ */

(function () {
  "use strict";

  let currentCurrency = "USD"; // "USD" | "INR"

  /* ---------------- helpers ---------------- */

  function toDisplayCurrency(usdAmount) {
    return currentCurrency === "USD" ? usdAmount : usdAmount * CONFIG.usdToInr;
  }

  function formatMoney(usdAmount, opts) {
    opts = opts || {};
    const value = toDisplayCurrency(usdAmount);
    const symbol = currentCurrency === "USD" ? "$" : "₹";
    const rounded = opts.decimals
      ? value.toFixed(opts.decimals)
      : Math.round(value).toLocaleString(currentCurrency === "USD" ? "en-US" : "en-IN");
    return symbol + rounded;
  }

  function formatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  /* ---------------- stats ---------------- */

  function renderStats() {
    const f = CONFIG.fund;
    const totalInvestedUSD = LEADERBOARD.reduce((sum, investor) => sum + investor.investedUSD, 0);
    const totalInvestors = LEADERBOARD.length;

    // Keep the raw number for math
    const hedgeFundBalanceRaw = (totalInvestedUSD * f.returnsMultiplyer);
    // Format only for display
    const hedgeFundBalanceUSD = formatMoney(hedgeFundBalanceRaw);

    document.getElementById("statRaised").textContent = formatMoney(totalInvestedUSD);
    document.getElementById("statInvestors").textContent = totalInvestors + " investors";
    document.getElementById("statProfit").textContent = hedgeFundBalanceUSD;

    const profitPct = totalInvestedUSD > 0 && f.returnsMultiplyer > 1
      ? ((hedgeFundBalanceRaw - totalInvestedUSD) / totalInvestedUSD) * 100
      : 0;

    document.getElementById("statProfitPct").textContent =
      (profitPct >= 0 ? "+" : "") + profitPct.toFixed(1) + "% overall";

    const inceptionDate = new Date(f.inceptionDate);
    document.getElementById("statInception").textContent =
      inceptionDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

    const days = Math.max(0, Math.floor((Date.now() - inceptionDate.getTime()) / 86400000));
    document.getElementById("statAge").textContent = "running for " + days + " days";
  }

  /* ---------------- trade window + countdown ---------------- */

  function formatDateTimeShort(iso) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function renderWindowDates() {
    const t = CONFIG.nextTrade;
    document.getElementById("dateOpen").textContent = formatDateTimeShort(t.windowOpenDateTime);
    document.getElementById("dateClose").textContent = formatDateTimeShort(t.windowCloseDateTime);
    document.getElementById("dateTrade").textContent = formatDateTimeShort(t.tradeDateTime);
  }

  function pct(now, start, end) {
    if (end <= start) return 100;
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  }

  function renderTimelineProgress() {
    const now = Date.now();
    const open = new Date(CONFIG.nextTrade.windowOpenDateTime).getTime();
    const close = new Date(CONFIG.nextTrade.windowCloseDateTime).getTime();
    const trade = new Date(CONFIG.nextTrade.tradeDateTime).getTime();

    const stepOpen = document.getElementById("stepOpen");
    const stepClose = document.getElementById("stepClose");
    const stepTrade = document.getElementById("stepTrade");
    const lineOneFill = document.querySelector("#lineOne .tl-line-fill");
    const lineTwoFill = document.querySelector("#lineTwo .tl-line-fill");
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const fillProp = isMobile ? "height" : "width";

    [stepOpen, stepClose, stepTrade].forEach((s) => s.classList.remove("is-done", "is-active"));

    if (now < open) {
      stepOpen.classList.add("is-active");
      lineOneFill.style[fillProp] = "0%";
      lineTwoFill.style[fillProp] = "0%";
    } else if (now < close) {
      stepOpen.classList.add("is-done");
      stepClose.classList.add("is-active");
      lineOneFill.style[fillProp] = pct(now, open, close) + "%";
      lineTwoFill.style[fillProp] = "0%";
    } else if (now < trade) {
      stepOpen.classList.add("is-done");
      stepClose.classList.add("is-done");
      stepTrade.classList.add("is-active");
      lineOneFill.style[fillProp] = "100%";
      lineTwoFill.style[fillProp] = pct(now, close, trade) + "%";
    } else {
      stepOpen.classList.add("is-done");
      stepClose.classList.add("is-done");
      stepTrade.classList.add("is-done");
      lineOneFill.style[fillProp] = "100%";
      lineTwoFill.style[fillProp] = "100%";
    }
  }

  function getWindowPhase() {
    const now = Date.now();
    const open = new Date(CONFIG.nextTrade.windowOpenDateTime).getTime();
    const close = new Date(CONFIG.nextTrade.windowCloseDateTime).getTime();
    const trade = new Date(CONFIG.nextTrade.tradeDateTime).getTime();

    if (now < open) return { phase: "before-open", target: open };
    if (now < close) return { phase: "open", target: close };
    if (now < trade) return { phase: "closed-awaiting-trade", target: trade };
    return { phase: "trade-done", target: trade };
  }

  function tickCountdown() {
    const stampEl = document.getElementById("windowStamp");
    const stampWord = document.getElementById("stampWord");
    const statusText = document.getElementById("windowStatusText");
    const { phase, target } = getWindowPhase();

    let remaining = Math.max(0, target - Date.now());
    const days = Math.floor(remaining / 86400000);
    remaining -= days * 86400000;
    const hours = Math.floor(remaining / 3600000);
    remaining -= hours * 3600000;
    const mins = Math.floor(remaining / 60000);
    remaining -= mins * 60000;
    const secs = Math.floor(remaining / 1000);

    document.getElementById("cdDays").textContent = pad(days);
    document.getElementById("cdHours").textContent = pad(hours);
    document.getElementById("cdMins").textContent = pad(mins);
    document.getElementById("cdSecs").textContent = pad(secs);
    renderTimelineProgress();

    if (phase === "before-open") {
      stampEl.classList.remove("is-open");
      stampWord.textContent = "PLEASE WAIT";
      statusText.innerHTML = "The investment window is <strong>not yet open</strong>. It opens in the time shown below.";
    } else if (phase === "open") {
      stampEl.classList.add("is-open");
      stampWord.textContent = "OPEN";
      statusText.innerHTML = "The investment window is <strong>open now</strong>. It closes in the time shown below.";
    } else if (phase === "closed-awaiting-trade") {
      stampEl.classList.remove("is-open");
      stampWord.textContent = "CLOSED";
      statusText.innerHTML = "The investment window is <strong>closed</strong>. The next trade executes in the time shown below.";
    } else {
      stampEl.classList.remove("is-open");
      stampWord.textContent = "SETTLED";
      statusText.innerHTML = "The scheduled trade has <strong>executed</strong>. Check the ledger below for updated results.";
    }
  }

  /* ---------------- ledger ---------------- */

  function renderLedgerColumns() {
    const hiddenCols = document.querySelectorAll(".col-hidden");

    hiddenCols.forEach((col) => {
      if (CONFIG.payoutsRevealed) {
        col.classList.remove("col-hidden");
      }
    });
    document.getElementById("ledgerSub").innerHTML = CONFIG.payoutsRevealed
      ? "Latest trade has settled — returns and payout status below.<br>Investor's name is hidden for privacy."
      : "Payout figures publish once the current trade has settled.";
  }

  function renderInvestorRows() {
    const body = document.getElementById("ledgerBody");
    const sorted = [...LEADERBOARD].sort((a, b) => b.investedUSD - a.investedUSD);
    body.innerHTML = "";

    sorted.forEach((investor, i) => {
      const tr = document.createElement("tr");

      const returnsUSD = formatMoney((investor.investedUSD * CONFIG.fund.returnsMultiplyer) * CONFIG.fund.profitSplitMultiplier);
      const roiPercent = (((investor.investedUSD * CONFIG.fund.returnsMultiplyer) * CONFIG.fund.profitSplitMultiplier) / investor.investedUSD * 100) - 100;
      const roiClass = roiPercent >= 0 ? "roi-positive" : "roi-negative";
      const roiSign = roiPercent >= 0 ? "+" : "";
      const payoutClass = investor.payoutGiven ? "given" : "pending";
      const payoutLabel = investor.payoutGiven ? "Paid" : "Pending";

      tr.innerHTML = `
        <td class="col-rank">${i + 1}</td>
        <td class="col-name" data-label="Investor"><span class="investor-name">${CONFIG.nameRevealed ? investor.name : investor.id}</span></td>
        <td class="col-num calc-result-value--muted" data-label="Invested">${formatMoney(investor.investedUSD)}</td>
        <td class="col-num col-hidden" data-col="return" data-label="Payout">${returnsUSD}</td>
        <td class="col-num  col-hidden ${roiClass}" data-col="roi" data-label="ROI %">${roiSign}${roiPercent.toFixed(1)} %</td>
        <td class="col-status col-hidden" data-col="payout" data-label="Payout Status">
          <span class="payout-pill ${payoutClass}">${payoutLabel}</span>
        </td>
      `;
      body.appendChild(tr);
    });

    renderLedgerColumns();
  }

  /* ---------------- currency toggle ---------------- */

  function setCurrency(cur) {
    currentCurrency = cur;
    const toggle = document.getElementById("currencyToggle");
    const btnUSD = document.getElementById("btnUSD");
    const btnINR = document.getElementById("btnINR");

    toggle.classList.toggle("is-inr", cur === "INR");
    btnUSD.classList.toggle("is-active", cur === "USD");
    btnINR.classList.toggle("is-active", cur === "INR");

    renderStats();
    renderInvestorRows();
  }

  function initCurrencyToggle() {
    document.getElementById("btnUSD").addEventListener("click", () => setCurrency("USD"));
    document.getElementById("btnINR").addEventListener("click", () => setCurrency("INR"));
  }

  function LB() {
    if (CONFIG.payoutsRevealed) {
      document.getElementById("InvestorLeaderboard").style.display = "block";
      document.getElementById("TradeWindow").style.display = "none";
      document.getElementById("ReturnCalculator").style.display = "block";
    }
    else {
      document.getElementById("InvestorLeaderboard").style.display = "none";
      document.getElementById("ReturnCalculator").style.display = "none";
    }

  }

  /* ---------------- init ---------------- */

  function init() {
    document.title = CONFIG.fund.name + " — Fund Dashboard";
    renderStats();
    renderWindowDates();
    tickCountdown();
    renderInvestorRows();
    initCurrencyToggle();
    LB();
    setInterval(tickCountdown, 1000);
    window.addEventListener("resize", renderTimelineProgress);
  }

  document.addEventListener("DOMContentLoaded", init);
})();