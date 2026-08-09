/**
 * Performance page — every trade, expandable, with a per-investor
 * breakdown. Respects CONFIG.nameRevealed and CONFIG.payoutsRevealed.
 */
(function () {
  function investorRow(inv, trade) {
    const cur = Site.getCurrency();
    const who = CONFIG.nameRevealed ? inv.name : inv.id;
    const { gross, payout } = Site.payoutForEntry(inv, trade);

    const grossCell = CONFIG.payoutsRevealed ? Site.fmtMoney(gross, cur) : `<span class="masked">••••</span>`;
    const payoutCell = CONFIG.payoutsRevealed ? Site.fmtMoney(payout, cur) : `<span class="masked">••••</span>`;

    const status = inv.payoutGiven
      ? `<span class="badge paid">Paid</span>`
      : `<span class="badge">Pending</span>`;

    return `
      <tr>
        <td class="name">${who}</td>
        <td>${Site.fmtMoney(inv.investedINR, cur)}</td>
        <td class="mute">${grossCell}</td>
        <td class="profit">${payoutCell}</td>
        <td>${status}</td>
      </tr>
    `;
  }

  function tradeCard(trade, index) {
    const cur = Site.getCurrency();
    const invested = trade.investors.reduce((s, i) => s + i.investedINR, 0);

    return `
      <details class="trade-card" ${index === 0 ? "open" : ""}>
        <summary>
          <div class="trade-head-left">
            <span class="trade-date">${Site.fmtDate(trade.date)}</span>
            <span class="trade-multi">${trade.returnsMultiplier}x</span>
          </div>
          <div style="display:flex; align-items:center; gap:14px;">
            <span class="trade-meta">${trade.investors.length} investors &middot; ${Site.fmtMoney(invested, cur)} in play</span>
            <span class="trade-caret">&#9656;</span>
          </div>
        </summary>
        <div class="trade-body">
          <table class="data">
            <thead>
              <tr>
                <th>Investor</th>
                <th>Invested</th>
                <th>Gross Return</th>
                <th>Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${trade.investors.map((inv) => investorRow(inv, trade)).join("")}
            </tbody>
          </table>
        </div>
      </details>
    `;
  }

  function renderTimeline() {
    const mount = document.getElementById("trade-timeline");
    if (!mount) return;

    const trades = [...NEWS].sort((a, b) => b.date.localeCompare(a.date));

    if (!trades.length) {
      mount.innerHTML = `<div class="empty">No trades logged yet.</div>`;
      return;
    }

    mount.innerHTML = trades.map(tradeCard).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    Site.init("performance.html");
    renderTimeline();
    document.addEventListener("currencychange", renderTimeline);
  });
})();
