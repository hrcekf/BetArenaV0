export function render({ params } = {}) {
  const html = `
    <main class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="h4 mb-0">BetArena</h2>
          <small class="text-muted">Demo kurzové sázení — přehled</small>
        </div>
        <div class="text-end">
          <div class="small text-muted">Zůstatek</div>
          <div class="h5 fw-bold" id="home-balance" x-text="$store.app.balance ?? '—'">—</div>
          <div class="mt-2">
            <a href="#/profile" class="btn btn-outline-secondary btn-sm me-2">Profil</a>
            <a href="#/ticket" class="btn btn-primary btn-sm">Nový tiket</a>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-lg-8">
          <section class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0">Rychlé odkazy</h5>
              <div>
                <a href="#/live" class="btn btn-outline-primary btn-sm me-1">LIVE</a>
                <a href="#/upcoming" class="btn btn-outline-primary btn-sm">Nadcházející</a>
              </div>
            </div>
            <div class="card p-3">
              <p class="mb-1 text-muted">Rychlý přehled nejbližších zápasů a vašich posledních tiketů.</p>
              <div id="home-matches">Načítám zápasy…</div>
            </div>
          </section>

          <section>
            <h6>Poslední tikety</h6>
            <div id="home-tickets" class="list-group">Načítám tikety…</div>
          </section>
        </div>

        <aside class="col-lg-4">
          <div class="card p-3 mb-3">
            <h6 class="mb-2">Peněženka</h6>
            <div class="mb-2 small text-muted">Aktuální zůstatek</div>
            <div class="h4 fw-bold mb-3" id="wallet-balance">— CZK</div>
            <div class="d-grid gap-2">
              <button id="deposit-btn" class="btn btn-success">Vložit prostředky</button>
              <button id="withdraw-btn" class="btn btn-outline-secondary">Vybrat</button>
            </div>
          </div>

          <div class="card p-3">
            <h6 class="mb-2">Tipy</h6>
            <ul class="small text-muted mb-0">
              <li>Kurzy se mažou každou aktualizací ze serveru.</li>
              <li>Rozpracované tikety se ukládají do localStorage.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  `;

  const mount = document.getElementById("app");
  if (!mount) throw new Error("Mount point #app not found");
  mount.innerHTML = html;

  try {
    if (window.Alpine && typeof Alpine.initTree === "function") {
      Alpine.initTree(mount);
    } else if (window.Alpine && typeof Alpine.scan === "function") {
      Alpine.scan(mount);
    }
  } catch (err) {
    console.debug("Alpine re-init failed", err);
  }

  return html;
}

async function init({ params } = {}) {
  try {
    const matchesSvc = await import("../services/matches.js");
    const ticketsSvc = await import("../services/tickets.js");
    const walletSvc = await import("../services/wallet.js");

    let matchesHtml = "";
    try {
      const matches = await matchesSvc.default.getUpcoming({ limit: 5 });
      if (!matches || matches.length === 0) {
        matchesHtml = "<div class=\"text-muted\">Žádné dostupné zápasy.</div>";
      } else {
        matchesHtml = "<div class=\"list-group\">";
        for (const m of matches) {
          matchesHtml += `
            <a href="#/match/${m.id}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <div>
                <div class="fw-bold">${escapeHtml(m.home)} — ${escapeHtml(m.away)}</div>
                <small class="text-muted">${new Date(m.start_time).toLocaleString()}</small>
              </div>
              <div class="text-end">
                <small class="text-muted">${m.status ?? ""}</small>
                <div class="mt-1"><span class="badge bg-light text-dark">${(m.odds && m.odds["1"]) ? m.odds["1"].toFixed(2) : "—"}</span></div>
              </div>
            </a>
          `;
        }
        matchesHtml += "</div>";
      }
    } catch (err) {
      console.error("matches load error", err);
      matchesHtml = "<div class=\"text-danger\">Chyba při načítání zápasů.</div>";
    }
    document.getElementById("home-matches").innerHTML = matchesHtml;

    let ticketsHtml = "";
    try {
      const recent = await ticketsSvc.default.getMyRecent({ limit: 5 });
      if (!recent || recent.length === 0) {
        ticketsHtml = "<div class=\"text-muted p-2\">Žádné tikety</div>";
      } else {
        for (const t of recent) {
          ticketsHtml += `
            <a href="#/tickets/${t.id}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <div>
                <div class="fw-semibold">#${t.id} — ${escapeHtml(t.status)}</div>
                <small class="text-muted">${new Date(t.created_at).toLocaleString()}</small>
              </div>
              <div class="text-end">
                <div><strong>${(t.payout ?? 0).toFixed(2)} CZK</strong></div>
                <small class="text-muted">vklad ${t.stake}</small>
              </div>
            </a>
          `;
        }
      }
    } catch (err) {
      console.error("tickets load error", err);
      ticketsHtml = "<div class=\"text-danger\">Chyba při načítání tiketů.</div>";
    }
    document.getElementById("home-tickets").innerHTML = ticketsHtml;

    try {
      const w = await walletSvc.default.getMyWallet();
      const balance = (w && typeof w.balance !== "undefined") ? w.balance : null;
      const balEl = document.getElementById("wallet-balance");
      const homeBalEl = document.getElementById("home-balance");
      if (balEl) balEl.textContent = (balance !== null) ? `${balance.toFixed(2)} CZK` : "—";
      if (homeBalEl) homeBalEl.textContent = (balance !== null) ? `${balance.toFixed(2)}` : "—";
      if (window.Alpine && Alpine.store && Alpine.store("app")) {
        Alpine.store("app").setUser?.(Alpine.store("app").user, balance);
        Alpine.store("app").balance = balance;
      }
    } catch (err) {
      console.debug("wallet load error", err);
    }

    const depositBtn = document.getElementById("deposit-btn");
    if (depositBtn) {
      depositBtn.addEventListener("click", async () => {
        const amount = parseFloat(prompt("Zadej částku k vložení (demo):", "100"));
        if (!isNaN(amount) && amount > 0) {
          try {
            await (await import("../services/wallet.js")).default.deposit({ amount });
            const w2 = await (await import("../services/wallet.js")).default.getMyWallet();
            const b = w2.balance ?? Alpine.store("app").balance;
            document.getElementById("wallet-balance").textContent = `${b.toFixed(2)} CZK`;
            if (document.getElementById("home-balance")) document.getElementById("home-balance").textContent = `${b.toFixed(2)}`;
            if (Alpine.store("app")) Alpine.store("app").balance = b;
            alert("Vklad proveden (demo).");
          } catch (e) {
            console.error(e);
            alert("Chyba při vkladu");
          }
        }
      });
    }

  } catch (err) {
    console.error("Home.init error", err);
  }
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default {
  render,
  init
};