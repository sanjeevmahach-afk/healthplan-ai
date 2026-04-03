import { useState, useRef } from "react";

/* ── CONFIG ─────────────────────────────────────────────────── */
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwMvAhAkTki6mrfoHNBFie-fD2k9k2riLSPE4dKd83ljW9icN3YX2wIHxqFijtaOmxZ/exec";

const SLABS = [
  { min: 25000,  label: "₹25K",  pct: "4%"  },
  { min: 50000,  label: "₹50K",  pct: "6%"  },
  { min: 75000,  label: "₹75K",  pct: "7%"  },
  { min: 100000, label: "₹1L",   pct: "8%"  },
  { min: 150000, label: "₹1.5L", pct: "10%" },
  { min: 200000, label: "₹2L",   pct: "12%" },
  { min: 300000, label: "₹3L",   pct: "15%" },
];

const TOTAL = 315000;

/* ── THEME ───────────────────────────────────────────────────── */
const C = {
  bg:          "#FDF6F6",
  card:        "#FFFFFF",
  border:      "#F0DEDE",
  text:        "#111111",
  muted:       "#999999",
  accent:      "#E53935",
  accentLight: "#FFF0F0",
  accentText:  "#C62828",
  green:       "#059669",
  radius:      "14px",
  radiusSm:    "9px",
};

/* ── HELPERS ─────────────────────────────────────────────────── */
function parsePremium(val) {
  if (!val && val !== 0) return 0;
  return parseFloat(String(val).replace(/[₹,\s]/g, "")) || 0;
}

function fmtPremium(n) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2).replace(/\.?0+$/, "") + "L";
  if (n >= 1000)   return "₹" + (n / 1000).toFixed(1).replace(/\.?0+$/, "") + "K";
  return "₹" + Math.round(n);
}

function fmtAmount(n) {
  if (!n || n === 0) return "₹0";
  return "₹" + parseFloat(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function getSlabInfo(premium) {
  let cur = null, nxt = null;
  for (let i = SLABS.length - 1; i >= 0; i--) {
    if (premium >= SLABS[i].min) { cur = SLABS[i]; nxt = SLABS[i + 1] || null; break; }
  }
  if (!cur) nxt = SLABS[0];
  return { cur, nxt };
}

/* ── MILESTONE BAR ───────────────────────────────────────────── */
function MilestoneBar({ premium }) {
  const pct = Math.min(100, (premium / TOTAL) * 100);

  return (
    <div>
      {/* Pct labels above */}
      <div style={{ position: "relative", height: "36px", marginBottom: "4px" }}>
        {SLABS.map((s, i) => {
          const left  = Math.min(97, (s.min / TOTAL) * 100);
          const ach   = premium >= s.min;
          const color = ach ? C.green : "#bbb";
          return (
            <div key={i} style={{ position: "absolute", left: left + "%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color, whiteSpace: "nowrap", background: C.card, padding: "1px 5px", borderRadius: "4px", border: `1px solid ${color}30` }}>
                {s.pct}
              </div>
              <div style={{ width: "1.5px", height: "6px", background: color }} />
            </div>
          );
        })}
      </div>

      {/* Bar */}
      <div style={{ height: "10px", background: C.border, borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: C.accent, borderRadius: "99px", transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      {/* Amount ticks below */}
      <div style={{ position: "relative", height: "36px", marginTop: "4px" }}>
        {SLABS.map((s, i) => {
          const left  = Math.min(97, (s.min / TOTAL) * 100);
          const ach   = premium >= s.min;
          const color = ach ? C.green : "#bbb";
          return (
            <div key={i} style={{ position: "absolute", left: left + "%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <div style={{ width: "1.5px", height: "6px", background: color }} />
              <div style={{ fontSize: "10px", fontWeight: 700, color, whiteSpace: "nowrap" }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN ────────────────────────────────────────────────────── */
export default function VLIDashboard({ onBack }) {
  const [gid,     setGid]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [data,    setData]    = useState(null);
  const inputRef = useRef(null);

  async function lookup() {
    const q = gid.trim().toUpperCase();
    if (!q) return;
    setLoading(true); setError(""); setData(null);
    try {
      const resp = await fetch(`${APPS_SCRIPT_URL}?gid=${encodeURIComponent(q)}`);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const json = await resp.json();
      if (json.error) { setError("GID / GCD not found. Please check your code."); setLoading(false); return; }
      setData(json);
    } catch (e) {
      setError("Could not fetch data. Please try again.");
    }
    setLoading(false);
  }

  // VLI premium is in absolute rupees (not lakhs)
  const vliPremium = data ? parsePremium(data["vli premium"]) : 0;
  const vliPct     = data ? (parseFloat(data["vli %"]) || 0) : 0;
  const vliAmount  = data ? parsePremium(data["vli amount"]) : 0;
  const gidCode    = data ? (data["gid"] || gid.toUpperCase()) : "";
  const { cur, nxt } = getSlabInfo(vliPremium);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.bg, minHeight: "100vh", padding: "0 0 60px" }}>

      {/* HEADER */}
      <div style={{ background: C.accent, padding: "22px 20px 28px", textAlign: "center", position: "relative" }}>
        {onBack && (
          <div onClick={onBack} style={{ position: "absolute", left: "16px", top: "22px", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.85)", cursor: "pointer" }}>
            ← Back
          </div>
        )}
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", borderRadius: "20px", padding: "3px 12px", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: "rgba(255,255,255,0.85)", marginBottom: "10px" }}>
          VOLUME LINKED INCENTIVE · APR 2026
        </div>
        <div style={{ fontSize: "clamp(26px,7vw,36px)", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
          Health Payout <span style={{ color: "#FFE082" }}>Incentive!</span>
        </div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "6px" }}>
          Earn extra payout over the base grid
        </div>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "12px 16px" }}>

        {/* SEARCH */}
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: C.radius, padding: "16px 18px", marginBottom: "10px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: C.muted, marginBottom: "10px" }}>
            Enter your GID / GCD code
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              ref={inputRef}
              value={gid}
              onChange={e => setGid(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && lookup()}
              placeholder="e.g. GID173676"
              style={{ flex: 1, padding: "12px 14px", borderRadius: C.radiusSm, border: `1.5px solid ${C.border}`, background: "#FAFAFA", fontFamily: "'Inter',sans-serif", fontSize: "15px", color: C.text, fontWeight: 600, outline: "none", letterSpacing: "1px" }}
            />
            <button
              onClick={lookup}
              style={{ background: C.accent, border: "none", borderRadius: C.radiusSm, color: "#fff", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "14px", padding: "12px 20px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {loading ? "..." : "Check →"}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: "10px", padding: "10px 12px", background: C.accentLight, border: `1.5px solid ${C.border}`, borderRadius: C.radiusSm, fontSize: "12px", color: C.accentText }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: C.muted, fontSize: "13px" }}>
            <div style={{ width: "28px", height: "28px", border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto 12px" }} />
            Fetching your live data…
          </div>
        )}

        {/* RESULT */}
        {data && !loading && (
          <>
            {/* Partner card */}
            <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: C.radius, padding: "14px 18px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {gidCode.replace(/[^a-zA-Z]/g, "").charAt(0) || "P"}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>{gidCode}</div>
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "3px" }}>VLI · April 2026</div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "10px" }}>
              {[
                { label: "VLI PREMIUM",   value: fmtPremium(vliPremium), color: C.accent },
                { label: "PAYOUT %",      value: vliPct > 0 ? (vliPct * 100).toFixed(0) + "%" : "0%", color: C.green },
                { label: "EXTRA PAYOUT",  value: fmtAmount(vliAmount),   color: C.accentText },
              ].map((s, i) => (
                <div key={i} style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: C.radiusSm, padding: "12px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: "9px", color: C.muted, letterSpacing: "1px", marginBottom: "4px", fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Progress card */}
            <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: C.radius, padding: "16px 18px", marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: C.muted, marginBottom: "14px" }}>
                Your VLI progress — April 2026
              </div>

              <MilestoneBar premium={vliPremium} />

              {/* Gap message */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderRadius: C.radiusSm, background: nxt ? C.accentLight : "#F0FDF4", border: `1.5px solid ${nxt ? C.border : "#BBF7D0"}`, fontSize: "12px", color: C.text, marginTop: "14px" }}>
                <span style={{ fontSize: "16px" }}>{nxt ? "🎯" : "🎉"}</span>
                {nxt
                  ? <span>Book <strong>{fmtPremium(nxt.min - vliPremium)} more</strong> to unlock: <strong>{nxt.pct} extra payout</strong></span>
                  : <span><strong style={{ color: C.green }}>Top slab achieved!</strong> You're earning 15% extra payout!</span>
                }
              </div>
            </div>

            {/* Current slab */}
            <div style={{ background: C.accentLight, border: `1.5px solid ${C.border}`, borderRadius: C.radius, padding: "14px 18px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "26px", flexShrink: 0 }}>{cur ? "💰" : "🚀"}</div>
              <div>
                <div style={{ fontSize: "10px", color: C.muted, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Current slab</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: C.accentText, marginTop: "2px" }}>
                  {cur ? `${cur.pct} extra payout on ₹${(vliPremium).toLocaleString("en-IN")}` : "No slab achieved yet"}
                </div>
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "3px" }}>
                  {nxt ? `${fmtPremium(nxt.min - vliPremium)} more to reach ${nxt.pct} slab` : "Booking period: 1 Apr – 30 Apr 2026"}
                </div>
              </div>
            </div>

            {/* All slabs table */}
            <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: C.radius, padding: "16px 18px", marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: C.muted, marginBottom: "12px" }}>
                All VLI Slabs
              </div>
              {SLABS.map((s, i) => {
                const ach    = vliPremium >= s.min;
                const isNext = nxt && s.min === nxt.min;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i < SLABS.length - 1 ? `1px solid ${C.border}` : "none", opacity: (!ach && !isNext) ? 0.45 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: ach ? C.green : isNext ? C.accent : C.border, flexShrink: 0 }} />
                      <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>Net Premium ≥ {s.label}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: ach ? C.green : isNext ? C.accent : C.muted }}>{s.pct}</div>
                      {ach && <div style={{ background: C.green, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px" }}>✓</div>}
                      {isNext && <div style={{ background: C.accent, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px" }}>Next</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Date */}
            <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: C.radiusSm, padding: "11px 13px" }}>
              <div style={{ fontSize: "10px", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Booking Period</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginTop: "4px" }}>1 Apr – 30 Apr 2026</div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input { font-family: inherit !important; }
        input::placeholder { color: #aaa !important; font-weight: 400 !important; }
      `}</style>
    </div>
  );
}
