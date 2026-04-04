import { useState } from "react";
import HealthRecommender      from "./HealthRecommender";
import ContestDashboard       from "./ContestDashboard";
import CommissionCalculator   from "./CommissionCalculator";

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

export default function App() {
  const [screen, setScreen] = useState("home");

  /* ── HOME ── */
  if (screen === "home") return (
    <div style={{ minHeight:"100vh", maxWidth:"480px", margin:"0 auto", background:C.bg, fontFamily:"'Inter',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <div style={{ background:C.accent, padding:"28px 20px 32px", textAlign:"center" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", marginBottom:"16px" }}>
          <img src="https://www.google.com/s2/favicons?domain=insurancedekho.com&sz=128" alt="InsuranceDekho" style={{ height:"36px", width:"36px", borderRadius:"8px", objectFit:"cover", flexShrink:0 }}/>
          <div>
            <div style={{ fontSize:"15px", fontWeight:700, color:"#fff" }}>InsuranceDekho</div>
            <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.7)", marginTop:"1px" }}>Agent Tool · Health</div>
          </div>
        </div>
        <div style={{ fontSize:"22px", fontWeight:700, color:"#fff", marginBottom:"4px" }}>👋 Welcome back!</div>
        <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.75)" }}>What would you like to do today?</div>
      </div>

      <div style={{ padding:"20px 16px" }}>
        <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:C.muted, marginBottom:"12px" }}>Choose an option</div>
        {[
          { icon:"🩺", iconBg:"#FFF0F0", title:"Plan Recommender",      desc:"AI-powered health plan recommendations based on age, health & budget", onClick:() => setScreen("recommender") },
          { icon:"🏆", iconBg:"#FFF8E1", title:"Contest Achievement",   desc:"Track your Thailand Chalo & VLI progress in one place",              onClick:() => setScreen("contests")    },
          { icon:"🧮", iconBg:"#F0FDF4", title:"Base Payout Calculator", desc:"Estimate your base commission before selling a policy",               onClick:() => setScreen("calculator")  },
        ].map((opt, i) => (
          <div key={i} onClick={opt.onClick} style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"16px 18px", marginBottom:"10px", display:"flex", alignItems:"center", gap:"14px", cursor:"pointer" }}>
            <div style={{ width:"46px", height:"46px", borderRadius:"12px", background:opt.iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", flexShrink:0 }}>
              {opt.icon}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"15px", fontWeight:700, color:C.text, marginBottom:"3px" }}>{opt.title}</div>
              <div style={{ fontSize:"12px", color:C.muted, lineHeight:1.4 }}>{opt.desc}</div>
            </div>
            <div style={{ fontSize:"16px", color:C.accent, flexShrink:0 }}>→</div>
          </div>
        ))}
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}body{margin:0;background:${C.bg};}`}</style>
    </div>
  );

  /* ── PLAN RECOMMENDER ── */
  if (screen === "recommender") return (
    <HealthRecommender onBack={() => setScreen("home")} />
  );

  /* ── CONTEST ACHIEVEMENT ── */
  if (screen === "contests") return (
    <ContestDashboard onBack={() => setScreen("home")} />
  );

  /* ── VLI (kept for compatibility but not used in main flow) ── */
  if (screen === "vli") return (
  );

  /* ── THAILAND CHALO ── */
  if (screen === "thailand") return (
    <ContestDashboard onBack={() => setScreen("contests")} />
  );

  /* ── COMMISSION CALCULATOR ── */
  if (screen === 'calculator') return (
    <CommissionCalculator onBack={() => setScreen('home')} />
  );

  return null;
}
