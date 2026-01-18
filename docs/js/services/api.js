const CONFIG = window.__APP_CONFIG__ || {};
const BASE_ROOT = CONFIG.API_BASE ? CONFIG.API_BASE.replace(/\/$/, "") : "";
const BASE = BASE_ROOT.endsWith("/api") || BASE_ROOT === "" ? BASE_ROOT : (BASE_ROOT + "/api");
const TOKEN_KEY = "betarena_token";

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function request(path, opts = {}) {
  const headers = opts.headers ? { ...opts.headers } : {};
  if (!headers["Content-Type"] && !(opts.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  const url = (BASE || "") + path;
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) {
    clearToken();
    if (window._onApiUnauthorized) window._onApiUnauthorized();
    throw new Error("Unauthorized");
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

export default {
  getToken,
  setToken,
  clearToken,
  request,
  get(path) { return request(path, { method: "GET" }); },
  post(path, body) { return request(path, { method: "POST", body: JSON.stringify(body) }); },
  put(path, body) { return request(path, { method: "PUT", body: JSON.stringify(body) }); },
  del(path) { return request(path, { method: "DELETE" }); }
};
