const routes = [
  { path: /^\/?$/, module: "./pages/home.js" },
  { path: /^\/live$/, module: "./pages/live.js" },
  { path: /^\/upcoming$/, module: "./pages/upcoming.js" },
  { path: /^\/match\/(\d+)$/, module: "./pages/matchDetail.js" },
  { path: /^\/ticket$/, module: "./pages/ticket.js" },
  { path: /^\/profile$/, module: "./pages/profile.js" },
  { path: /^\/transactions$/, module: "./pages/transactions.js" },
  { path: /^\/login$/, module: "./pages/login.js" }
];

async function navigate(hash) {
  const raw = (hash ?? location.hash.replace("#","")) || "/";
  for (const r of routes) {
    const m = raw.match(r.path);
    if (m) {
      try {
        const mod = await import(r.module);
        const params = m.slice(1);
        if (mod.default && typeof mod.default.render === "function") {
          await mod.default.render({ params });
        }
        if (mod.default && typeof mod.default.init === "function") {
          await mod.default.init({ params });
        }
      } catch (err) {
        console.error("Route load error", err);
        document.getElementById("app").innerHTML = `<div class="container py-4"><div class="alert alert-danger">Chyba pĹ™i naÄŤĂ­tĂˇnĂ­ strĂˇnky.</div></div>`;
      }
      return;
    }
  }
  location.hash = "/";
}

function start() {
  window.addEventListener("hashchange", () => navigate(location.hash.replace("#","")));
  navigate(location.hash.replace("#",""));
}

export default { start, navigate };
