import { useState, useRef } from "react";

/* ── CONFIG ─────────────────────────────────────────────────── */
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwMvAhAkTki6mrfoHNBFie-fD2k9k2riLSPE4dKd83ljW9icN3YX2wIHxqFijtaOmxZ/exec";

/* ── THAILAND SLABS ──────────────────────────────────────────── */
const SLABS = [
  { min: 100000, amt: "₹1L", reward: "₹2K Cash",        icon: "🎁" },
  { min: 200000, amt: "₹2L", reward: "₹5K Cash",        icon: "💰" },
  { min: 300000, amt: "₹3L", reward: "₹10K Cash",       icon: "💎" },
  { min: 400000, amt: "₹4L", reward: "Thailand 1 Pax",  icon: "✈️" },
  { min: 700000, amt: "₹7L", reward: "Thailand 2 Pax",  icon: "🏝️" },
];
const THAILAND_TOTAL = 735000;

/* ── VLI SLABS ───────────────────────────────────────────────── */
const VLI_SLABS = [
  { min: 25000,  amt: "₹25K",  pct: "4%"  },
  { min: 50000,  amt: "₹50K",  pct: "6%"  },
  { min: 75000,  amt: "₹75K",  pct: "7%"  },
  { min: 100000, amt: "₹1L",   pct: "8%"  },
  { min: 150000, amt: "₹1.5L", pct: "10%" },
  { min: 200000, amt: "₹2L",   pct: "12%" },
  { min: 300000, amt: "₹3L",   pct: "15%" },
];
const VLI_TOTAL = 315000;

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

function parseRaw(val) {
  if (!val && val !== 0) return 0;
  return parseFloat(String(val).replace(/[₹,\s]/g, "")) || 0;
}

function fmtL(n) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2).replace(/\.?0+$/, "") + "L";
  if (n >= 1000)   return "₹" + (n / 1000).toFixed(1).replace(/\.?0+$/, "") + "K";
  return "₹" + Math.round(n);
}

function getSlabInfo(premium, slabs) {
  let cur = null, nxt = null;
  for (let i = slabs.length - 1; i >= 0; i--) {
    if (premium >= slabs[i].min) { cur = slabs[i]; nxt = slabs[i + 1] || null; break; }
  }
  if (!cur) nxt = slabs[0];
  return { cur, nxt };
}

/* ── MILESTONE BAR (Thailand) ────────────────────────────────── */
function ThailandBar({ booked, sourced }) {
  const bookedPct  = Math.min(100, (booked  / THAILAND_TOTAL) * 100);
  const sourcedPct = Math.min(100, (sourced / THAILAND_TOTAL) * 100);

  return (
    <div>
      {/* Reward labels above */}
      <div style={{ position:"relative", height:"36px", marginBottom:"4px" }}>
        {SLABS.map((s, i) => {
          const pct   = Math.min(97, (s.min / THAILAND_TOTAL) * 100);
          const bAch  = booked  >= s.min;
          const sAch  = sourced >= s.min;
          const color = bAch ? C.green : sAch ? C.accent : "#bbb";
          return (
            <div key={i} style={{ position:"absolute", left: pct + "%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
              <div style={{ fontSize:"10px", fontWeight:700, color, whiteSpace:"nowrap", background:C.card, padding:"1px 5px", borderRadius:"4px", border:`1px solid ${color}30` }}>
                {s.reward}
              </div>
              <div style={{ width:"1.5px", height:"6px", background:color }} />
            </div>
          );
        })}
      </div>

      {/* Bar */}
      <div style={{ height:"10px", background:C.border, borderRadius:"99px", overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", top:0, bottom:0, left:0, width: sourcedPct + "%", background:"#FFCDD2", borderRadius:"99px", transition:"width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
        <div style={{ position:"absolute", top:0, bottom:0, left:0, width: bookedPct  + "%", background:C.accent, borderRadius:"99px", transition:"width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      {/* Amount ticks below */}
      <div style={{ position:"relative", height:"36px", marginTop:"4px" }}>
        {SLABS.map((s, i) => {
          const pct   = Math.min(97, (s.min / THAILAND_TOTAL) * 100);
          const bAch  = booked  >= s.min;
          const sAch  = sourced >= s.min;
          const color = bAch ? C.green : sAch ? C.accent : "#bbb";
          return (
            <div key={i} style={{ position:"absolute", left: pct + "%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
              <div style={{ width:"1.5px", height:"6px", background:color }} />
              <div style={{ fontSize:"10px", fontWeight:700, color, whiteSpace:"nowrap" }}>{s.amt}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:"14px", marginTop:"6px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:C.muted }}>
          <div style={{ width:"9px", height:"9px", borderRadius:"2px", background:C.accent }} />
          Booked
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:C.muted }}>
          <div style={{ width:"9px", height:"9px", borderRadius:"2px", background:"#FFCDD2" }} />
          Sourced (pipeline)
        </div>
      </div>
    </div>
  );
}

/* ── VLI BAR ─────────────────────────────────────────────────── */
function VLIBar({ premium }) {
  const pct = Math.min(100, (premium / VLI_TOTAL) * 100);
  return (
    <div>
      {/* Pct labels above */}
      <div style={{ position:"relative", height:"36px", marginBottom:"4px" }}>
        {VLI_SLABS.map((s, i) => {
          const left  = Math.min(97, (s.min / VLI_TOTAL) * 100);
          const ach   = premium >= s.min;
          const color = ach ? C.green : "#bbb";
          return (
            <div key={i} style={{ position:"absolute", left: left + "%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
              <div style={{ fontSize:"10px", fontWeight:700, color, whiteSpace:"nowrap", background:C.card, padding:"1px 5px", borderRadius:"4px", border:`1px solid ${color}30` }}>
                {s.pct}
              </div>
              <div style={{ width:"1.5px", height:"6px", background:color }} />
            </div>
          );
        })}
      </div>

      {/* Bar */}
      <div style={{ height:"10px", background:C.border, borderRadius:"99px", overflow:"hidden" }}>
        <div style={{ height:"100%", width: pct + "%", background:C.accent, borderRadius:"99px", transition:"width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      {/* Amount ticks below */}
      <div style={{ position:"relative", height:"36px", marginTop:"4px" }}>
        {VLI_SLABS.map((s, i) => {
          const left  = Math.min(97, (s.min / VLI_TOTAL) * 100);
          const ach   = premium >= s.min;
          const color = ach ? C.green : "#bbb";
          return (
            <div key={i} style={{ position:"absolute", left: left + "%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
              <div style={{ width:"1.5px", height:"6px", background:color }} />
              <div style={{ fontSize:"10px", fontWeight:700, color, whiteSpace:"nowrap" }}>{s.amt}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── SECTION DIVIDER ─────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:C.muted, marginBottom:"10px", marginTop:"4px" }}>
    {children}
  </div>
);

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

  // Thailand data
  const sourced     = data ? parseLakh(data["net sourced premium"] || 0) : 0;
  const booked      = data ? parseLakh(data["net booked premium"]  || 0) : 0;
  const offer       = data ? (data["offer"] || "") : "";
  const gidCode     = data ? (data["gid"] || gid.toUpperCase()) : "";
  const { cur: tCur, nxt: tNxt } = getSlabInfo(booked, SLABS);

  // VLI data
  const vliPremium  = data ? parseRaw(data["vli premium"] || 0) : 0;
  const vliPctRaw   = data ? parseRaw(data["vli %"] || 0) : 0;
  const vliAmount   = data ? parseRaw(data["vli amount"] || 0) : 0;
  const vliPctDisplay = vliPctRaw > 0 ? (vliPctRaw * 100).toFixed(0) + "%" : "0%";
  const { cur: vCur, nxt: vNxt } = getSlabInfo(vliPremium, VLI_SLABS);

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:C.bg, minHeight:"100vh", paddingBottom:"60px" }}>

      {/* HEADER */}
      <div style={{ background:C.accent, padding:"22px 20px 28px", textAlign:"center", position:"relative" }}>
        {onBack && (
          <div onClick={onBack} style={{ position:"absolute", left:"16px", top:"22px", fontSize:"13px", fontWeight:600, color:"rgba(255,255,255,0.85)", cursor:"pointer" }}>
            ← Back
          </div>
        )}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"10px" }}>
          <img src="https://www.google.com/s2/favicons?domain=insurancedekho.com&sz=128" alt="" style={{ height:"28px", width:"28px", borderRadius:"6px" }}/>
          <div style={{ fontSize:"12px", fontWeight:700, color:"rgba(255,255,255,0.85)" }}>InsuranceDekho</div>
        </div>
        <div style={{ fontSize:"clamp(22px,6vw,30px)", fontWeight:700, color:"#fff", lineHeight:1.1 }}>
          🏆 Contest <span style={{ color:"#FFE082" }}>Achievement</span>
        </div>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.75)", marginTop:"6px" }}>
          Enter your GID to see all your live contest progress
        </div>
      </div>

      <div style={{ maxWidth:"480px", margin:"0 auto", padding:"12px 16px" }}>

        {/* GID SEARCH */}
        <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"16px 18px", marginBottom:"10px" }}>
          <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:C.muted, marginBottom:"10px" }}>
            Enter your GID / GCD code
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            <input
              ref={inputRef}
              value={gid}
              onChange={e => setGid(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && lookup()}
              placeholder="e.g. GID173676"
              style={{ flex:1, padding:"12px 14px", borderRadius:C.radiusSm, border:`1.5px solid ${C.border}`, background:"#FAFAFA", fontFamily:"'Inter',sans-serif", fontSize:"15px", color:C.text, fontWeight:600, outline:"none", letterSpacing:"1px" }}
            />
            <button onClick={lookup}
              style={{ background:C.accent, border:"none", borderRadius:C.radiusSm, color:"#fff", fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"14px", padding:"12px 20px", cursor:"pointer", whiteSpace:"nowrap" }}>
              {loading ? "..." : "Check →"}
            </button>
          </div>
          {error && (
            <div style={{ marginTop:"10px", padding:"10px 12px", background:C.accentLight, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, fontSize:"12px", color:C.accentText }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign:"center", padding:"40px", color:C.muted, fontSize:"13px" }}>
            <div style={{ width:"28px", height:"28px", border:`3px solid ${C.border}`, borderTopColor:C.accent, borderRadius:"50%", animation:"spin 0.75s linear infinite", margin:"0 auto 12px" }} />
            Fetching your live data…
          </div>
        )}

        {/* RESULT */}
        {data && !loading && (
          <>
            {/* Partner card */}
            <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"14px 18px", marginBottom:"10px", display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ width:"42px", height:"42px", borderRadius:"50%", background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", fontWeight:700, color:"#fff", flexShrink:0 }}>
                {gidCode.replace(/[^a-zA-Z]/g, "").charAt(0) || "P"}
              </div>
              <div>
                <div style={{ fontSize:"16px", fontWeight:700, color:C.text }}>{gidCode}</div>
                <div style={{ fontSize:"11px", color:C.muted, marginTop:"3px" }}>{offer || "Partner"}</div>
              </div>
            </div>

            {/* ══ THAILAND CHALO SECTION ══ */}
            <SectionLabel>🏝️ Thailand Chalo — Apr to Jun 2026</SectionLabel>

            <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"16px 18px", marginBottom:"10px" }}>

              {/* Numbers */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"22px" }}>
                <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, padding:"12px 14px" }}>
                  <div style={{ fontSize:"10px", color:C.muted, letterSpacing:"1px", marginBottom:"4px", fontWeight:600 }}>NET BOOKED</div>
                  <div style={{ fontSize:"22px", fontWeight:700, color:C.accent }}>{fmtL(booked)}</div>
                </div>
                <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, padding:"12px 14px" }}>
                  <div style={{ fontSize:"10px", color:C.muted, letterSpacing:"1px", marginBottom:"4px", fontWeight:600 }}>NET SOURCED</div>
                  <div style={{ fontSize:"22px", fontWeight:700, color:C.accentText, opacity:0.6 }}>{fmtL(sourced)}</div>
                </div>
              </div>

              <ThailandBar booked={booked} sourced={sourced} />

              {/* Gap message */}
              <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"11px 13px", borderRadius:C.radiusSm, background: tNxt ? C.accentLight : "#F0FDF4", border:`1.5px solid ${tNxt ? C.border : "#BBF7D0"}`, fontSize:"12px", color:C.text, marginTop:"14px" }}>
                <span style={{ fontSize:"16px" }}>{tNxt ? "🎯" : "🎉"}</span>
                {tNxt
                  ? <span>Book <strong>{fmtL(tNxt.min - booked)} more</strong> to unlock: <strong>{tNxt.reward}</strong></span>
                  : <span><strong style={{ color:C.green }}>Top slab achieved!</strong> Thailand for 2 is yours!</span>
                }
              </div>
            </div>

            {/* Current Thailand reward */}
            <div style={{ background:C.accentLight, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"14px 18px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ fontSize:"26px", flexShrink:0 }}>{tCur ? tCur.icon : "🚀"}</div>
              <div>
                <div style={{ fontSize:"10px", color:C.muted, fontWeight:600, letterSpacing:"1px", textTransform:"uppercase" }}>Current reward</div>
                <div style={{ fontSize:"15px", fontWeight:700, color:C.accentText, marginTop:"2px" }}>{tCur ? tCur.reward : "No slab achieved yet"}</div>
                <div style={{ fontSize:"11px", color:C.muted, marginTop:"3px" }}>
                  {tNxt ? `${fmtL(tNxt.min - booked)} more to upgrade → ${tNxt.reward}` : "Booking allowed till 10 Jul 2026"}
                </div>
              </div>
            </div>

            {/* ══ VLI SECTION ══ */}
            <SectionLabel>💰 Health Payout Incentive (VLI) — Apr 2026</SectionLabel>

            <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"16px 18px", marginBottom:"10px" }}>

              {/* VLI Numbers */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginBottom:"22px" }}>
                <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, padding:"10px", textAlign:"center" }}>
                  <div style={{ fontSize:"9px", color:C.muted, letterSpacing:"1px", marginBottom:"4px", fontWeight:600 }}>VLI PREMIUM</div>
                  <div style={{ fontSize:"18px", fontWeight:700, color:C.accent }}>{fmtL(vliPremium)}</div>
                </div>
                <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, padding:"10px", textAlign:"center" }}>
                  <div style={{ fontSize:"9px", color:C.muted, letterSpacing:"1px", marginBottom:"4px", fontWeight:600 }}>VLI %</div>
                  <div style={{ fontSize:"18px", fontWeight:700, color:C.green }}>{vliPctDisplay}</div>
                </div>
                <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, padding:"10px", textAlign:"center" }}>
                  <div style={{ fontSize:"9px", color:C.muted, letterSpacing:"1px", marginBottom:"4px", fontWeight:600 }}>VLI AMOUNT</div>
                  <div style={{ fontSize:"18px", fontWeight:700, color:C.accentText }}>
                    {vliAmount > 0 ? "₹" + parseFloat(vliAmount).toLocaleString("en-IN", { maximumFractionDigits:2 }) : "₹0"}
                  </div>
                </div>
              </div>

              <VLIBar premium={vliPremium} />

              {/* VLI gap message */}
              <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"11px 13px", borderRadius:C.radiusSm, background: vNxt ? C.accentLight : "#F0FDF4", border:`1.5px solid ${vNxt ? C.border : "#BBF7D0"}`, fontSize:"12px", color:C.text, marginTop:"14px" }}>
                <span style={{ fontSize:"16px" }}>{vNxt ? "🎯" : "🎉"}</span>
                {vNxt
                  ? <span>Book <strong>{fmtL(vNxt.min - vliPremium)} more</strong> to unlock: <strong>{vNxt.pct} extra payout</strong></span>
                  : <span><strong style={{ color:C.green }}>Top VLI slab!</strong> You're earning 15% extra payout!</span>
                }
              </div>
            </div>

            {/* ══ COMING SOON ══ */}
            <SectionLabel>Coming Soon</SectionLabel>
            <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"14px 18px", marginBottom:"10px", opacity:0.5 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:"#F5F5F5", border:"1px solid #E0E0E0", borderRadius:"20px", padding:"2px 8px", fontSize:"10px", fontWeight:700, color:C.muted, marginBottom:"6px" }}>
                Coming Soon
              </div>
              <div style={{ fontSize:"15px", fontWeight:700, color:C.muted }}>Next Contest</div>
              <div style={{ fontSize:"12px", color:C.muted, marginTop:"4px" }}>Stay tuned for the next exciting contest!</div>
            </div>

            {/* Dates */}
            <div style={{ height:"1px", background:C.border, margin:"4px 0 10px" }} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
              {[
                { label:"Thailand Payment",  value:"1 Apr – 30 Jun 2026" },
                { label:"Thailand Booking",  value:"10 Jul 2026"         },
                { label:"VLI Booking",       value:"1 Apr – 30 Apr 2026" },
                { label:"VLI Max Payout",    value:"15%"                 },
              ].map((d, i) => (
                <div key={i} style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, padding:"11px 13px" }}>
                  <div style={{ fontSize:"10px", color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"1px" }}>{d.label}</div>
                  <div style={{ fontSize:"12px", fontWeight:700, color:C.text, marginTop:"4px" }}>{d.value}</div>
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
