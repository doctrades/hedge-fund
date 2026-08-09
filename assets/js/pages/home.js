/**
 * Home page — stat cards + recent trades preview.
 * Re-renders whenever the currency toggle fires.
 */
(function () {
  function renderStats() {
    const mount = document.getElementById("stats");
    if (!mount) return;

    const stats = Site.fundStats();
    const cur = Site.getCurrency();

    mount.innerHTML = `
      <div class="stat-card">
        <div class="label">Funds Raised</div>
        <div class="value">${Site.fmtMoney(Site.totalsAcrossTrades().totalInvestedINR, cur)}</div>
        <div class="foot">${stats.investorCount} investor${stats.investorCount === 1 ? "" : "s"}</div>
      </div>
      <div class="stat-card">
        <div class="label">Hedge Fund</div>
        <div class="value accent">${Site.fmtMoney(Site.totalsAcrossTrades().totalReturnsGrossINR, cur)}</div>
        <div class="foot ${stats.overallPercent > 0 ? "pos" : ""}">${stats.overallPercent >= 0 ? "+" : ""}${stats.overallPercent.toFixed(1)}% overall</div>
      </div>
      <div class="stat-card">
        <div class="label">Fund Inception</div>
        <div class="value" style="font-size:24px;">${Site.fmtDate(CONFIG.fund.inceptionDate)}</div>
        <div class="foot">running for ${Site.daysRunning()} day${Site.daysRunning() === 1 ? "" : "s"}</div>
      </div>
    `;
  }

  function renderRecentTrades() {
    const mount = document.getElementById("recent-trades");
    if (!mount) return;

    const trades = [...NEWS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    const cur = Site.getCurrency();

    if (!trades.length) {
      mount.innerHTML = `<div class="empty">No trades logged yet.</div>`;
      return;
    }

    mount.innerHTML = trades
      .map((t) => {
        const invested = t.investors.reduce((s, i) => s + i.investedINR, 0);
        return `
          <div class="trade-card">
            <div class="trade-head-left" style="justify-content:space-between; width:100%; display:flex;">
              <div class="trade-head-left">
                <span class="trade-date">${Site.fmtDate(t.date)}</span>
                <span class="trade-multi">${t.returnsMultiplier}x</span>
              </div>
              <span class="trade-meta">${t.investors.length} investor${t.investors.length === 1 ? "" : "s"} &middot; ${Site.fmtMoney(invested, cur)} invested</span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderAll() {
    renderStats();
    renderRecentTrades();
  }

  document.addEventListener("DOMContentLoaded", () => {
    Site.init("index.html");
    Site.renderTicker("hero-ticker");
    renderAll();
    document.addEventListener("currencychange", renderAll);
  });
})();
