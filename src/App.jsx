import { C } from './theme';
import { useState, useEffect, useRef } from "react";
import HealthRecommender    from "./HealthRecommender";
import ContestDashboard     from "./ContestDashboard";
import CommissionCalculator from "./CommissionCalculator";
import { Analytics }        from "./analytics";

/* ── MAINTENANCE MODE — set to false to restore the app ── */
const MAINTENANCE = true;

/* ── TAB CONFIG ──────────────────────────────────────────────── */
const TABS = [
  {
    id: "home",
    label: "Home",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          fill={active ? C.red : "none"} stroke={active ? C.red : C.muted} strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "contests",
    label: "My Rewards",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill={active ? C.red : "none"} stroke={active ? C.red : C.muted} strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "calculator",
    label: "Payout",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="2" fill={active ? C.red : "none"} stroke={active ? C.red : C.muted} strokeWidth="1.8"/>
        <path d="M8 7H16M8 11H16M8 15H12" stroke={active ? "#fff" : C.muted} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "recommender",
    label: "Recommend",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 11L11 13L15 9" stroke={active ? C.red : C.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"
          fill={active ? C.redLight : "none"} stroke={active ? C.red : C.muted} strokeWidth="1.8"/>
      </svg>
    ),
  },
];

/* ── BOTTOM TAB BAR ──────────────────────────────────────────── */
function TabBar({ active, onChange }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: C.card, borderTop: `1px solid ${C.border}`,
      display: "flex", zIndex: 100, maxWidth: "480px", margin: "0 auto",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      boxShadow: "0 -1px 8px rgba(0,0,0,0.06)",
    }}>
      {TABS.map(tab => {
        const isActive = active === tab.id;
        return (
          <div key={tab.id} onClick={() => { onChange(tab.id); Analytics.tabClick(tab.label); }}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "10px 4px 8px", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}>
            {tab.icon(isActive)}
            <span style={{ fontSize: "10px", marginTop: "3px", fontWeight: isActive ? 600 : 400,
              color: isActive ? C.red : C.muted, fontFamily: C.font }}>
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── MAIN APP ────────────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen] = useState("home");

  /* ── MAINTENANCE SCREEN ── */
  if (MAINTENANCE) return (
    <div style={{ fontFamily: C.font, background: C.bg, minHeight: "100vh",
      maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "16px", background: C.redLight,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
            stroke={C.red} strokeWidth="1.8"/>
          <path d="M12 7V13" stroke={C.red} strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="16.5" r="1" fill={C.red}/>
        </svg>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 10 }}>
        Site temporarily down
      </div>
      <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 300 }}>
        We're making some updates to improve your experience. The tool will be back shortly.
      </div>
      <div style={{ marginTop: 24, fontSize: 12, color: C.hint }}>
        For urgent queries, contact your manager.
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: C.font, background: C.bg, minHeight: "100vh",
      maxWidth: "480px", margin: "0 auto", paddingBottom: "72px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* SCREEN CONTENT */}
      {screen === "home"        && <HomeScreen onNavigate={setScreen} />}
      {screen === "contests"    && <ContestDashboard />}
      {screen === "calculator"  && <CommissionCalculator />}
      {screen === "recommender" && <HealthRecommender onBack={() => setScreen("home")} />}

      {/* BOTTOM TAB BAR */}
      <TabBar active={screen} onChange={setScreen} />

      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        input, select { font-family: ${C.font} !important; }
      `}</style>
    </div>
  );
}

/* ── COUNT-UP HOOK ───────────────────────────────────────────── */
function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (target === 0) return;
    const start  = prev.current;
    const end    = target;
    const range  = end - start;
    if (range === 0) return;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + range * eased));
      if (progress < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return display;
}

/* ── HOME SCREEN ─────────────────────────────────────────────── */
function HomeScreen({ onNavigate }) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [visits, setVisits] = useState({ today: 0, total: 0 });

  const todayDisplay = useCountUp(visits.today, 1000);
  const totalDisplay = useCountUp(visits.total, 1400);

  const BANNERS = [
    { src: "/App banner Thailand Chalo.png",       alt: "Thailand Chalo Contest" },
    { src: "/App Banner VLI.png",                  alt: "VLI Health Payout"      },
    { src: "/Second Policy Contest 2_App Banner.png", alt: "Second Policy Contest" },
  ];

  /* ── VISIT COUNTER — instant local + cross-device sync ── */
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("hpt_visits_cache") || "{}");
      if (cached.today || cached.total) {
        setVisits({ today: cached.today || 0, total: cached.total || 0 });
      }
    } catch (e) {}

    const VISIT_URL = "https://script.google.com/macros/s/AKfycbwMvAhAkTki6mrfoHNBFie-fD2k9k2riLSPE4dKd83ljW9icN3YX2wIHxqFijtaOmxZ/exec?action=visit";
    fetch(VISIT_URL)
      .then(r => r.json())
      .then(d => {
        const updated = { today: d.today || 0, total: d.visits || 0 };
        setVisits(updated);
        try { localStorage.setItem("hpt_visits_cache", JSON.stringify(updated)); } catch (e) {}
      })
      .catch(() => {});
  }, []);

  /* ── CAROUSEL AUTO-SCROLL ── */
  useEffect(() => {
    const t = setInterval(() => setCarouselIdx(i => (i + 1) % BANNERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const tools = [
    {
      title: "Plan Recommender",
      desc: "AI-powered health plan suggestions based on customer profile",
      tab: "recommender",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 11L11 13L15 9" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"
            fill={C.redLight} stroke={C.red} strokeWidth="2"/>
        </svg>
      ),
    },
    {
      title: "Contest Achievement",
      desc: "Track Thailand Chalo milestones and VLI payout progress",
      tab: "contests",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={C.redLight} stroke={C.red} strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      title: "Base Payout Calculator",
      desc: "Estimate your base commission before selling a policy",
      tab: "calculator",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="2" width="16" height="20" rx="2" fill={C.redLight} stroke={C.red} strokeWidth="2"/>
          <path d="M8 7H16M8 11H16M8 15H12" stroke={C.red} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* HEADER */}
      <div style={{ background: C.card, padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="https://www.google.com/s2/favicons?domain=insurancedekho.com&sz=128"
            alt="" style={{ width: "32px", height: "32px", borderRadius: "8px" }}/>
          <div>
            <div style={{ fontSize: "12px", color: C.muted, fontWeight: 400 }}>InsuranceDekho</div>
            <div style={{ fontSize: "16px", color: C.text, fontWeight: 700, marginTop: "1px" }}>Health Agent Tool</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>

        {/* ── BANNER CAROUSEL ── */}
        <div style={{ position: "relative", marginBottom: "14px",
          borderRadius: C.radius, overflow: "hidden", boxShadow: C.shadow }}>
          {BANNERS.map((b, i) => (
            <img key={i} src={b.src} alt={b.alt}
              onError={e => { e.target.style.display = "none"; }}
              style={{ width: "100%", display: i === carouselIdx ? "block" : "none",
                borderRadius: C.radius }} />
          ))}
          {/* Dot indicators */}
          <div style={{ position: "absolute", bottom: "8px", left: "50%",
            transform: "translateX(-50%)", display: "flex", gap: "5px", zIndex: 2 }}>
            {BANNERS.map((_, i) => (
              <div key={i} onClick={() => setCarouselIdx(i)}
                style={{ width: i === carouselIdx ? "16px" : "6px", height: "6px",
                  borderRadius: "99px", cursor: "pointer",
                  background: i === carouselIdx ? "#fff" : "rgba(255,255,255,0.5)",
                  transition: "all 0.3s" }} />
            ))}
          </div>
        </div>

        {/* SECTION LABEL */}
        <div style={{ fontSize: "12px", fontWeight: 600, color: C.muted, letterSpacing: "0.05em",
          textTransform: "uppercase", marginBottom: "12px" }}>
          Quick Actions
        </div>

        {/* TOOL CARDS */}
        {tools.map((t, i) => (
          <div key={i} onClick={() => { onNavigate(t.tab); Analytics.toolCardClick(t.title); }}
            style={{ background: C.card, borderRadius: C.radius, padding: "16px",
            marginBottom: "10px", display: "flex", alignItems: "center", gap: "14px",
            boxShadow: C.shadow, cursor: "pointer" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: C.redLight,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {t.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: C.text, marginBottom: "3px" }}>{t.title}</div>
              <div style={{ fontSize: "12px", color: C.muted, lineHeight: 1.4 }}>{t.desc}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M9 18L15 12L9 6" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}

        {/* VISIT STATS */}
        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          {[
            { label: "Visits today", value: todayDisplay,
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill={C.red}/><path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke={C.red} strokeWidth="1.8" fill="none"/></svg> },
            { label: "Total visits",  value: totalDisplay,
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 17.9 16.1 17 15 17H9C7.9 17 7 17.9 7 19V21" stroke={C.red} strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="10" r="3" stroke={C.red} strokeWidth="1.8"/><path d="M23 21V19C23 18.1 22.4 17.4 21.6 17.1M16 3.1C16.8 3.4 17.4 4.2 17.4 5.1C17.4 6 16.8 6.8 16 7.1" stroke={C.red} strokeWidth="1.8" strokeLinecap="round"/></svg> },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: C.card, borderRadius: C.radiusSm,
              padding: "12px 14px", boxShadow: C.shadow,
              display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px",
                background: C.redLight, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: C.text, lineHeight: 1 }}>
                  {s.value.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "3px" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
