/**
 * Investors page — one row per unique investor with total
 * invested and lifetime realized payout (if revealed).
 */
(function () {
  function aggregateByInvestor() {
    const map = new Map();

    NEWS.forEach((trade) => {
      trade.investors.forEach((inv) => {
        const { payout } = Site.payoutForEntry(inv, trade);
        const prev = map.get(inv.id) || {
          id: inv.id,
          name: inv.name,
          investedINR: 0,
          realizedINR: 0,
          trades: 0,
          anyPending: false,
        };
        prev.investedINR += inv.investedINR; // sum standing capital across every trade
        prev.trades += 1;
        if (inv.payoutGiven) prev.realizedINR += payout; // gross payout, not net profit
        else prev.anyPending = true;
        map.set(inv.id, prev);
      });
    });

    return [...map.values()].sort((a, b) => b.investedINR - a.investedINR);
  }

  function renderTable() {
    const mount = document.getElementById("investor-table");
    if (!mount) return;

    const rows = aggregateByInvestor();
    const cur = Site.getCurrency();

    if (!rows.length) {
      mount.innerHTML = `<div class="empty">No investors on file yet.</div>`;
      return;
    }

    mount.innerHTML = `
      <table class="data">
        <thead>
          <tr>
            <th>Investor</th>
            <th>Invested</th>
            <th>Trades</th>
            <th>Realized P/L</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((r) => {
              const who = CONFIG.nameRevealed ? r.name : r.id;
              const pl = CONFIG.payoutsRevealed
                ? Site.fmtSigned(r.realizedINR, cur)
                : `<span class="masked">••••</span>`;
              const status = r.anyPending
                ? `<span class="badge">Pending</span>`
                : `<span class="badge paid">Settled</span>`;
              return `
                <tr>
                  <td class="name">${who}</td>
                  <td>${Site.fmtMoney(r.investedINR, cur)}</td>
                  <td>${r.trades}</td>
                  <td>${pl}</td>
                  <td>${status}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  }

  function renderSummary() {
    const mount = document.getElementById("investor-summary");
    if (!mount) return;
    const stats = Site.fundStats();
    const cur = Site.getCurrency();

    mount.innerHTML = `
      <div class="stat-card">
        <div class="label">Total Investors</div>
        <div class="value">${stats.investorCount}</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Payouts</div>
        <div class="value accent">${Site.fmtMoney(Site.totalsAcrossTrades().totalReturnsSplitINR, cur)}</div>
      </div>
    `;
  }

  function renderAll() {
    renderSummary();
    renderTable();
  }

  document.addEventListener("DOMContentLoaded", () => {
    Site.init("investors.html");
    renderAll();
    document.addEventListener("currencychange", renderAll);
  });
})();