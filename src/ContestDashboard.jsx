import { useState, useRef, useEffect } from "react";
import { C } from './theme';
import { Analytics } from "./analytics";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwMvAhAkTki6mrfoHNBFie-fD2k9k2riLSPE4dKd83ljW9icN3YX2wIHxqFijtaOmxZ/exec";

/* ── SLABS — JEETO JULY ──────────────────────────────────────── */
const SLABS = [
  { min: 75000,   amt: "75K",  reward: "Rs.1K Cash"    },
  { min: 100000,  amt: "1L",   reward: "Rs.4K Cash"    },
  { min: 200000,  amt: "2L",   reward: "Rs.15K Cash"   },
  { min: 300000,  amt: "3L",   reward: "Goa 1 Pax"     },
  { min: 450000,  amt: "4.5L", reward: "Thailand 1 Pax"},
];
const JEETO_TOTAL = 450000;



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
// Always show in lakhs with exactly 2 decimal places — for leaderboard
function fmtLakhFixed(n) {
  return (n / 100000).toFixed(2) + "L";
}
function getSlabReward(bookedLakhs) {
  const n = bookedLakhs * 100000;
  if (n >= 450000) return "Thailand 1 Pax";
  if (n >= 300000) return "Goa 1 Pax";
  if (n >= 200000) return "Rs.15K Cash";
  if (n >= 100000) return "Rs.4K Cash";
  if (n >= 75000)  return "Rs.1K Cash";
  return null;
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

/* ── LEADERBOARD OVERLAY ─────────────────────────────────────── */
function LeaderboardOverlay({ title, subtitle, entries, loading, myGid, onClose,
  valueKey="booked", valueLabel="Net Booked", formatValue, extraKey, extraLabel, formatExtra }) {
  const top = entries[0]?.[valueKey] || 1;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: C.bg,
      fontFamily: C.font, display: "flex", flexDirection: "column",
      maxWidth: "480px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: C.card, padding: "16px 16px 14px",
        borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={onClose}
            style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "50%",
              width: "32px", height: "32px", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
              WebkitTapHighlightColor: "transparent" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M11 6L5 12L11 18" stroke={C.text} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>{title}</div>
            <div style={{ fontSize: "11px", color: C.muted, marginTop: "1px" }}>{subtitle}</div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      {!loading && entries.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px",
          padding: "8px 16px", background: C.card,
          borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ width: "26px", flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: "10px", fontWeight: 600, color: C.muted,
            textTransform: "uppercase", letterSpacing: "0.05em" }}>GID</div>
          {extraKey && (
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.muted,
              textTransform: "uppercase", letterSpacing: "0.05em", minWidth: "60px",
              textAlign: "right" }}>{extraLabel}</div>
          )}
          <div style={{ fontSize: "10px", fontWeight: 600, color: C.muted,
            textTransform: "uppercase", letterSpacing: "0.05em", minWidth: "60px",
            textAlign: "right" }}>{valueLabel}</div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{ height: "52px", background: C.card, borderRadius: C.radiusSm,
                animation: "pulse 1.2s ease infinite" }} />
            ))}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px",
            fontSize: "13px", color: C.muted }}>
            No data available yet
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {entries.map((entry, i) => {
              const isMe = myGid && entry.gid === myGid.toUpperCase().trim();
              const val  = entry[valueKey] || 0;
              const barPct = Math.min(100, (val / top) * 100);
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={entry.gid} style={{
                  background: isMe ? C.redLight : C.card,
                  border: `1px solid ${isMe ? "#FECACA" : C.border}`,
                  borderRadius: C.radiusSm, padding: "10px 12px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    {/* Rank */}
                    <div style={{ width: "26px", textAlign: "center", flexShrink: 0 }}>
                      {i < 3
                        ? <span style={{ fontSize: "18px" }}>{medals[i]}</span>
                        : <span style={{ fontSize: "12px", fontWeight: 700,
                            color: isMe ? C.red : C.muted }}>#{i + 1}</span>
                      }
                    </div>
                    {/* GID */}
                    <div style={{ flex: 1, fontSize: "13px", fontWeight: isMe ? 700 : 600,
                      color: isMe ? C.red : C.text }}>
                      {entry.gid}
                      {isMe && (
                        <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: 700,
                          background: C.red, color: "#fff", borderRadius: "4px",
                          padding: "2px 5px" }}>You</span>
                      )}
                    </div>
                    {/* Reward slab badge */}
                    {valueKey === "booked" && (() => {
                      const reward = getSlabReward(val);
                      if (!reward) return null;
                      const isTrip = reward.includes("Thailand") || reward.includes("Goa");
                      return (
                        <span style={{ fontSize: "9px", fontWeight: 700,
                          background: isTrip ? "#FEF3C7" : C.greenLight,
                          color: isTrip ? "#92400E" : C.green,
                          border: `1px solid ${isTrip ? "#FCD34D" : "#86EFAC"}`,
                          borderRadius: "99px", padding: "2px 7px", flexShrink: 0 }}>
                          {reward}
                        </span>
                      );
                    })()}
                    {/* Extra column (e.g. VLI Amount) */}
                    {extraKey && (
                      <div style={{ fontSize: "12px", fontWeight: 600, color: C.muted,
                        minWidth: "60px", textAlign: "right" }}>
                        {formatExtra(entry[extraKey] || 0)}
                      </div>
                    )}
                    {/* Primary value — use lakh format */}
                    <div style={{ fontSize: "13px", fontWeight: 700,
                      color: isMe ? C.red : C.text, minWidth: "52px", textAlign: "right" }}>
                      {valueKey === "booked"
                        ? fmtLakhFixed(val * 100000)
                        : formatValue(val)}
                    </div>
                  </div>
                  {/* Bar */}
                  <div style={{ height: "4px", background: C.border, borderRadius: "99px",
                    overflow: "hidden", marginLeft: "36px" }}>
                    <div style={{ height: "100%", background: isMe ? C.red : C.blue,
                      borderRadius: "99px", width: barPct + "%",
                      transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: "10px", color: C.hint,
          marginTop: "16px", paddingBottom: "8px" }}>
          Updates daily · {valueLabel}
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ────────────────────────────────────────────────────── */
export default function ContestDashboard() {
  const [gid,            setGid]            = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [data,           setData]           = useState(null);
  const [cachedGid,      setCachedGid]      = useState("");
  const [leaderboard,    setLeaderboard]    = useState([]);
  const [lbLoading,      setLbLoading]      = useState(false);
  const [vliLeaderboard, setVliLeaderboard] = useState([]);
  const [showLb,         setShowLb]         = useState(false);
  const [showVliLb,      setShowVliLb]      = useState(false);
  const [expandedPast,   setExpandedPast]   = useState(null);
  const [activeContests, setActiveContests] = useState([]);
  const [pastContests,   setPastContests]   = useState([]); // "vli" | "second" | null
  const inputRef = useRef(null);

  /* ── LOAD CACHED GID ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hpt_last_gid");
      if (saved) { setGid(saved); setCachedGid(saved); }
    } catch (e) {}
  }, []);

  /* ── FETCH LEADERBOARDS + CONTESTS CONFIG ── */
  useEffect(() => {
    // Load cached data instantly
    try {
      const cached = JSON.parse(localStorage.getItem("hpt_lb_cache") || "{}");
      if (cached.leaderboard)    setLeaderboard(cached.leaderboard);
      if (cached.vliLeaderboard) setVliLeaderboard(cached.vliLeaderboard);
      if (cached.activeContests) setActiveContests(cached.activeContests);
      if (cached.pastContests)   setPastContests(cached.pastContests);
    } catch (e) {}

    setLbLoading(true);
    fetch(`${APPS_SCRIPT_URL}?action=init`)
      .then(r => r.json())
      .then(d => {
        if (d.leaderboard)    setLeaderboard(d.leaderboard);
        if (d.vliLeaderboard) setVliLeaderboard(d.vliLeaderboard);
        if (d.contests) {
          setActiveContests(d.contests.active || []);
          setPastContests(d.contests.past || []);
        }
        try {
          localStorage.setItem("hpt_lb_cache", JSON.stringify({
            leaderboard:    d.leaderboard    || [],
            vliLeaderboard: d.vliLeaderboard || [],
            activeContests: d.contests?.active || [],
            pastContests:   d.contests?.past   || [],
          }));
        } catch (e) {}
      })
      .catch(() => {})
      .finally(() => setLbLoading(false));
  }, []);

  async function lookup() {
    const q = gid.trim().toUpperCase();
    if (!q) { setError("Please enter your GID or GCD code."); return; }
    setLoading(true); setError(""); setData(null);
    Analytics.gidLookup(q);
    try {
      const resp = await fetch(`${APPS_SCRIPT_URL}?gid=${encodeURIComponent(q)}`);
      if (!resp.ok) throw new Error("network");
      const json = await resp.json();
      if (json.error) {
        setError(`"${q}" not found in contest data. Check your GID code or contact your manager.`);
        setLoading(false); return;
      }
      try { localStorage.setItem("hpt_last_gid", q); setCachedGid(q); } catch (e) {}
      setData(json);
    } catch (e) {
      setError("Network error — check your connection and try again.");
    }
    setLoading(false);
  }

  function clearGid() {
    setGid(""); setData(null); setError(""); setCachedGid("");
    try { localStorage.removeItem("hpt_last_gid"); } catch (e) {}
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const sourced   = data ? parseLakh(data["net sourced premium"] || 0) : 0;
  const booked    = data ? parseLakh(data["net booked premium"]  || 0) : 0;
  const offer     = data ? (data["offer"] || "") : "";
  const gidCode   = data ? (data["gid"] || gid.toUpperCase()) : "";

  // July — Jeeto July
  const jeetoSourced = data ? parseRaw(data["jeeto sourced"] || 0) : 0;
  const jeetoBooked  = data ? parseRaw(data["jeeto booked"]  || 0) : 0;
  const { cur: tCur, nxt: tNxt } = getSlabInfo(jeetoBooked, SLABS);
  const showJeeto = data !== null;

  // July — Gold Jackpot
  const goldBooked  = data ? parseRaw(data["gold booked"]  || 0) : 0;
  const goldSourced = data ? parseRaw(data["gold sourced"] || 0) : 0;
  const GOLD_SLABS = [
    { min: 800000,  reward: "Gold Voucher Rs.65,000 (~5g Gold)"  },
    { min: 1200000, reward: "Gold Voucher Rs.1,30,000 (~10g Gold)" },
  ];
  const { cur: gCur, nxt: gNxt } = getSlabInfo(goldBooked, GOLD_SLABS);
  const GOLD_TOTAL = 1200000;


  return (
    <div style={{ fontFamily: C.font }}>

      {/* ── JEETO JULY LEADERBOARD OVERLAY ── */}
      {showLb && (
        <LeaderboardOverlay
          title="Jeeto July"
          subtitle="Top 10 · Net Booked Premium"
          entries={leaderboard}
          loading={lbLoading}
          myGid={gidCode || gid}
          valueKey="booked"
          valueLabel="Net Booked Premium"
          formatValue={v => fmtL(v * 100000)}
          onClose={() => setShowLb(false)}
        />
      )}

      {/* PAGE HEADER */}
      <div style={{ background: C.card, padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>Contest Achievement</div>
        <div style={{ fontSize: "13px", color: C.muted, marginTop: "2px" }}>Enter your GID to view live progress</div>
      </div>

      <div style={{ padding: "16px" }}>

        {/* GID SEARCH */}
        <div style={{ background: C.card, borderRadius: C.radius, padding: "16px",
          boxShadow: C.shadow, marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: C.muted,
              textTransform: "uppercase", letterSpacing: "0.05em" }}>GID / GCD Code</div>
            {cachedGid && !data && (
              <div style={{ fontSize: "11px", color: C.blue, cursor: "pointer" }}
                onClick={() => { setGid(cachedGid); }}>
                Use last: {cachedGid}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input ref={inputRef} value={gid}
              onChange={e => setGid(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && lookup()}
              placeholder="e.g. GID173676"
              style={{ flex: 1, padding: "12px 14px", borderRadius: C.radiusSm,
                border: `1.5px solid ${error ? C.red : C.border}`, background: C.bg,
                fontSize: "15px", color: C.text, fontWeight: 600, outline: "none",
                letterSpacing: "1px", fontFamily: C.font }}/>
            <button onClick={lookup}
              style={{ background: C.red, border: "none", borderRadius: C.radiusSm,
                color: "#fff", fontFamily: C.font, fontWeight: 600, fontSize: "14px",
                padding: "12px 20px", cursor: "pointer", whiteSpace: "nowrap",
                opacity: loading ? 0.7 : 1 }}>
              {loading ? "..." : "Check"}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: "10px", padding: "10px 12px", background: C.redLight,
              borderRadius: C.radiusXs, fontSize: "12px", color: C.red, lineHeight: 1.5 }}>
              {error}
            </div>
          )}
          {/* Show change option when data is loaded */}
          {data && (
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center",
              justifyContent: "space-between" }}>
              <div style={{ fontSize: "12px", color: C.muted }}>
                Viewing <strong style={{ color: C.text }}>{gid}</strong>
              </div>
              <div onClick={clearGid}
                style={{ fontSize: "12px", color: C.blue, cursor: "pointer", fontWeight: 600 }}>
                Change
              </div>
            </div>
          )}
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div style={{ marginTop: "12px" }}>
            {[80, 60, 90].map((w, i) => (
              <div key={i} style={{ background: C.card, borderRadius: C.radius,
                padding: "16px", marginBottom: "8px", boxShadow: C.shadow }}>
                <div style={{ height: "12px", width: w + "%", background: C.border,
                  borderRadius: "4px", marginBottom: "10px", animation: "pulse 1.2s ease infinite" }} />
                <div style={{ height: "8px", width: "50%", background: C.border,
                  borderRadius: "4px", animation: "pulse 1.2s ease infinite" }} />
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE — data loaded but no contest activity yet */}
        {data && !loading && !showJeeto && (
          <div style={{ background: C.card, borderRadius: C.radius, padding: "32px 20px",
            marginTop: "12px", boxShadow: C.shadow, textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: C.redLight,
              margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill={C.redLight} stroke={C.red} strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>
              Start your journey
            </div>
            <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.6, marginBottom: "16px" }}>
              No contest activity recorded yet for {gid}. Book your first policy to start tracking milestones.
            </div>
            <div style={{ background: C.bg, borderRadius: C.radiusSm, padding: "12px",
              fontSize: "12px", color: C.muted, lineHeight: 1.5 }}>
              Data refreshes daily at 6 AM. Recent bookings may take up to 24 hours to appear.
            </div>
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

            {/* ── ACTIVE CONTESTS HEADER ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px", marginBottom: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.green,
                boxShadow: "0 0 0 3px rgba(22,163,74,0.2)", flexShrink: 0 }} />
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.green,
                textTransform: "uppercase", letterSpacing: "0.08em" }}>Active Contest</div>
            </div>

            {/* ── JEETO JULY ── */}
            {showJeeto && (
              <>
                <SectionHeader title="Jeeto July" subtitle="Jul 2026  |  Booking till 10 Aug" />
                <div style={{ background: C.card, borderRadius: C.radius, padding: "16px",
                  boxShadow: C.shadow, marginBottom: "4px" }}>

                  {/* Numbers */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                    <StatTile label="Net Booked Premium"  value={fmtL(jeetoBooked)}  valueColor={C.red} />
                    <StatTile label="Net Sourced Premium" value={fmtL(jeetoSourced)} valueColor={C.muted} />
                  </div>

                  {/* Bar */}
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ position: "relative", marginBottom: "4px" }}>
                      {/* Sourced underlay */}
                      <div style={{ height: "8px", background: "#E8ECF4", borderRadius: "99px", overflow: "hidden", position: "relative" }}>
                        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0,
                          width: Math.min(100,(sourced/JEETO_TOTAL)*100) + "%",
                          background: "#FCA5A5", borderRadius: "99px",
                          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0,
                          width: Math.min(100,(booked/JEETO_TOTAL)*100) + "%",
                          background: C.red, borderRadius: "99px",
                          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                      </div>
                    </div>
                    {/* Amount ticks */}
                    <div style={{ position: "relative", height: "18px" }}>
                      {SLABS.map((s, i) => {
                        const pct = Math.min(96, (s.min / JEETO_TOTAL) * 100);
                        const ach = jeetoBooked >= s.min;
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
                      const bAch = jeetoBooked >= s.min;
                      const sAch = jeetoSourced >= s.min;
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
                      ? <>Book <strong>{fmtL(tNxt.min - jeetoBooked)} more</strong> to unlock {tNxt.reward}</>
                      : <strong>Top slab — Thailand 1 Pax unlocked!</strong>
                    }
                  </div>

                  {/* Leaderboard tile */}
                  <div onClick={() => { setShowLb(true); Analytics.leaderboardOpen("Jeeto July"); }}
                    style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px",
                      background: C.bg, borderRadius: C.radiusSm, padding: "12px 14px",
                      cursor: "pointer", border: `1px solid ${C.border}`,
                      WebkitTapHighlightColor: "transparent" }}>
                    <div style={{ width: "34px", height: "34px", background: C.redLight,
                      borderRadius: "8px", display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke={C.red} strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>Jeeto July Leaderboard</div>
                      <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>Top 10 partners by Net Booked</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke={C.muted} strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
                      {tNxt ? `${fmtL(tNxt.min - jeetoBooked)} more to upgrade to ${tNxt.reward}` : "Booking allowed till 10 Aug 2026"}
                    </div>
                  </div>
                </div>
              </>
            )}


            {/* ── GOLD JACKPOT ── */}
            {data && (
              <>
                <SectionHeader title="Gold Jackpot" subtitle="Jul – Sep 2026  |  Booking till 10 Oct 2026" />
                <div style={{ background: C.card, borderRadius: C.radius, padding: "16px",
                  boxShadow: C.shadow, marginBottom: "4px" }}>

                  {/* Numbers */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                    <StatTile label="Net Booked Premium"  value={fmtL(goldBooked)}  valueColor={C.red} />
                    <StatTile label="Net Sourced Premium" value={fmtL(goldSourced)} valueColor={C.muted} />
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ height: "8px", background: "#E8ECF4", borderRadius: "99px", overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0,
                        width: Math.min(100, (goldBooked / GOLD_TOTAL) * 100) + "%",
                        background: "#B8860B", borderRadius: "99px",
                        transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                    </div>
                    {/* Slab ticks */}
                    <div style={{ position: "relative", height: "18px", marginTop: "4px", marginBottom: "4px" }}>
                      {GOLD_SLABS.map((s, i) => {
                        const pct = Math.min(96, (s.min / GOLD_TOTAL) * 100);
                        const ach = goldBooked >= s.min;
                        return (
                          <div key={i} style={{ position: "absolute", left: pct + "%",
                            transform: "translateX(-50%)", fontSize: "9px", fontWeight: 600,
                            color: ach ? "#B8860B" : C.hint, whiteSpace: "nowrap" }}>
                            {s.min >= 1000000 ? (s.min/100000).toFixed(0)+"L" : (s.min/100000).toFixed(0)+"L"}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status message */}
                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm,
                    background: gNxt ? "#FEF3C7" : "#D4AF3720",
                    border: `1px solid ${gNxt ? "#FCD34D" : "#B8860B"}`,
                    fontSize: "12px", color: gNxt ? "#92400E" : "#B8860B" }}>
                    {gCur
                      ? gNxt
                        ? <>Unlocked <strong>{gCur.reward}</strong> — Book <strong>{fmtL(gNxt.min - goldBooked)} more</strong> to upgrade to {gNxt.reward}</>
                        : <strong>🥇 Top slab achieved — {gCur.reward}!</strong>
                      : gNxt
                        ? <>Book <strong>{fmtL(gNxt.min - goldBooked)} more</strong> to unlock <strong>{gNxt.reward}</strong></>
                        : <strong>Start booking to win Gold!</strong>
                    }
                  </div>

                  {/* Slab cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                    {[
                      { slab: "8L", reward: "Rs.65,000", sub: "~5g Gold",   min: 800000  },
                      { slab: "12L", reward: "Rs.1,30,000", sub: "~10g Gold", min: 1200000 },
                    ].map((s, i) => {
                      const ach = goldBooked >= s.min;
                      return (
                        <div key={i} style={{ background: ach ? "#FEF3C7" : C.bg,
                          border: `1px solid ${ach ? "#FCD34D" : C.border}`,
                          borderRadius: C.radiusSm, padding: "10px 12px" }}>
                          <div style={{ fontSize: "10px", color: C.muted, fontWeight: 600,
                            textTransform: "uppercase", letterSpacing: "0.05em" }}>₹{s.slab} slab</div>
                          <div style={{ fontSize: "14px", fontWeight: 700,
                            color: ach ? "#B8860B" : C.text, marginTop: "2px" }}>{s.reward}</div>
                          <div style={{ fontSize: "10px", color: C.muted, marginTop: "2px" }}>{s.sub}</div>
                          {ach && <div style={{ fontSize: "10px", color: "#B8860B", fontWeight: 600, marginTop: "4px" }}>✓ Unlocked</div>}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: "10px", fontSize: "10px", color: C.hint, lineHeight: 1.5 }}>
                    New Business carries 100% weightage. Port carries 50% weightage.
                    Only policies with SI ≥ 10L considered.
                  </div>
                </div>
              </>
            )}

            {/* Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "20px" }}>
              {[
                { label: "Jeeto July Period", value: "1 Jul – 31 Jul 2026" },
                { label: "Booking Allowed Till", value: "10 Aug 2026"    },
              ].map((d, i) => (
                <div key={i} style={{ background: C.card, borderRadius: C.radiusSm, padding: "10px 12px", boxShadow: C.shadow }}>
                  <div style={{ fontSize: "10px", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{d.label}</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: C.text, marginTop: "4px" }}>{d.value}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input::placeholder { color: ${C.hint} !important; font-weight: 400 !important; }
      `}</style>
    </div>
  );
}
