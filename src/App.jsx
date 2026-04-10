import { C } from './theme';
import { useState } from "react";
import HealthRecommender    from "./HealthRecommender";
import ContestDashboard     from "./ContestDashboard";
import CommissionCalculator from "./CommissionCalculator";


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
    label: "Contests",
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
    label: "Plans",
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
          <div key={tab.id} onClick={() => onChange(tab.id)}
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

/* ── HOME SCREEN ─────────────────────────────────────────────── */
function HomeScreen({ onNavigate }) {
  const [showBanner, setShowBanner] = useState(true);

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

        {/* BOOSTER NOTIFICATION BANNER */}
        {showBanner && (
          <div style={{ position: "relative", marginBottom: "14px", borderRadius: C.radius, overflow: "hidden", boxShadow: C.shadow }}>
            {/* Close button */}
            <button onClick={() => setShowBanner(false)}
              style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10,
                background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%",
                width: "28px", height: "28px", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", padding: 0,
                WebkitTapHighlightColor: "transparent" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            {/* Actual image */}
            <img
              src="https://raw.githubusercontent.com/sanjeevmahach-afk/healthplan-ai/main/public/Thailand_Chalo_11-14_booster.png"
              alt="Thailand Chalo Booster"
              style={{ width: "100%", display: "block", borderRadius: C.radius }}
            />
          </div>
        )}

        {/* SECTION LABEL */}
        <div style={{ fontSize: "12px", fontWeight: 600, color: C.muted, letterSpacing: "0.05em",
          textTransform: "uppercase", marginBottom: "12px" }}>
          Quick Actions
        </div>

        {/* TOOL CARDS */}
        {tools.map((t, i) => (
          <div key={i} onClick={() => onNavigate(t.tab)}
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
      </div>
    </div>
  );
}
