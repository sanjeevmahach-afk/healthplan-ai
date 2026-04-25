/* ── ANALYTICS — fire-and-forget event tracker ───────────────
   Sends events to Apps Script without awaiting response.
   Never blocks the UI. Fails silently.
   
   Schema logged to "Analytics" sheet:
   A: Timestamp  B: Event     C: Category  D: Detail_1
   E: Detail_2   F: GID       G: Session
─────────────────────────────────────────────────────────── */

const ANALYTICS_URL = "https://script.google.com/macros/s/AKfycbwMvAhAkTki6mrfoHNBFie-fD2k9k2riLSPE4dKd83ljW9icN3YX2wIHxqFijtaOmxZ/exec";

// ── Session ID — unique per browser session ──
function getSession() {
  try {
    let s = sessionStorage.getItem("hpt_session");
    if (!s) {
      s = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      sessionStorage.setItem("hpt_session", s);
    }
    return s;
  } catch (e) { return "unknown"; }
}

// ── Get cached GID ──
function getGid() {
  try { return localStorage.getItem("hpt_last_gid") || ""; } catch (e) { return ""; }
}

// ── Core fire-and-forget tracker ──
export function track(event, category, detail1 = "", detail2 = "") {
  try {
    const params = new URLSearchParams({
      action:   "track",
      event,
      category,
      detail1,
      detail2,
      gid:      getGid(),
      session:  getSession(),
    });
    fetch(`${ANALYTICS_URL}?${params.toString()}`).catch(() => {});
  } catch (e) {}
}

// ── Convenience helpers ──
export const Analytics = {

  // Home
  tabClick:       (tabName)           => track("Tab Click",            "Navigation",   tabName),
  toolCardClick:  (toolName)          => track("Tool Card Click",       "Navigation",   toolName),

  // Plan Recommender
  pedSelected:    (ped)               => track("PED Selected",          "Recommender",  ped),
  planRecommended:(planName, ped)     => track("Plan Recommended",      "Recommender",  planName, ped),
  recommendRun:   (ped, age, bmi)     => track("Recommendation Run",    "Recommender",  `PED:${ped}`, `Age:${age} BMI:${bmi}`),

  // Contest
  gidLookup:      (gid)               => track("GID Lookup",            "Contest",      gid),
  leaderboardOpen:(type)              => track("Leaderboard Opened",     "Contest",      type), // "Thailand" or "VLI"

  // Calculator
  insurerSelected:(insurer)           => track("Insurer Selected",      "Calculator",   insurer),
  planSelected:   (plan, insurer)     => track("Plan Selected",         "Calculator",   plan, insurer),
  calculateClick: (insurer, plan, si) => track("Calculate Clicked",     "Calculator",   `${insurer} | ${plan}`, `SI:${si}`),
};
