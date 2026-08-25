import { useState, useRef, useEffect } from "react";
import { C } from './theme';
import { Analytics } from "./analytics";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwOEskh5U07L6SerB9E2JBs-CI16pnjDddz3ChMqk7oDmRPOkcHKyjT6zvtU353a-N2/exec";

/* ── VLI SLABS — JULY ───────────────────────────────────────── */
const VLI_SLABS = [
  { min: 20000,  amt: "20K",  pct: "4%"  },
  { min: 50000,  amt: "50K",  pct: "6%"  },
  { min: 75000,  amt: "75K",  pct: "7%"  },
  { min: 100000, amt: "1L",   pct: "8%"  },
  { min: 150000, amt: "1.5L", pct: "10%" },
  { min: 200000, amt: "2L",   pct: "12%" },
  { min: 300000, amt: "3L",   pct: "15%" },
];
const VLI_TOTAL = 300000;

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
  const [augustLeaderboard,    setAugustLeaderboard]    = useState([]);
  const [vliLeaderboard,       setVliLeaderboard]       = useState([]);
  const [goldLeaderboard,      setGoldLeaderboard]      = useState([]);
  const [multiyearLeaderboard, setMultiyearLeaderboard] = useState([]);
  const [showAugLb,     setShowAugLb]     = useState(false);
  const [showVliLb,     setShowVliLb]     = useState(false);
  const [showGoldLb,    setShowGoldLb]    = useState(false);
  const [showMultiyLb,  setShowMultiyLb]  = useState(false);
  const [expandedPast,   setExpandedPast]   = useState(null);
  const [expandedContest, setExpandedContest] = useState(null);
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
      if (cached.augustLeaderboard)    setAugustLeaderboard(cached.augustLeaderboard);
      if (cached.vliLeaderboard)       setVliLeaderboard(cached.vliLeaderboard);
      if (cached.goldLeaderboard)      setGoldLeaderboard(cached.goldLeaderboard);
      if (cached.multiyearLeaderboard) setMultiyearLeaderboard(cached.multiyearLeaderboard);
      if (cached.activeContests) setActiveContests(cached.activeContests);
      if (cached.pastContests)   setPastContests(cached.pastContests);
    } catch (e) {}

    setLbLoading(true);
    fetch(`${APPS_SCRIPT_URL}?action=init`)
      .then(r => r.json())
      .then(d => {
        if (d.augustLeaderboard)    setAugustLeaderboard(d.augustLeaderboard);
        if (d.vliLeaderboard)       setVliLeaderboard(d.vliLeaderboard);
        if (d.goldLeaderboard)      setGoldLeaderboard(d.goldLeaderboard);
        if (d.multiyearLeaderboard) setMultiyearLeaderboard(d.multiyearLeaderboard);
        if (d.contests) {
          setActiveContests(d.contests.active || []);
          setPastContests(d.contests.past || []);
        }
        try {
          localStorage.setItem("hpt_lb_cache", JSON.stringify({
            augustLeaderboard:    d.augustLeaderboard    || [],
            vliLeaderboard:       d.vliLeaderboard       || [],
            goldLeaderboard:      d.goldLeaderboard      || [],
            multiyearLeaderboard: d.multiyearLeaderboard || [],
            activeContests:       d.contests?.active     || [],
            pastContests:         d.contests?.past       || [],
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

  // August — Jeeto August (same slabs as July)
  const augustSourced = data ? parseRaw(data["august sourced"] || 0) : 0;
  const augustBooked  = data ? parseRaw(data["august booked"]  || 0) : 0;
  const { cur: aCur, nxt: aNxt } = getSlabInfo(augustBooked, SLABS);

  // Second NoP
  const secondNop = data ? Math.round(parseRaw(data["second nop"] || 0)) : 0;

  // July — VLI July (from Jeeto July Summary cols E, F, G)
  const vliPremJul = data ? parseRaw(data["vli premium jul"] || 0) : 0;
  const vliPctJul  = data ? parseRaw(data["vli % jul"]       || 0) : 0;
  const vliAmtJul  = data ? parseRaw(data["vli amount jul"]  || 0) : 0;
  const vliPctDisplay = vliPctJul > 0 ? (vliPctJul * 100).toFixed(0) + "%" : "0%";
  const { cur: vCur, nxt: vNxt } = getSlabInfo(vliPremJul, VLI_SLABS);

  // Online Policy Contest
  const onlineReward    = data ? parseRaw(data["online reward"] || 0) : 0;

  // Multi Year Dhamaka
  const multiyearReward = data ? parseRaw(data["multiyear reward"] || 0) : 0;
  const multiyearNop    = multiyearReward > 0 ? Math.round(multiyearReward / 2000) : 0;

  // July — Gold Jackpot
  const goldBooked  = data ? parseRaw(data["gold booked"]  || 0) : 0;
  const goldSourced = data ? parseRaw(data["gold sourced"] || 0) : 0;
  const GOLD_SLABS = [
    { min: 800000,  reward: "Gold Voucher Rs.65,000"  },
    { min: 1200000, reward: "Gold Voucher Rs.1,30,000" },
  ];
  const { cur: gCur, nxt: gNxt } = getSlabInfo(goldBooked, GOLD_SLABS);
  const GOLD_TOTAL = 1200000;


  return (
    <div style={{ fontFamily: C.font }}>

      {/* ── LEADERBOARD OVERLAYS ── */}
      {showAugLb && (
        <LeaderboardOverlay
          title="Jeeto August Leaderboard"
          subtitle="Top 10 · Net Booked Premium"
          entries={augustLeaderboard}
          loading={lbLoading}
          myGid={gidCode || gid}
          valueKey="value"
          valueLabel="Net Booked"
          formatValue={v => fmtL(v)}
          onClose={() => setShowAugLb(false)}
        />
      )}
      {showVliLb && (
        <LeaderboardOverlay
          title="VLI Leaderboard"
          subtitle="Top 10 · VLI Premium · Aug 2026"
          entries={vliLeaderboard}
          loading={lbLoading}
          myGid={gidCode || gid}
          valueKey="value"
          valueLabel="VLI Premium"
          formatValue={v => fmtL(v)}
          onClose={() => setShowVliLb(false)}
        />
      )}
      {showGoldLb && (
        <LeaderboardOverlay
          title="Gold Jackpot Leaderboard"
          subtitle="Top 10 · Net Booked Premium"
          entries={goldLeaderboard}
          loading={lbLoading}
          myGid={gidCode || gid}
          valueKey="value"
          valueLabel="Net Booked"
          formatValue={v => fmtL(v)}
          onClose={() => setShowGoldLb(false)}
        />
      )}
      {showMultiyLb && (
        <LeaderboardOverlay
          title="Multi Year Dhamaka Leaderboard"
          subtitle="Top 10 · Reward Earned"
          entries={multiyearLeaderboard}
          loading={lbLoading}
          myGid={gidCode || gid}
          valueKey="value"
          valueLabel="Reward"
          formatValue={v => "Rs." + Math.round(v).toLocaleString("en-IN")}
          onClose={() => setShowMultiyLb(false)}
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
            {/* ── ACTIVE CONTESTS HEADER ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px", marginBottom: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.green,
                boxShadow: "0 0 0 3px rgba(22,163,74,0.2)", flexShrink: 0 }} />
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.green,
                textTransform: "uppercase", letterSpacing: "0.08em" }}>Active Contests</div>
            </div>

            {/* ── ACCORDION HELPER ── */}
            {data && [{
              key: "jeeto-jul",
              title: "Jeeto July",
              period: "Jul 2026 · Booking till 10 Aug",
              badge: jeetoBooked > 0 ? (tCur ? tCur.reward : fmtL(jeetoBooked) + " booked") : "No bookings yet",
              badgeColor: tCur ? C.green : C.muted,
              content: (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px", marginBottom: "16px" }}>
                    <StatTile label="Net Booked Premium" value={fmtL(jeetoBooked)} valueColor={C.red} />
                    <StatTile label="Net Sourced Premium" value={fmtL(jeetoSourced)} valueColor={C.muted} />
                  </div>
                  <ProgressBar value={jeetoBooked} total={JEETO_TOTAL} />
                  <div style={{ position: "relative", height: "18px", marginTop: "4px", marginBottom: "12px" }}>
                    {SLABS.map((s, i) => {
                      const pct = Math.min(96, (s.min / JEETO_TOTAL) * 100);
                      const ach = jeetoBooked >= s.min;
                      return <div key={i} style={{ position: "absolute", left: pct + "%", transform: "translateX(-50%)", fontSize: "9px", fontWeight: 600, color: ach ? C.green : C.hint, whiteSpace: "nowrap" }}>{s.amt}</div>;
                    })}
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm, background: tNxt ? C.redLight : C.greenLight, border: `1px solid ${tNxt ? "#FECACA" : "#86EFAC"}`, fontSize: "12px", color: tNxt ? C.red : C.green }}>
                    {tCur ? tNxt ? <>Unlocked <strong>{tCur.reward}</strong> — Book <strong>{fmtL(tNxt.min - jeetoBooked)} more</strong> for {tNxt.reward}</> : <strong>Top slab — Thailand 1 Pax unlocked!</strong> : tNxt ? <>Book <strong>{fmtL(tNxt.min - jeetoBooked)} more</strong> to unlock <strong>{tNxt.reward}</strong></> : <strong>Start booking to win!</strong>}
                  </div>
                </div>
              )
            }, {
              key: "jeeto-aug",
              title: "Jeeto August",
              period: "Aug 2026 · Booking till 10 Sep",
              badge: augustBooked > 0 ? (aCur ? aCur.reward : fmtL(augustBooked) + " booked") : "No bookings yet",
              badgeColor: aCur ? C.green : C.muted,
              content: (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px", marginBottom: "16px" }}>
                    <StatTile label="Net Booked Premium" value={fmtL(augustBooked)} valueColor={C.red} />
                    <StatTile label="Net Sourced Premium" value={fmtL(augustSourced)} valueColor={C.muted} />
                  </div>
                  <ProgressBar value={augustBooked} total={JEETO_TOTAL} />
                  <div style={{ position: "relative", height: "18px", marginTop: "4px", marginBottom: "12px" }}>
                    {SLABS.map((s, i) => {
                      const pct = Math.min(96, (s.min / JEETO_TOTAL) * 100);
                      const ach = augustBooked >= s.min;
                      return <div key={i} style={{ position: "absolute", left: pct + "%", transform: "translateX(-50%)", fontSize: "9px", fontWeight: 600, color: ach ? C.green : C.hint, whiteSpace: "nowrap" }}>{s.amt}</div>;
                    })}
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm, background: aNxt ? C.redLight : C.greenLight, border: `1px solid ${aNxt ? "#FECACA" : "#86EFAC"}`, fontSize: "12px", color: aNxt ? C.red : C.green }}>
                    {aCur ? aNxt ? <>Unlocked <strong>{aCur.reward}</strong> — Book <strong>{fmtL(aNxt.min - augustBooked)} more</strong> for {aNxt.reward}</> : <strong>Top slab — Thailand 1 Pax unlocked!</strong> : aNxt ? <>Book <strong>{fmtL(aNxt.min - augustBooked)} more</strong> to unlock <strong>{aNxt.reward}</strong></> : <strong>Start booking to win!</strong>}
                  </div>
                  <div onClick={() => { setShowAugLb(true); Analytics.leaderboardOpen("Jeeto August"); }}
                    style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px",
                      background: C.bg, borderRadius: C.radiusSm, padding: "12px 14px",
                      cursor: "pointer", border: `1px solid ${C.border}`, WebkitTapHighlightColor: "transparent" }}>
                    <div style={{ width: "34px", height: "34px", background: C.greenLight, borderRadius: "8px",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>Jeeto August Leaderboard</div>
                      <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>Top 10 partners</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )
            }, {
              key: "second-nop",
              title: "Second Policy Contest",
              period: "Aug 2026 · Booking till 10 Sep",
              badge: secondNop >= 2 ? "Rs.800 Earned ✓" : secondNop === 1 ? "1/2 Policies" : "0 Policies",
              badgeColor: secondNop >= 2 ? C.green : secondNop === 1 ? "#F59E0B" : C.muted,
              content: (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Policies Done</div>
                      <div style={{ fontSize: "32px", fontWeight: 700, color: secondNop >= 2 ? C.green : C.red }}>{secondNop}<span style={{ fontSize: "14px", color: C.muted, fontWeight: 400, marginLeft: "4px" }}>/ 2</span></div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Reward</div>
                      <div style={{ fontSize: "24px", fontWeight: 700, color: secondNop >= 2 ? C.green : C.muted }}>{secondNop >= 2 ? "Rs.800" : "Rs.0"}</div>
                    </div>
                  </div>
                  <div style={{ position: "relative", marginBottom: "20px" }}>
                    <div style={{ position: "absolute", top: "16px", left: "16px", right: "16px", height: "4px", background: C.border, borderRadius: "99px", zIndex: 0 }}>
                      <div style={{ height: "100%", borderRadius: "99px", background: C.red, width: secondNop >= 2 ? "100%" : secondNop === 1 ? "50%" : "0%", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                      {[{count:0,label:"Start",reward:null},{count:1,label:"1 Policy",reward:null},{count:2,label:"2 Policies",reward:"Rs.800"}].map((m, i) => {
                        const achieved = secondNop >= m.count && m.count > 0;
                        const isCurrent = secondNop === m.count;
                        return (
                          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, height: "16px", color: achieved ? C.green : C.hint }}>{m.reward || ""}</div>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: achieved ? C.green : isCurrent && m.count === 0 ? C.bg : C.border, border: `2.5px solid ${achieved ? C.green : isCurrent ? C.red : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                              {achieved ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12L10 17L19 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isCurrent ? C.red : C.border }} />}
                            </div>
                            <div style={{ fontSize: "10px", fontWeight: 600, textAlign: "center", color: achieved ? C.green : isCurrent ? C.red : C.muted }}>{m.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm, background: secondNop >= 2 ? C.greenLight : C.redLight, border: `1px solid ${secondNop >= 2 ? "#86EFAC" : "#FECACA"}`, fontSize: "12px", color: secondNop >= 2 ? C.green : C.red }}>
                    {secondNop >= 2 ? <strong>Reward unlocked — Rs.800 earned!</strong> : secondNop === 1 ? <>1 more New policy needed to unlock <strong>Rs.800</strong></> : <>Book <strong>2 New policies</strong> (min Rs.15,000) to earn Rs.800</>}
                  </div>
                </div>
              )
            }, {
              key: "vli-aug",
              title: "Health Payout Incentive (VLI)",
              period: "Aug 2026 · Upto 15% extra",
              badge: vliPremJul > 0 ? (vCur ? vCur.pct + " extra" : fmtL(vliPremJul) + " premium") : "No premium yet",
              badgeColor: vCur ? C.green : C.muted,
              content: (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "14px", marginBottom: "16px" }}>
                    <StatTile label="VLI Premium" value={fmtL(vliPremJul)} valueColor={C.red} />
                    <StatTile label="VLI %" value={vliPctDisplay} valueColor={C.green} />
                    <StatTile label="VLI Amount" value={"Rs." + Math.round(vliAmtJul).toLocaleString("en-IN")} valueColor={C.red} />
                  </div>
                  <ProgressBar value={vliPremJul} total={VLI_TOTAL} />
                  <div style={{ position: "relative", height: "18px", marginTop: "4px", marginBottom: "12px" }}>
                    {VLI_SLABS.map((s, i) => {
                      const pct = Math.min(96, (s.min / VLI_TOTAL) * 100);
                      const ach = vliPremJul >= s.min;
                      return <div key={i} style={{ position: "absolute", left: pct + "%", transform: "translateX(-50%)", fontSize: "9px", fontWeight: 600, color: ach ? C.green : C.hint, whiteSpace: "nowrap" }}>{s.pct}</div>;
                    })}
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm, background: vNxt ? C.redLight : C.greenLight, border: `1px solid ${vNxt ? "#FECACA" : "#86EFAC"}`, fontSize: "12px", color: vNxt ? C.red : C.green }}>
                    {vNxt ? <>Book <strong>{fmtL(vNxt.min - vliPremJul)} more</strong> to unlock {vNxt.pct} extra payout</> : <strong>Top VLI slab — earning 15% extra payout!</strong>}
                  </div>
                  <div onClick={() => { setShowVliLb(true); Analytics.leaderboardOpen("VLI"); }}
                    style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px",
                      background: C.bg, borderRadius: C.radiusSm, padding: "12px 14px",
                      cursor: "pointer", border: `1px solid ${C.border}`, WebkitTapHighlightColor: "transparent" }}>
                    <div style={{ width: "34px", height: "34px", background: C.greenLight, borderRadius: "8px",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>VLI Leaderboard</div>
                      <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>Top 10 partners</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )
            }, {
              key: "gold",
              title: "Gold Jackpot",
              period: "Jul–Sep 2026 · Booking till 10 Oct",
              badge: gCur ? gCur.reward : goldBooked > 0 ? fmtL(goldBooked) + " booked" : "No bookings yet",
              badgeColor: gCur ? "#B8860B" : C.muted,
              content: (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px", marginBottom: "16px" }}>
                    <StatTile label="Net Booked Premium" value={fmtL(goldBooked)} valueColor={C.red} />
                    <StatTile label="Net Sourced Premium" value={fmtL(goldSourced)} valueColor={C.muted} />
                  </div>
                  <div style={{ height: "8px", background: "#E8ECF4", borderRadius: "99px", overflow: "hidden", marginBottom: "4px" }}>
                    <div style={{ height: "100%", borderRadius: "99px", background: "#B8860B", width: Math.min(100, (goldBooked / GOLD_TOTAL) * 100) + "%", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px", marginBottom: "12px" }}>
                    {[{slab:"8L",reward:"Rs.65,000",min:800000},{slab:"12L",reward:"Rs.1,30,000",min:1200000}].map((s, i) => {
                      const ach = goldBooked >= s.min;
                      return (
                        <div key={i} style={{ background: ach ? "#FEF3C7" : C.bg, border: `1px solid ${ach ? "#FCD34D" : C.border}`, borderRadius: C.radiusSm, padding: "10px 12px" }}>
                          <div style={{ fontSize: "10px", color: C.muted, fontWeight: 600, textTransform: "uppercase" }}>₹{s.slab} slab</div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: ach ? "#B8860B" : C.text, marginTop: "2px" }}>{s.reward}</div>
                          {ach && <div style={{ fontSize: "10px", color: "#B8860B", fontWeight: 600, marginTop: "4px" }}>✓ Unlocked</div>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm, background: gNxt ? "#FEF3C7" : "#D4AF3720", border: `1px solid ${gNxt ? "#FCD34D" : "#B8860B"}`, fontSize: "12px", color: gNxt ? "#92400E" : "#B8860B" }}>
                    {gCur ? gNxt ? <>Unlocked <strong>{gCur.reward}</strong> — Book <strong>{fmtL(gNxt.min - goldBooked)} more</strong> to upgrade</> : <strong>🥇 Top slab — {gCur.reward}!</strong> : gNxt ? <>Book <strong>{fmtL(gNxt.min - goldBooked)} more</strong> to unlock <strong>{gNxt.reward}</strong></> : <strong>Start booking to win Gold!</strong>}
                  </div>
                  <div onClick={() => { setShowGoldLb(true); Analytics.leaderboardOpen("Gold Jackpot"); }}
                    style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px",
                      background: C.bg, borderRadius: C.radiusSm, padding: "12px 14px",
                      cursor: "pointer", border: `1px solid ${C.border}`, WebkitTapHighlightColor: "transparent" }}>
                    <div style={{ width: "34px", height: "34px", background: C.greenLight, borderRadius: "8px",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>Gold Jackpot Leaderboard</div>
                      <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>Top 10 partners</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )
            }, {
              key: "multiyear",
              title: "Multi Year Dhamaka",
              period: "6 Aug–31 Aug · Rs.2,000 per 3yr policy",
              badge: multiyearReward > 0 ? "Rs." + Math.round(multiyearReward).toLocaleString("en-IN") + " earned" : "No policies yet",
              badgeColor: multiyearReward > 0 ? C.green : C.muted,
              content: (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px", marginBottom: "16px" }}>
                    <StatTile label="Policies Done" value={multiyearNop} valueColor={C.red} />
                    <StatTile label="Reward Earned" value={"Rs." + Math.round(multiyearReward).toLocaleString("en-IN")} valueColor={C.green} />
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm, background: multiyearReward > 0 ? C.greenLight : C.redLight, border: `1px solid ${multiyearReward > 0 ? "#86EFAC" : "#FECACA"}`, fontSize: "12px", color: multiyearReward > 0 ? C.green : C.red }}>
                    {multiyearReward > 0 ? <><strong>Rs.{Math.round(multiyearReward).toLocaleString("en-IN")} earned</strong> from {multiyearNop} 3-year {multiyearNop === 1 ? "policy" : "policies"}</> : <>Book <strong>3-year New policies</strong> (SI ≥ 10L, premium ≥ Rs.30,000) to earn Rs.2,000 each</>}
                  </div>
                  <div style={{ marginTop: "10px", fontSize: "10px", color: C.hint, lineHeight: 1.5 }}>Only 3-year New policies. SI ≥ 10L. Total premium ≥ Rs.30,000. Booking: 6 Aug–10 Sep.</div>
                  <div onClick={() => { setShowMultiyLb(true); Analytics.leaderboardOpen("Multi Year Dhamaka"); }}
                    style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px",
                      background: C.bg, borderRadius: C.radiusSm, padding: "12px 14px",
                      cursor: "pointer", border: `1px solid ${C.border}`, WebkitTapHighlightColor: "transparent" }}>
                    <div style={{ width: "34px", height: "34px", background: C.greenLight, borderRadius: "8px",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>Multi Year Leaderboard</div>
                      <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>Top 10 partners</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )
            }, {
              key: "online",
              title: "Online Health Booking Contest",
              period: "Aug 2026 · Rs.500 per online policy",
              badge: onlineReward > 0 ? "Rs." + Math.round(onlineReward).toLocaleString("en-IN") + " earned" : "No bookings yet",
              badgeColor: onlineReward > 0 ? C.green : C.muted,
              content: (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginTop: "14px", marginBottom: "16px" }}>
                    <StatTile label="Reward Earned" value={"Rs." + Math.round(onlineReward).toLocaleString("en-IN")} valueColor={C.green} />
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm, background: onlineReward > 0 ? C.greenLight : C.redLight, border: `1px solid ${onlineReward > 0 ? "#86EFAC" : "#FECACA"}`, fontSize: "12px", color: onlineReward > 0 ? C.green : C.red }}>
                    {onlineReward > 0 ? <><strong>Rs.{Math.round(onlineReward).toLocaleString("en-IN")} earned</strong> via PoS/IDEdge</> : <>Book health policies via <strong>PoS/IDEdge</strong> to earn Rs.500 per online policy</>}
                  </div>
                  <div style={{ marginTop: "10px", fontSize: "10px", color: C.hint, lineHeight: 1.5 }}>Only New + Port via PoS/IDEdge. Min Rs.15,000. PA and 0% excluded. Max Rs.500.</div>
                </div>
              )
            }].map(contest => {
              const isExpanded = expandedContest === contest.key;
              return (
                <div key={contest.key} style={{ background: C.card, borderRadius: C.radius, boxShadow: C.shadow, marginBottom: "8px", overflow: "hidden" }}>
                  <div onClick={() => setExpandedContest(isExpanded ? null : contest.key)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>{contest.title}</div>
                      <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>{contest.period}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: contest.badgeColor,
                        background: contest.badgeColor === C.green ? C.greenLight : contest.badgeColor === "#B8860B" ? "#FEF3C7" : "#F3F4F6",
                        padding: "3px 8px", borderRadius: "99px", whiteSpace: "nowrap" }}>
                        {contest.badge}
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                        <path d="M6 9L12 15L18 9" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {isExpanded && contest.content}
                </div>
              );
            })}

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
