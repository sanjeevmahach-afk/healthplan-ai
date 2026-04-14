import { useState, useRef, useEffect } from "react";
import { C } from './theme';

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
                    {/* Extra column (e.g. VLI Amount) */}
                    {extraKey && (
                      <div style={{ fontSize: "12px", fontWeight: 600, color: C.muted,
                        minWidth: "60px", textAlign: "right" }}>
                        {formatExtra(entry[extraKey] || 0)}
                      </div>
                    )}
                    {/* Primary value */}
                    <div style={{ fontSize: "13px", fontWeight: 700,
                      color: isMe ? C.red : C.text, minWidth: "60px", textAlign: "right" }}>
                      {formatValue(val)}
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
  const [vliLbLoading,   setVliLbLoading]   = useState(false);
  const [showLb,         setShowLb]         = useState(false);   // Thailand LB overlay
  const [showVliLb,      setShowVliLb]      = useState(false);   // VLI LB overlay
  const inputRef = useRef(null);

  /* ── LOAD CACHED GID ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hpt_last_gid");
      if (saved) { setGid(saved); setCachedGid(saved); }
    } catch (e) {}
  }, []);

  /* ── FETCH LEADERBOARDS ── */
  useEffect(() => {
    setLbLoading(true);
    fetch(`${APPS_SCRIPT_URL}?action=leaderboard`)
      .then(r => r.json())
      .then(d => { if (d.leaderboard) setLeaderboard(d.leaderboard); })
      .catch(() => {})
      .finally(() => setLbLoading(false));

    setVliLbLoading(true);
    fetch(`${APPS_SCRIPT_URL}?action=vli_leaderboard`)
      .then(r => r.json())
      .then(d => { if (d.leaderboard) setVliLeaderboard(d.leaderboard); })
      .catch(() => {})
      .finally(() => setVliLbLoading(false));
  }, []);

  async function lookup() {
    const q = gid.trim().toUpperCase();
    if (!q) { setError("Please enter your GID or GCD code."); return; }
    setLoading(true); setError(""); setData(null);
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
  const { cur: tCur, nxt: tNxt } = getSlabInfo(booked, SLABS);

  const vliPremium    = data ? parseRaw(data["vli premium"] || 0) : 0;
  const vliPctRaw     = data ? parseRaw(data["vli %"] || 0) : 0;
  const vliAmount     = data ? parseRaw(data["vli amount"] || 0) : 0;
  const vliPctDisplay = vliPctRaw > 0 ? (vliPctRaw * 100).toFixed(0) + "%" : "0%";
  const { cur: vCur, nxt: vNxt } = getSlabInfo(vliPremium, VLI_SLABS);

  const secondNop  = data ? Math.round(parseRaw(data["second nop"] || 0)) : 0;
  const showSecond = data !== null;

  const showThailand = booked > 0 || sourced > 0;
  const showVLI      = vliPremium > 0;

  return (
    <div style={{ fontFamily: C.font }}>

      {/* ── THAILAND LEADERBOARD OVERLAY ── */}
      {showLb && (
        <LeaderboardOverlay
          title="Thailand Chalo"
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

      {/* ── VLI LEADERBOARD OVERLAY ── */}
      {showVliLb && (
        <LeaderboardOverlay
          title="Health Payout Incentive (VLI)"
          subtitle="Top 10 · VLI Premium · Apr 2026"
          entries={vliLeaderboard}
          loading={vliLbLoading}
          myGid={gidCode || gid}
          valueKey="vliPremium"
          valueLabel="VLI Premium"
          formatValue={v => fmtL(v)}
          extraKey="vliAmount"
          extraLabel="VLI Amount"
          formatExtra={v => "Rs." + Math.round(v).toLocaleString("en-IN")}
          onClose={() => setShowVliLb(false)}
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
        {data && !loading && !showThailand && !showVLI && (
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

                  {/* Leaderboard tile */}
                  <div onClick={() => setShowLb(true)}
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
                      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>Thailand Chalo Leaderboard</div>
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

                  {/* VLI Leaderboard tile */}
                  <div onClick={() => setShowVliLb(true)}
                    style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px",
                      background: C.bg, borderRadius: C.radiusSm, padding: "12px 14px",
                      cursor: "pointer", border: `1px solid ${C.border}`,
                      WebkitTapHighlightColor: "transparent" }}>
                    <div style={{ width: "34px", height: "34px", background: C.greenLight,
                      borderRadius: "8px", display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke={C.green} strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>VLI Leaderboard</div>
                      <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>Top 10 partners by VLI Premium</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke={C.muted} strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </>
            )}

            {/* ── SECOND POLICY CONTEST ── */}
            {showSecond && (
              <>
                <SectionHeader title="Second Policy Contest" subtitle="9 Apr – 30 Apr 2026  |  Rs.800 on 2nd Policy" />
                <div style={{ background: C.card, borderRadius: C.radius, padding: "16px",
                  boxShadow: C.shadow }}>

                  {/* Policy count display */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: C.muted, fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                        Policies Done
                      </div>
                      <div style={{ fontSize: "32px", fontWeight: 700,
                        color: secondNop >= 2 ? C.green : C.red }}>
                        {secondNop}
                        <span style={{ fontSize: "14px", color: C.muted, fontWeight: 400,
                          marginLeft: "4px" }}>/ 2</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", color: C.muted, fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                        Reward
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: 700,
                        color: secondNop >= 2 ? C.green : C.muted }}>
                        {secondNop >= 2 ? "Rs.800" : "Rs.0"}
                      </div>
                    </div>
                  </div>

                  {/* Milestone tracker — 0, 1, 2 policies */}
                  <div style={{ position: "relative", marginBottom: "20px" }}>
                    {/* Track line */}
                    <div style={{ position: "absolute", top: "16px", left: "16px", right: "16px",
                      height: "4px", background: C.border, borderRadius: "99px", zIndex: 0 }}>
                      <div style={{ height: "100%", borderRadius: "99px", background: C.red,
                        width: secondNop >= 2 ? "100%" : secondNop === 1 ? "50%" : "0%",
                        transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                    </div>

                    {/* Milestone dots */}
                    <div style={{ display: "flex", justifyContent: "space-between",
                      position: "relative", zIndex: 1 }}>
                      {[
                        { count: 0, label: "Start",    reward: null       },
                        { count: 1, label: "1 Policy", reward: null       },
                        { count: 2, label: "2 Policies",reward: "Rs.800"  },
                      ].map((m, i) => {
                        const achieved = secondNop >= m.count && m.count > 0;
                        const isCurrent = secondNop === m.count;
                        return (
                          <div key={i} style={{ display: "flex", flexDirection: "column",
                            alignItems: "center", gap: "6px" }}>
                            {/* Reward label above */}
                            <div style={{ fontSize: "10px", fontWeight: 700, height: "16px",
                              color: achieved ? C.green : C.hint }}>
                              {m.reward || ""}
                            </div>
                            {/* Dot */}
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%",
                              background: achieved ? C.green : isCurrent && m.count === 0 ? C.bg : C.border,
                              border: `2.5px solid ${achieved ? C.green : isCurrent ? C.red : C.border}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.3s" }}>
                              {achieved ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 12L10 17L19 8" stroke="#fff" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : (
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%",
                                  background: isCurrent ? C.red : C.border }} />
                              )}
                            </div>
                            {/* Label below */}
                            <div style={{ fontSize: "10px", fontWeight: 600,
                              color: achieved ? C.green : isCurrent ? C.red : C.muted,
                              textAlign: "center" }}>
                              {m.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status message */}
                  <div style={{ padding: "10px 12px", borderRadius: C.radiusSm,
                    background: secondNop >= 2 ? C.greenLight : C.redLight,
                    border: `1px solid ${secondNop >= 2 ? "#86EFAC" : "#FECACA"}`,
                    fontSize: "12px", color: secondNop >= 2 ? C.green : C.red }}>
                    {secondNop >= 2
                      ? <strong>Reward unlocked — Rs.800 earned!</strong>
                      : secondNop === 1
                      ? <>1 more policy needed to unlock <strong>Rs.800 reward</strong></>
                      : <>Do <strong>2 New/PA policies</strong> (min Rs.15,000 each) to earn Rs.800</>
                    }
                  </div>

                  {/* T&C note */}
                  <div style={{ marginTop: "10px", fontSize: "10px", color: C.hint, lineHeight: 1.5 }}>
                    Only New and PA policies counted. Min premium Rs.15,000 per policy.
                    Port, Renewal and Cancelled cases excluded.
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
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input::placeholder { color: ${C.hint} !important; font-weight: 400 !important; }
      `}</style>
    </div>
  );
}
