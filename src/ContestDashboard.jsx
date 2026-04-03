import { useState, useRef } from "react";

/* ── CONFIG ─────────────────────────────────────────────────── */
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwMvAhAkTki6mrfoHNBFie-fD2k9k2riLSPE4dKd83ljW9icN3YX2wIHxqFijtaOmxZ/exec";

const SLABS = [
  { min: 100000, amt: "₹1L", reward: "₹2K Cash",       icon: "🎁" },
  { min: 200000, amt: "₹2L", reward: "₹5K Cash",       icon: "💰" },
  { min: 300000, amt: "₹3L", reward: "₹10K Cash",      icon: "💎" },
  { min: 400000, amt: "₹4L", reward: "Thailand 1 Pax", icon: "✈️" },
  { min: 700000, amt: "₹7L", reward: "Thailand 2 Pax", icon: "🏝️" },
];

const TOTAL = 735000;

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
function parseLakh(val) {
  if (!val && val !== 0) return 0;
  return (parseFloat(String(val).replace(/[₹,\s]/g, "")) || 0) * 100000;
}

function fmtL(n) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2).replace(/\.?0+$/, "") + "L";
  if (n >= 1000)   return "₹" + (n / 1000).toFixed(1).replace(/\.?0+$/, "") + "K";
  return "₹" + Math.round(n);
}

function getSlabInfo(b) {
  let cur = null, nxt = null;
  for (let i = SLABS.length - 1; i >= 0; i--) {
    if (b >= SLABS[i].min) { cur = SLABS[i]; nxt = SLABS[i + 1] || null; break; }
  }
  if (!cur) nxt = SLABS[0];
  return { cur, nxt };
}

/* ── MILESTONE BAR ───────────────────────────────────────────── */
function MilestoneBar({ booked, sourced }) {
  const bookedPct  = Math.min(100, (booked  / TOTAL) * 100);
  const sourcedPct = Math.min(100, (sourced / TOTAL) * 100);

  return (
    <div>
      {/* Reward labels above */}
      <div style={{ position: "relative", height: "36px", marginBottom: "4px" }}>
        {SLABS.map((s, i) => {
          const pct   = Math.min(97, (s.min / TOTAL) * 100);
          const bAch  = booked  >= s.min;
          const sAch  = sourced >= s.min;
          const color = bAch ? C.green : sAch ? C.accent : "#bbb";
          return (
            <div key={i} style={{ position: "absolute", left: pct + "%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color, whiteSpace: "nowrap", background: C.card, padding: "1px 5px", borderRadius: "4px", border: `1px solid ${color}30` }}>
                {s.reward}
              </div>
              <div style={{ width: "1.5px", height: "6px", background: color }} />
            </div>
          );
        })}
      </div>

      {/* Bar */}
      <div style={{ height: "10px", background: C.border, borderRadius: "99px", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: sourcedPct + "%", background: "#FFCDD2", borderRadius: "99px", transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: bookedPct  + "%", background: C.accent, borderRadius: "99px", transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      {/* Amount ticks below */}
      <div style={{ position: "relative", height: "36px", marginTop: "4px" }}>
        {SLABS.map((s, i) => {
          const pct   = Math.min(97, (s.min / TOTAL) * 100);
          const bAch  = booked  >= s.min;
          const sAch  = sourced >= s.min;
          const color = bAch ? C.green : sAch ? C.accent : "#bbb";
          return (
            <div key={i} style={{ position: "absolute", left: pct + "%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <div style={{ width: "1.5px", height: "6px", background: color }} />
              <div style={{ fontSize: "10px", fontWeight: 700, color, whiteSpace: "nowrap" }}>{s.amt}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "14px", marginTop: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: C.muted }}>
          <div style={{ width: "9px", height: "9px", borderRadius: "2px", background: C.accent }} />
          Booked
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: C.muted }}>
          <div style={{ width: "9px", height: "9px", borderRadius: "2px", background: "#FFCDD2" }} />
          Sourced (pipeline)
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ────────────────────────────────────────────────────── */
export default function ContestDashboard({ onBack }) {
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

  const booked  = data ? parseLakh(data["net booked premium"]  || 0) : 0;
  const sourced = data ? parseLakh(data["net sourced premium"] || 0) : 0;
  const offer   = data ? (data["offer"] || "") : "";
  const gidCode = data ? (data["idtree.dealer_gcd_code"] || gid.toUpperCase()) : "";
  const { cur, nxt } = getSlabInfo(booked);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.bg, minHeight: "100vh", padding: "0 0 60px" }}>

      {/* HEADER */}
      <div style={{ background: C.accent, padding: "22px 20px 28px", textAlign: "center", position:"relative" }}>
        {onBack && (
          <div onClick={onBack} style={{ position:"absolute", left:"16px", top:"22px", display:"flex", alignItems:"center", gap:"4px", fontSize:"13px", fontWeight:600, color:"rgba(255,255,255,0.85)", cursor:"pointer" }}>
            ← Back
          </div>
        )}
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", borderRadius: "20px", padding: "3px 12px", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: "rgba(255,255,255,0.85)", marginBottom: "10px" }}>
          HEALTH SALES CONTEST · APR–JUN 2026
        </div>
        <div style={{ fontSize: "clamp(30px,8vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
          Thailand <span style={{ color: "#FFE082" }}>Chalo!</span>
        </div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "6px" }}>
          Your Health Sales Can Take You to Thailand
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
            {/* Partner */}
            <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: C.radius, padding: "14px 18px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {gidCode.replace(/[^a-zA-Z]/g, "").charAt(0) || "P"}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>{gidCode}</div>
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "3px" }}>{offer}</div>
              </div>
            </div>

            {/* Progress */}
            <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: C.radius, padding: "16px 18px", marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: C.muted, marginBottom: "14px" }}>
                Your progress — Thailand Chalo
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "22px" }}>
                <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: C.radiusSm, padding: "12px 14px" }}>
                  <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "1px", marginBottom: "4px", fontWeight: 600 }}>NET BOOKED</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: C.accent }}>{fmtL(booked)}</div>
                </div>
                <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: C.radiusSm, padding: "12px 14px" }}>
                  <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "1px", marginBottom: "4px", fontWeight: 600 }}>NET SOURCED</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: C.accentText, opacity: 0.6 }}>{fmtL(sourced)}</div>
                </div>
              </div>

              <MilestoneBar booked={booked} sourced={sourced} />

              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderRadius: C.radiusSm, background: nxt ? C.accentLight : "#F0FDF4", border: `1.5px solid ${nxt ? C.border : "#BBF7D0"}`, fontSize: "12px", color: C.text, marginTop: "14px" }}>
                <span style={{ fontSize: "16px" }}>{nxt ? "🎯" : "🎉"}</span>
                {nxt
                  ? <span>Book <strong>{fmtL(nxt.min - booked)} more</strong> to unlock: <strong>{nxt.reward}</strong></span>
                  : <span><strong style={{ color: C.green }}>Top slab achieved!</strong> Thailand for 2 is yours!</span>
                }
              </div>
            </div>

            {/* Current reward */}
            <div style={{ background: C.accentLight, border: `1.5px solid ${C.border}`, borderRadius: C.radius, padding: "14px 18px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "26px", flexShrink: 0 }}>{cur ? cur.icon : "🚀"}</div>
              <div>
                <div style={{ fontSize: "10px", color: C.muted, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Current reward</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: C.accentText, marginTop: "2px" }}>{cur ? cur.reward : "No slab achieved yet"}</div>
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "3px" }}>
                  {nxt ? `${fmtL(nxt.min - booked)} more to upgrade → ${nxt.reward}` : "Booking allowed till 10 Jul 2026"}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div style={{ height: "1px", background: C.border, margin: "4px 0 10px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "Payment window",   value: "1 Apr – 30 Jun 2026" },
                { label: "Booking deadline", value: "10 Jul 2026" },
              ].map((d, i) => (
                <div key={i} style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: C.radiusSm, padding: "11px 13px" }}>
                  <div style={{ fontSize: "10px", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{d.label}</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: C.text, marginTop: "4px" }}>{d.value}</div>
                </div>
              ))}
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
