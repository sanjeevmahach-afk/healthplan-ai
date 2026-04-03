import { useState } from "react";
import HealthRecommender      from "./HealthRecommender";
import ContestDashboard       from "./ContestDashboard";
import VLIDashboard           from "./VLIDashboard";
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
          { icon:"🏆", iconBg:"#FFF8E1", title:"Contest Achievement",   desc:"Track your progress and rewards across active sales contests",          onClick:() => setScreen("contests")    },
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

  /* ── CONTEST LIST ── */
  if (screen === "contests") return (
    <div style={{ minHeight:"100vh", maxWidth:"480px", margin:"0 auto", background:C.bg, fontFamily:"'Inter',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <div style={{ background:C.accent, padding:"24px 20px 28px", textAlign:"center" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"10px" }}>
          <img src="https://www.google.com/s2/favicons?domain=insurancedekho.com&sz=128" alt="InsuranceDekho" style={{ height:"28px", width:"28px", borderRadius:"6px", objectFit:"cover" }}/>
          <div style={{ fontSize:"12px", fontWeight:700, color:"rgba(255,255,255,0.85)" }}>InsuranceDekho</div>
        </div>
        <div style={{ fontSize:"22px", fontWeight:700, color:"#fff", marginBottom:"4px" }}>🏆 Contest Achievement</div>
        <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.75)" }}>Select a contest to check your progress</div>
      </div>

      <div style={{ padding:"18px 16px" }}>
        <div onClick={() => setScreen("home")} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"13px", fontWeight:600, color:C.accent, cursor:"pointer", marginBottom:"16px" }}>
          ← Back
        </div>

        <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:C.muted, marginBottom:"10px" }}>Live now</div>

        {/* VLI */}
        <div onClick={() => setScreen("vli")} style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"16px 18px", marginBottom:"10px", cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"8px" }}>
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:"#F0FDF4", border:"1px solid #86efac", borderRadius:"20px", padding:"2px 8px", fontSize:"10px", fontWeight:700, color:C.green, marginBottom:"6px" }}>
                <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:C.green }} />
                Live
              </div>
              <div style={{ fontSize:"16px", fontWeight:700, color:C.text }}>Health Payout Incentive 💰</div>
            </div>
            <div style={{ fontSize:"16px", color:C.accent }}>→</div>
          </div>
          <div style={{ fontSize:"12px", color:C.muted, lineHeight:1.4, marginBottom:"10px" }}>
            Earn extra payout over the base grid — up to 15% on your April health premium!
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            {[{ label:"Booking period", value:"1 Apr – 30 Apr 2026" }, { label:"Max payout", value:"15%" }].map((d,i) => (
              <div key={i} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:"6px", padding:"5px 8px", fontSize:"10px", color:"#555" }}>
                <div style={{ fontSize:"9px", color:C.muted, marginBottom:"1px" }}>{d.label}</div>
                {d.value}
              </div>
            ))}
          </div>
        </div>

        {/* Thailand Chalo */}
        <div onClick={() => setScreen("thailand")} style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"16px 18px", marginBottom:"10px", cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"8px" }}>
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:"#F0FDF4", border:"1px solid #86efac", borderRadius:"20px", padding:"2px 8px", fontSize:"10px", fontWeight:700, color:C.green, marginBottom:"6px" }}>
                <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:C.green }} />
                Live
              </div>
              <div style={{ fontSize:"16px", fontWeight:700, color:C.text }}>Thailand Chalo! 🏝️</div>
            </div>
            <div style={{ fontSize:"16px", color:C.accent }}>→</div>
          </div>
          <div style={{ fontSize:"12px", color:C.muted, lineHeight:1.4, marginBottom:"10px" }}>
            Book health policies and win exciting rewards — from cash prizes to a Thailand trip for 2!
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            {[{ label:"Payment window", value:"1 Apr – 30 Jun 2026" },{ label:"Booking till", value:"10 Jul 2026" }].map((d,i) => (
              <div key={i} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:"6px", padding:"5px 8px", fontSize:"10px", color:"#555" }}>
                <div style={{ fontSize:"9px", color:C.muted, marginBottom:"1px" }}>{d.label}</div>
                {d.value}
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:C.muted, margin:"16px 0 10px" }}>Coming soon</div>
        <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"16px 18px", opacity:0.5 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:"#F5F5F5", border:"1px solid #E0E0E0", borderRadius:"20px", padding:"2px 8px", fontSize:"10px", fontWeight:700, color:C.muted, marginBottom:"6px" }}>
            Coming Soon
          </div>
          <div style={{ fontSize:"16px", fontWeight:700, color:C.muted }}>Next Contest</div>
          <div style={{ fontSize:"12px", color:C.muted, marginTop:"4px" }}>Stay tuned for the next exciting contest!</div>
        </div>
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}body{margin:0;background:${C.bg};}`}</style>
    </div>
  );

  /* ── VLI ── */
  if (screen === "vli") return (
    <VLIDashboard onBack={() => setScreen("contests")} />
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
