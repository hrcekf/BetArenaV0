import router from "./router.js";
import api from "./services/api.js";

document.addEventListener("alpine:init", () => {
  Alpine.store("app", {
    user: null,
    balance: 0,
    selections: [],
    stake: 100,
    totalOdds: 1,

    async loadProfile() {
      try {
        const res = await api.get("/me");
        this.user = res.user ?? null;
        this.balance = res.balance ?? this.balance;
      } catch (e) {
        this.user = null;
      }
    },

    setUser(user, balance) {
      this.user = user;
      if (typeof balance !== "undefined") this.balance = balance;
    },

    logout() {
      api.clearToken();
      this.user = null;
      location.hash = "/login";
    },

    addSelection(s) {
      const existing = this.selections.find(x => x.match_id === s.match_id);
      if (existing) Object.assign(existing, s);
      else this.selections.push(s);
      this.recalcOdds();
      localStorage.setItem("betarena_draft", JSON.stringify({ selections: this.selections, stake: this.stake }));
    },

    recalcOdds() {
      this.totalOdds = this.selections.reduce((acc, s) => acc * (s.odd || 1), 1);
    }
  });
});

window.addEventListener("load", async () => {
  if (api.getToken()) {
    try { await Alpine.store("app").loadProfile(); } catch (e) { /* ignore */ }
  }

  window._onApiUnauthorized = () => {
    Alpine.store("app").user = null;
    location.hash = "/login";
  };

  router.start();
});
