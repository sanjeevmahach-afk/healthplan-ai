import { useState, useRef } from "react";
import { C } from "./App";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwMvAhAkTki6mrfoHNBFie-fD2k9k2riLSPE4dKd83ljW9icN3YX2wIHxqFijtaOmxZ/exec";

/* ── SLABS ───────────────────────────────────────────────────── */
const SLABS = [
  { min: 100000,  amt: "1L",  reward: "2K Cash"        },
  { min: 200000,  amt: "2L",  reward: "5K Cash"        },
  { min: 300000,  amt: "3L",  reward: "10K Cash"       },
  { min: 400000,  amt: "4L",  reward: "Thailand 1 Pax" },
  { min: 700000,  amt: "7L",  reward: "Thailand 2 Pax" },
];
const THAILAND_TOTAL = 735000;

const VLI_SLABS = [
  { min: 25000,  amt: "25K",  pct: "4%"  },
  { min: 50000,  amt: "50K",  pct: "6%"  },
  { min: 75000,  amt: "75K",  pct: "7%"  },
  { min: 100000, amt: "1L",   pct: "8%"  },
  { min: 150000, amt: "1.5L", pct: "10%" },
  { min: 200000, amt: "2L",   pct: "12%" },
  { min: 300000, amt: "3L",   pct: "15%" },
];
const VLI_TOTAL = 315000;

/* ── HELPERS ─────────────────────────────────────────────────── */
function parseLakh(val) {
  if (!val && val !== 0) return 0;
  return (parseFloat(String(val).replace(/[^\d.]/g, "")) || 0) * 100000;
}
function parseRaw(val) {
  if (!val && val !== 0) return 0;
  return parseFloat(String(val).replace(/[^\d.]/g, "")) || 0;
}
function fmtL(n) {
  if (n >= 100000) return "Rs." + (n / 100000).toFixed(2).replace(/\.?0+$/, "") + "L";
  if (n >= 1000)   return "Rs." + (n / 1000).toFixed(1).replace(/\.?0+$/, "") + "K";
  return "Rs." + Math.round(n);
}
function getSlabInfo(premium, slabs) {
  let cur = null, nxt = null;
  for (let i = slabs.length - 1; i >= 0; i--) {
    if (premium >= slabs[i].min) { cur = slabs[i]; nxt = slabs[i + 1] || null; break; }
  }
  if (!cur) nxt = slabs[0];
  return { cur, nxt };
}

/* ── PROGRESS BAR ────────────────────────────────────────────── */
function ProgressBar({ value, total, color = C.red, trackColor = "#E8ECF4" }) {
  const pct = Math.min(100, (value / total) * 100);
  return (
    <div style={{ height: "8px", background: trackColor, borderRadius: "99px", overflow: "hidden" }}>
      <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: "99px",
        transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

/* ── SECTION HEADER ──────────────────────────────────────────── */
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "10px", marginTop: "20px" }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>{subtitle}</div>}
    </div>
  );
}

/* ── STAT TILE ───────────────────────────────────────────────── */
function StatTile({ label, value, valueColor = C.text }) {
  return (
    <div style={{ background: C.bg, borderRadius: C.radiusSm, padding: "12px", textAlign: "center" }}>
      <div style={{ fontSize: "10px", color: C.muted, fontWeight: 600, textTransform: "uppercase",
        letterSpacing: "0.05em", marginBottom: "5px" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 700, color: valueColor }}>{value}</div>
    </div>
  );
}

/* ── MAIN ────────────────────────────────────────────────────── */
export default function ContestDashboard() {
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
      if (!resp.ok) throw new Error();
      const json = await resp.json();
      if (json.error) { setError("GID not found. Please check your code."); setLoading(false); return; }
      setData(json);
    } catch { setError("Could not fetch data. Please try again."); }
    setLoading(false);
  }

  const sourced   = data ? parseLakh(data["net sourced premium"] || 0) : 0;
  const booked    = data ? parseLakh(data["net booked premium"]  || 0) : 0;
  const offer     = data ? (data["offer"] || "") : "";
  const gidCode   = data ? (data["gid"] || gid.toUpperCase()) : "";
  const { cur: tCur, nxt: tNxt } = getSlabInfo(booked, SLABS);

  const vliPremium    = data ? parseRaw(data["vli premium"] || 0) : 0;
  const vliPctRaw     = data ? parseRaw(data["vli %"] || 0) : 0;
  const vliAmount     = data ? parseRaw(data["vli amount"] || 0) : 0;
  const vliPctDisplay = vliPctRaw > 0 ? (vliPctRaw * 100).toFixed(0) + "%" : "0%";
  const { cur: vCur, nxt: vNxt } = getSlabInfo(vliPremium, VLI_SLABS);

  const showThailand = booked > 0 || sourced > 0;
  const showVLI      = vliPremium > 0;

  return (
    <div style={{ fontFamily: C.font }}>

      {/* PAGE HEADER */}
      <div style={{ background: C.card, padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>Contest Achievement</div>
        <div style={{ fontSize: "13px", color: C.muted, marginTop: "2px" }}>Enter your GID to view live progress</div>
      </div>

      <div style={{ padding: "16px" }}>

        {/* GID SEARCH */}
        <div style={{ background: C.card, borderRadius: C.radius, padding: "16px",
          boxShadow: C.shadow, marginBottom: "4px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.muted, textTransform: "uppercase",
            letterSpacing: "0.05em", marginBottom: "10px" }}>GID / GCD Code</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input ref={inputRef} value={gid}
              onChange={e => setGid(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && lookup()}
              placeholder="e.g. GID173676"
              style={{ flex: 1, padding: "12px 14px", borderRadius: C.radiusSm,
                border: `1.5px solid ${C.border}`, background: C.bg, fontSize: "15px",
                color: C.text, fontWeight: 600, outline: "none", letterSpacing: "1px",
                fontFamily: C.font }}/>
            <button onClick={lookup}
              style={{ background: C.red, border: "none", borderRadius: C.radiusSm,
                color: "#fff", fontFamily: C.font, fontWeight: 600, fontSize: "14px",
                padding: "12px 20px", cursor: "pointer", whiteSpace: "nowrap" }}>
              {loading ? "..." : "Check"}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: "10px", padding: "10px 12px", background: C.redLight,
              borderRadius: C.radiusXs, fontSize: "12px", color: C.red }}>
              {error}
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: C.muted, fontSize: "13px" }}>
            <div style={{ width: "24px", height: "24px", border: `2.5px solid ${C.border}`,
              borderTopColor: C.red, borderRadius: "50%", animation: "spin 0.75s linear infinite",
              margin: "0 auto 12px" }} />
            Loading your data...
          </div>
        )}

        {/* RESULT */}
        {data && !loading && (
          <>
            {/* Partner card */}
            <div style={{ background: C.card, borderRadius: C.radius, padding: "14px 16px",
              marginTop: "12px", boxShadow: C.shadow, display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: C.redLight,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px",
                fontWeight: 700, color: C.red, flexShrink: 0 }}>
                {gidCode.replace(/[^a-zA-Z]/g, "").charAt(0) || "P"}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>{gidCode}</div>
                {offer && <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>{offer}</div>}
              </div>
            </div>

            {/* ── THAILAND CHALO ── */}
            {showThailand && (
              <>
                <SectionHeader title="Thailand Chalo" subtitle="Apr – Jun 2026  |  Payment window" />
                <div style={{ background: C.card, borderRadius: C.radius, padding: "16px",
                  boxShadow: C.shadow, marginBottom: "4px" }}>

                  {/* Numbers */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                    <StatTile label="Net Booked" value={fmtL(booked)} valueColor={C.red} />
                    <StatTile label="Net Sourced" value={fmtL(sourced)} valueColor={C.muted} />
                  </div>

                  {/* Bar */}
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ position: "relative", marginBottom: "4px" }}>
                      {/* Sourced underlay */}
                      <div style={{ height: "8px", background: "#E8ECF4", borderRadius: "99px", overflow: "hidden", position: "relative" }}>
                        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0,
                          width: Math.min(100,(sourced/THAILAND_TOTAL)*100) + "%",
                          background: "#FCA5A5", borderRadius: "99px",
                          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0,
                          width: Math.min(100,(booked/THAILAND_TOTAL)*100) + "%",
                          background: C.red, borderRadius: "99px",
                          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                      </div>
                    </div>
                    {/* Amount ticks */}
                    <div style={{ position: "relative", height: "18px" }}>
                      {SLABS.map((s, i) => {
                        const pct = Math.min(96, (s.min / THAILAND_TOTAL) * 100);
                        const ach = booked >= s.min;
                        return (
                          <div key={i} style={{ position: "absolute", left: pct + "%",
                            transform: "translateX(-50%)", fontSize: "9px", fontWeight: 600,
                            color: ach ? C.green : C.hint, whiteSpace: "nowrap" }}>
                            Rs.{s.amt}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reward pills */}
                  <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", marginBottom: "12px" }}>
                    {SLABS.map((s, i) => {
                      const bAch = booked >= s.min;
                      const sAch = sourced >= s.min;
                      return (
                        <div key={i} style={{ flexShrink: 0, borderRadius: C.radiusSm, padding: "6px 10px",
                          background: bAch ? C.greenLight : sAch ? "#FFF7ED" : C.bg,
                          border: `1px solid ${bAch ? "#86EFAC" : sAch ? "#FCD34D" : C.border}` }}>
                          <div style={{ fontSize: "10px", fontWeight: 700,
                            color: bAch ? C.green : sAch ? "#B45309" : C.muted }}>Rs.{s.amt}</div>
                          <div style={{ fontSize: "9px", color: bAch ? C.green : sAch ? "#B45309" : C.hint,
                            marginTop: "1px" }}>{s.reward}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div style={{ display: "flex", gap: "14px", marginBottom: "12px" }}>
                    {[{ color: C.red, label: "Booked" }, { color: "#FCA5A5", label: "Sourced" }].map((l, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px",
                        fontSize: "11px", color: C.muted }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: l.color }} />
                        {l.label}
                      </div>
                    ))}
                  </div>

                  {/* Gap message */}
                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm,
                    background: tNxt ? C.redLight : C.greenLight,
                    border: `1px solid ${tNxt ? "#FECACA" : "#86EFAC"}`,
                    fontSize: "12px", color: tNxt ? C.red : C.green }}>
                    {tNxt
                      ? <>Book <strong>{fmtL(tNxt.min - booked)} more</strong> to unlock {tNxt.reward}</>
                      : <strong>Top slab achieved — Thailand for 2!</strong>
                    }
                  </div>
                </div>

                {/* Current reward card */}
                <div style={{ background: C.card, borderRadius: C.radius, padding: "14px 16px",
                  marginTop: "8px", boxShadow: C.shadow, display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: C.redLight,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill={C.redLight} stroke={C.red} strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: C.muted, fontWeight: 600, textTransform: "uppercase",
                      letterSpacing: "0.05em" }}>Current Reward</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: C.red, marginTop: "2px" }}>
                      {tCur ? tCur.reward : "No slab yet"}
                    </div>
                    <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>
                      {tNxt ? `${fmtL(tNxt.min - booked)} more to upgrade to ${tNxt.reward}` : "Booking allowed till 10 Jul 2026"}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── VLI ── */}
            {showVLI && (
              <>
                <SectionHeader title="Health Payout Incentive (VLI)" subtitle="Apr 2026  |  Max 15%" />
                <div style={{ background: C.card, borderRadius: C.radius, padding: "16px",
                  boxShadow: C.shadow }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                    <StatTile label="VLI Premium" value={fmtL(vliPremium)} valueColor={C.red} />
                    <StatTile label="VLI %" value={vliPctDisplay} valueColor={C.green} />
                    <StatTile label="VLI Amount"
                      value={"Rs." + Math.round(parseFloat(vliAmount)).toLocaleString("en-IN")}
                      valueColor={C.red} />
                  </div>

                  <ProgressBar value={vliPremium} total={VLI_TOTAL} />

                  {/* VLI ticks */}
                  <div style={{ position: "relative", height: "18px", marginTop: "4px", marginBottom: "12px" }}>
                    {VLI_SLABS.map((s, i) => {
                      const pct = Math.min(96, (s.min / VLI_TOTAL) * 100);
                      const ach = vliPremium >= s.min;
                      return (
                        <div key={i} style={{ position: "absolute", left: pct + "%",
                          transform: "translateX(-50%)", fontSize: "9px", fontWeight: 600,
                          color: ach ? C.green : C.hint, whiteSpace: "nowrap" }}>
                          {s.pct}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm,
                    background: vNxt ? C.redLight : C.greenLight,
                    border: `1px solid ${vNxt ? "#FECACA" : "#86EFAC"}`,
                    fontSize: "12px", color: vNxt ? C.red : C.green }}>
                    {vNxt
                      ? <>Book <strong>{fmtL(vNxt.min - vliPremium)} more</strong> to unlock {vNxt.pct} extra payout</>
                      : <strong>Top VLI slab — earning 15% extra payout!</strong>
                    }
                  </div>
                </div>
              </>
            )}

            {/* ── COMING SOON ── */}
            <SectionHeader title="Coming Soon" />
            <div style={{ background: C.card, borderRadius: C.radius, padding: "14px 16px",
              boxShadow: C.shadow, opacity: 0.5 }}>
              <div style={{ display: "inline-block", background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: "20px", padding: "2px 10px", fontSize: "10px", fontWeight: 600,
                color: C.muted, marginBottom: "6px" }}>Coming Soon</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: C.muted }}>Next Contest</div>
              <div style={{ fontSize: "12px", color: C.hint, marginTop: "3px" }}>Stay tuned for the next contest</div>
            </div>

            {/* Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "16px" }}>
              {[
                { label: "Thailand Payment",  value: "1 Apr – 30 Jun 2026" },
                { label: "Thailand Booking",  value: "Till 10 Jul 2026"    },
                { label: "VLI Booking",       value: "1 Apr – 30 Apr 2026" },
                { label: "VLI Max Payout",    value: "15%"                 },
              ].map((d, i) => (
                <div key={i} style={{ background: C.card, borderRadius: C.radiusSm,
                  padding: "10px 12px", boxShadow: C.shadow }}>
                  <div style={{ fontSize: "10px", color: C.muted, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.05em" }}>{d.label}</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: C.text, marginTop: "4px" }}>{d.value}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${C.hint} !important; font-weight: 400 !important; }
      `}</style>
    </div>
  );
}
