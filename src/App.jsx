import { useState, useEffect } from "react";

/* ─── DATA ──────────────────────────────────────────────────────────────── */

const PLANS_DATA = {
  "Niva Reassure 3.0": {
    insurer: "Niva Bupa", pedWaiting: "Day 1", copay: "No", roomRent: "No Cap",
    ncb: "Unlimited", maxBMI: 37, maxAge: 99, premiumRange: "High",
    diseases: ["Diabetes (HbA1c ≤ 7.5)", "Up to 2 co-morbidities"],
    specialFeatures: ["Lock the Age", "OPD covered (Optional)", "Day 1 PED covered", "Unlimited SI"],
    bestFor: ["Any age", "Day 1 PED cover needed", "Unlimited SI seeker"],
    medicals: "PPMC (in absence of reports)", payoutFresh: "Excellent", payoutPort: "Excellent", color: "#4f46e5"
  },
  "HDFC Optima Secure": {
    insurer: "HDFC", pedWaiting: "3 years", copay: "No", roomRent: "No Cap",
    ncb: "50% to 100%", maxBMI: 37, maxAge: 65, premiumRange: "Very High",
    diseases: ["HbA1c ≤ 7", "Hyperthyroid", "Loading relaxation on single PED"],
    specialFeatures: ["2X Cover from Day 1"],
    bestFor: ["Age < 65", "Mild NSTP", "Premium plan seeker"],
    medicals: "PPMC (in absence of reports)", payoutFresh: "Excellent", payoutPort: "Excellent", color: "#0891b2"
  },
  "ICICI Elevate": {
    insurer: "ICICI", pedWaiting: "3 years (30-day jumpstart optional)", copay: "No",
    roomRent: "Single Pvt. AC room", ncb: "20% to 100%", maxBMI: 35, maxAge: 65, premiumRange: "High",
    diseases: ["HbA1c ≤ 7.5", "Up to 2 co-morbidities"],
    specialFeatures: ["Unlimited claim (Infinite Care)", "Day 30 PED (Jumpstart)", "Worldwide cover after 2 yrs", "2-hour hospitalisation"],
    bestFor: ["Age < 65", "Mild NSTP", "Global cover seeker"],
    medicals: "PPMC (in absence of reports)", payoutFresh: "Excellent", payoutPort: "Good", color: "#7c3aed"
  },
  "TATA Medicare Select": {
    insurer: "TATA AIG", pedWaiting: "3 years", copay: "No", roomRent: "Single Pvt. AC room",
    ncb: "50% to 100%", maxBMI: 35, maxAge: 65, premiumRange: "High",
    diseases: ["HbA1c ≤ 7.5", "Up to 2 co-morbidities"],
    specialFeatures: ["Unlimited claim (Infinite Advantage)", "7.5% discount for salaried", "Day 30 PED (Advance Cover Rider)", "Women & mental wellbeing rider"],
    bestFor: ["Age < 65", "Family floater", "Salaried professional"],
    medicals: "PPMC (in absence of reports)", payoutFresh: "Excellent", payoutPort: "Good", color: "#059669"
  },
  "Star Assure": {
    insurer: "Star", pedWaiting: "3 years (2.5 yr for 3-yr tenure)", copay: "10% if age > 60",
    roomRent: "5L: 1%, >5L: Any except Suite", ncb: "25% to 100% (non-reducing)", maxBMI: 32, maxAge: 75, premiumRange: "Medium",
    diseases: ["HbA1c ≤ 8", "Up to 3 co-morbidities", "Surgery related PED"],
    specialFeatures: ["Consumables inbuilt", "No sublimits", "Aggregate deductible (45% discount)", "Unlimited restoration"],
    bestFor: ["Age < 75", "NSTP", "Medium budget"],
    medicals: "No PPMC", payoutFresh: "Excellent", payoutPort: "Excellent", color: "#dc2626"
  },
  "Care Supreme": {
    insurer: "Care", pedWaiting: "4 years (Rider: 1 year)", copay: "No", roomRent: "No Cap",
    ncb: "50% to 600%", maxBMI: 32, maxAge: 99, premiumRange: "High",
    diseases: ["HbA1c ≤ 7", "Up to 3 co-morbidities"],
    specialFeatures: ["No loading", "Super NCB", "Instant Cover rider", "PED Modification rider"],
    bestFor: ["Any age", "NSTP", "Multiple PEDs"],
    medicals: "No PPMC", payoutFresh: "Good", payoutPort: "Excellent", color: "#d97706"
  },
  "Reliance Health Gain": {
    insurer: "Reliance", pedWaiting: "3 years", copay: "No", roomRent: "Any",
    ncb: "100% to 500%", maxBMI: 37, maxAge: 55, premiumRange: "Very Low",
    diseases: ["HbA1c ≤ 8", "Epilepsy", "Surgery related PED"],
    specialFeatures: ["Multi-year discounts for healthy people"],
    bestFor: ["Age < 55", "Tier 1 city", "Budget-conscious"],
    medicals: "No PPMC", payoutFresh: "Excellent", payoutPort: "Excellent", color: "#16a34a"
  },
  "Niva Aspire": {
    insurer: "Niva Bupa", pedWaiting: "3 years", copay: "No", roomRent: "No Cap",
    ncb: "100% to 1000%", maxBMI: 37, maxAge: 65, premiumRange: "Very High",
    diseases: ["HbA1c ≤ 7.5", "Up to 2 co-morbidities"],
    specialFeatures: ["Lock the Age", "Maternity (9 months)", "Global cover (Borderless)", "OPD (Well Consult)", "2-hour hospitalisation", "Future spouse Day 1 cover"],
    bestFor: ["Young families", "Maternity planning", "Age < 65"],
    medicals: "PPMC (in absence of reports)", payoutFresh: "Good", payoutPort: "Good", color: "#9333ea"
  },
  "Aditya Birla Active One Max": {
    insurer: "Aditya Birla", pedWaiting: "3 years", copay: "No", roomRent: "No Cap",
    ncb: "100% to 500%", maxBMI: 40, maxAge: 99, premiumRange: "High",
    diseases: ["HbA1c ≤ 8", "Epilepsy", "Chronic diseases Day 1"],
    specialFeatures: ["Chronic Care (Day 1 - 7 listed)", "100% health returns", "Consumables inbuilt", "Health checkup inbuilt"],
    bestFor: ["Any age", "NSTP", "Chronic conditions"],
    medicals: "PPMC above 60", payoutFresh: "Excellent", payoutPort: "Excellent", color: "#e11d48"
  },
  "SBI Health Alpha": {
    insurer: "SBI", pedWaiting: "3 years", copay: "No", roomRent: "Any",
    ncb: "100% to 500%", maxBMI: 40, maxAge: 99, premiumRange: "Very Low",
    diseases: ["HbA1c ≤ 8", "Epilepsy", "Surgery related PED"],
    specialFeatures: ["Wellness discount (100%)", "Very affordable premium"],
    bestFor: ["Budget-conscious", "Any age", "High BMI"],
    medicals: "No PPMC", payoutFresh: "Excellent", payoutPort: "Average", color: "#0369a1"
  },
  "Care Freedom": {
    insurer: "Care", pedWaiting: "2 years", copay: "20%", roomRent: "1%, Twin, Single",
    ncb: "None", maxBMI: 35, maxAge: 99, premiumRange: "High",
    diseases: ["HbA1c ≤ 9 (including insulin)", "Mental illness", "Rheumatoid Arthritis", "Kidney conditions"],
    specialFeatures: ["100% Restoration", "Ideal for multiple co-morbidities"],
    bestFor: ["Multiple complex PEDs", "Insulin-dependent diabetics", "Mental illness", "Cancer (cured)"],
    medicals: "Yes (Subject to UW)", payoutFresh: "Good", payoutPort: "Good", color: "#ca8a04"
  },
  "Care Heart / Star Cardiac Care": {
    insurer: "Care / Star", pedWaiting: "Varies", copay: "Varies", roomRent: "Varies",
    ncb: "Varies", maxBMI: 35, maxAge: 99, premiumRange: "High",
    diseases: ["Heart conditions", "Cardiac history"],
    specialFeatures: ["Specialized cardiac coverage"],
    bestFor: ["Heart disease patients"],
    medicals: "Yes", payoutFresh: "Good", payoutPort: "Good", color: "#e11d48"
  }
};

function getRecommendations(form) {
  const { age, ped, bmi, familySize, maternity, budget, isPort, hba1c } = form;
  const ageNum = parseInt(age);
  const bmiNum = parseFloat(bmi);
  const hba1cNum = parseFloat(hba1c) || 0;
  let scores = {};

  Object.entries(PLANS_DATA).forEach(([name, plan]) => {
    let score = 50;
    let eligible = true;
    let reasons = [];

    if (ageNum > plan.maxAge) { eligible = false; return; }
    if (bmiNum > plan.maxBMI) { eligible = false; return; }
    if (ageNum >= 60 && plan.copay !== "No") score -= 5;
    if (ageNum < 40 && plan.premiumRange === "Very Low") { score += 10; reasons.push("Budget-friendly for your age"); }
    if (ageNum >= 55 && plan.maxAge >= 75) { score += 8; reasons.push("Suitable for your age group"); }

    if (ped === "none") {
      if (plan.pedWaiting.includes("Day 1")) score += 5;
      if (plan.premiumRange === "Very Low") { score += 12; reasons.push("Best value with no pre-existing conditions"); }
      if (plan.premiumRange === "Low" || plan.premiumRange === "Medium") score += 8;
    } else if (ped === "diabetes_tab_low") {
      if (hba1cNum > 0 && hba1cNum <= 7 && plan.diseases.some(d => d.includes("7"))) { score += 20; reasons.push("Accepts your HbA1c level"); }
      else if (hba1cNum > 7 && hba1cNum <= 7.5 && plan.diseases.some(d => d.includes("7.5"))) { score += 18; reasons.push("Accepts your HbA1c level"); }
      else if (plan.diseases.some(d => d.includes("7.5") || d.includes("8"))) score += 12;
      else score -= 15;
    } else if (ped === "diabetes_tab_high") {
      if (plan.diseases.some(d => d.includes("9"))) { score += 15; reasons.push("Accepts high HbA1c"); }
      else if (plan.diseases.some(d => d.includes("8"))) { score += 10; reasons.push("Accepts your HbA1c level"); }
      else score -= 20;
    } else if (ped === "diabetes_insulin") {
      if (plan.diseases.some(d => d.includes("insulin"))) { score += 20; reasons.push("Covers insulin-dependent diabetes"); }
      else if (name === "Care Freedom") score += 15;
      else { eligible = false; return; }
    } else if (ped === "bp") {
      if (plan.diseases.some(d => d.toLowerCase().includes("co-morbid"))) { score += 10; reasons.push("Covers BP conditions"); }
    } else if (ped === "heart") {
      if (name === "Care Heart / Star Cardiac Care") { score += 30; reasons.push("Specialized cardiac plan"); }
      else if (name === "Aditya Birla Active One Max") { score += 15; reasons.push("Suitable for heart conditions"); }
      else if (name === "Care Freedom") score += 10;
      else score -= 20;
    } else if (ped === "kidney") {
      if (name === "Care Freedom") { score += 20; reasons.push("Good for kidney conditions"); }
      else if (name === "Aditya Birla Active One Max") score += 15;
      else score -= 15;
    } else if (ped === "mental") {
      if (name === "Care Freedom") { score += 25; reasons.push("Covers mental illness"); }
      else if (name === "Aditya Birla Active One Max") { score += 20; reasons.push("Covers mental wellness"); }
      else score -= 20;
    } else if (ped === "cancer_cured") {
      if (name === "Care Freedom") { score += 20; reasons.push("Suitable for cancer survivors"); }
      else score -= 15;
    } else if (ped === "surgery_treated") {
      if (name === "Star Assure") { score += 20; reasons.push("P1 for treated surgery cases"); }
      else if (name === "Niva Reassure 3.0") { score += 18; reasons.push("Good for post-surgery"); }
      else if (name === "Care Supreme") score += 15;
    } else if (ped === "surgery_untreated") {
      if (name === "Care Supreme") { score += 20; reasons.push("P1 for untreated surgery"); }
      else if (name === "Care Freedom") score += 15;
    } else if (ped === "rheumatoid") {
      if (name === "Care Freedom") { score += 30; reasons.push("Specific coverage for Rheumatoid Arthritis"); }
      else score -= 20;
    } else if (ped === "hyperthyroid") {
      if (name === "HDFC Optima Secure") { score += 25; reasons.push("Covers hyperthyroid (loading relaxation)"); }
      else if (name === "SBI Health Alpha") score += 15;
      else if (name === "Care Freedom") score += 10;
      else score -= 10;
    }

    const premiumMap = { "Very Low": 1, "Low": 2, "Medium": 3, "High": 4, "Very High": 5 };
    const planPrem = premiumMap[plan.premiumRange] || 3;
    if (budget === "low" && planPrem <= 2) { score += 20; reasons.push("Within your budget"); }
    else if (budget === "low" && planPrem >= 4) score -= 15;
    else if (budget === "medium" && planPrem === 3) { score += 10; reasons.push("Good value for money"); }
    else if (budget === "high" && planPrem >= 4) { score += 10; reasons.push("Premium coverage"); }

    if (familySize === "2a" && plan.bestFor.some(b => b.includes("2A"))) { score += 8; reasons.push("Ideal for couples"); }
    if (familySize === "family" && plan.bestFor.some(b => b.includes("family") || b.includes("Any"))) { score += 8; reasons.push("Great family floater"); }
    if ((familySize === "parents" || familySize === "senior") && plan.maxAge >= 75) { score += 10; reasons.push("Covers senior family members"); }
    if (maternity === "yes" && plan.specialFeatures.some(f => f.toLowerCase().includes("maternity"))) { score += 20; reasons.push("Maternity benefits included"); }

    if (eligible) scores[name] = { score, reasons: reasons.slice(0, 3) };
  });

  return Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3)
    .map(([name, data]) => ({ name, ...PLANS_DATA[name], ...data }));
}

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
const calcBMI = (h, w) => {
  const hm = parseFloat(h) / 100, wk = parseFloat(w);
  if (!hm || !wk || hm <= 0) return null;
  return parseFloat((wk / (hm * hm)).toFixed(1));
};

const bmiMeta = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6" };
  if (bmi < 25)   return { label: "Normal",      color: "#10b981" };
  if (bmi < 30)   return { label: "Overweight",  color: "#f59e0b" };
  return            { label: "Obese",        color: "#ef4444" };
};

const rc = (r) => ({ Excellent: "#10b981", Good: "#3b82f6", Average: "#f59e0b", Poor: "#ef4444" }[r] || "#6b7280");

const premiumColors = {
  "Very Low":  ["#dcfce7","#15803d"], "Low": ["#d1fae5","#065f46"],
  "Medium":    ["#fef9c3","#92400e"], "High": ["#fee2e2","#991b1b"], "Very High": ["#fce7f3","#9d174d"],
};

/* ─── SMALL UI COMPONENTS ───────────────────────────────────────────────── */
const inputStyle = {
  width: "100%", padding: "13px 14px", borderRadius: "12px",
  border: "1.5px solid #e5e7eb", background: "#fafafa",
  fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "#111",
  outline: "none", boxSizing: "border-box", WebkitAppearance: "none",
};

const Field = ({ label, children }) => (
  <div style={{ marginBottom: "20px" }}>
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "12px",
      letterSpacing: "0.07em", textTransform: "uppercase", color: "#6b7280", marginBottom: "7px" }}>
      {label}
    </div>
    {children}
  </div>
);

const TInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} inputMode={type === "number" ? "decimal" : "text"}
    style={inputStyle} />
);

const NSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{
    ...inputStyle, paddingRight: "36px", cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%236b7280'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
  }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Pills = ({ options, value, onChange }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
    {options.map(o => {
      const active = value === o.value;
      return (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          padding: "9px 16px", borderRadius: "30px",
          border: active ? "none" : "1.5px solid #e5e7eb",
          background: active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#fafafa",
          color: active ? "#fff" : "#374151",
          fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
          fontWeight: active ? 700 : 500, cursor: "pointer",
          transition: "all 0.15s", WebkitTapHighlightColor: "transparent",
        }}>
          {o.emoji && <span style={{ marginRight: "5px" }}>{o.emoji}</span>}{o.label}
        </button>
      );
    })}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0",
    borderBottom: "1px solid #f3f4f6", gap: "12px" }}>
    <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151", textAlign: "right" }}>{value}</span>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "22px",
    color: "#111", marginBottom: "24px", letterSpacing: "-0.3px" }}>
    {children}
  </div>
);

const STEPS = [
  { title: "Basics",  icon: "👤" },
  { title: "Health",  icon: "🩺" },
  { title: "Cover",   icon: "🛡️" },
  { title: "Results", icon: "✨" },
];

/* ─── MAIN APP ───────────────────────────────────────────────────────────── */
export default function App() {
  const [step, setStep]             = useState(0);
  const [form, setForm]             = useState({
    age: "", height: "", weight: "",
    ped: "none", hba1c: "",
    familySize: "2a", maternity: "no",
    budget: "medium", isPort: "no",
    city: "tier1", sumInsured: "10",
  });
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [aiInsight, setAiInsight]   = useState("");
  const [expanded, setExpanded]     = useState(null);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const bmi     = calcBMI(form.height, form.weight);
  const bmiInfo = bmiMeta(bmi);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const handleGenerate = async () => {
    setLoading(true); setResults(null); setAiInsight(""); setExpanded(null);
    setStep(3);
    const recs = getRecommendations({ ...form, bmi });
    setResults(recs);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 200,
          messages: [{ role: "user", content:
            `Health insurance advisor in India. Customer: Age ${form.age}, PED: ${form.ped}, BMI: ${bmi || "N/A"}, HbA1c: ${form.hba1c || "N/A"}, Family: ${form.familySize}, Maternity: ${form.maternity}, Budget: ${form.budget}, Port: ${form.isPort}, City: ${form.city}, SI: ₹${form.sumInsured}L. Top 3: ${recs.map(r => r.name).join(", ")}. Write a 2-sentence advisory explaining why these fit. Under 55 words.`
          }]
        })
      });
      const d = await res.json();
      if (d.content?.[0]?.text) setAiInsight(d.content[0].text);
    } catch (e) {}
    setLoading(false);
  };

  const canNext = [!!form.age, true, true];

  return (
    <div style={{ minHeight: "100vh", maxWidth: "480px", margin: "0 auto",
      background: "#f4f6fb", fontFamily: "'DM Sans', sans-serif" }}>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)",
        padding: "18px 18px 0", position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 20px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "16px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>🏥</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "16px",
              color: "#fff", letterSpacing: "-0.3px" }}>HealthPlan AI</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>Insurance Recommendation Engine</div>
          </div>
          {step === 3 && (
            <button onClick={() => { setStep(0); setResults(null); setAiInsight(""); }}
              style={{ marginLeft: "auto", background: "rgba(255,255,255,0.12)", border: "none",
                color: "#fff", borderRadius: "20px", padding: "6px 13px", fontSize: "12px",
                fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                WebkitTapHighlightColor: "transparent" }}>← New</button>
          )}
        </div>

        {/* Step tabs */}
        <div style={{ display: "flex" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ height: "3px", width: "100%", borderRadius: "3px 3px 0 0",
                background: i <= step ? "#818cf8" : "rgba(255,255,255,0.12)",
                transition: "background 0.3s" }} />
              <div style={{ fontSize: "10px", padding: "5px 2px 6px", letterSpacing: "0.02em",
                color: i <= step ? "#a5b4fc" : "rgba(255,255,255,0.28)",
                fontWeight: i === step ? 700 : 400, transition: "color 0.3s", textAlign: "center" }}>
                {s.icon} {s.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "26px 18px 110px" }}>

        {/* STEP 0 */}
        {step === 0 && (
          <div>
            <SectionTitle>Basic Info</SectionTitle>
            <Field label="Customer Age (years)">
              <TInput value={form.age} onChange={set("age")} placeholder="e.g. 35" type="number" />
            </Field>
            <Field label="Height (cm)">
              <TInput value={form.height} onChange={set("height")} placeholder="e.g. 168" type="number" />
            </Field>
            <Field label="Weight (kg)">
              <TInput value={form.weight} onChange={set("weight")} placeholder="e.g. 72" type="number" />
              {bmi && bmiInfo && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px",
                  padding: "9px 13px", background: bmiInfo.color + "10",
                  borderRadius: "10px", border: `1px solid ${bmiInfo.color}28` }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: bmiInfo.color }}>BMI: {bmi}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: bmiInfo.color,
                    background: bmiInfo.color + "20", padding: "2px 10px", borderRadius: "20px" }}>
                    {bmiInfo.label}
                  </span>
                </div>
              )}
            </Field>
            <Field label="City Tier">
              <Pills value={form.city} onChange={set("city")} options={[
                { value: "tier1", label: "Metro",  emoji: "🏙️" },
                { value: "tier2", label: "Tier 2", emoji: "🏘️" },
                { value: "tier3", label: "Tier 3", emoji: "🌾" },
              ]} />
            </Field>
            <Field label="Port Case?">
              <Pills value={form.isPort} onChange={set("isPort")} options={[
                { value: "no",  label: "Fresh Policy", emoji: "🆕" },
                { value: "yes", label: "Porting",      emoji: "🔄" },
              ]} />
            </Field>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <SectionTitle>Health Profile</SectionTitle>
            <Field label="Pre-Existing Disease (PED)">
              <NSelect value={form.ped} onChange={set("ped")} options={[
                { value: "none",              label: "No PED" },
                { value: "diabetes_tab_low",  label: "Diabetes (Tablet, HbA1c ≤ 8)" },
                { value: "diabetes_tab_high", label: "Diabetes (Tablet, HbA1c > 8)" },
                { value: "diabetes_insulin",  label: "Diabetes (Insulin-dependent)" },
                { value: "bp",                label: "Blood Pressure only" },
                { value: "bp_diab",           label: "BP + Diabetes (Tablet)" },
                { value: "heart",             label: "Heart Condition" },
                { value: "kidney",            label: "Kidney Condition" },
                { value: "cancer_cured",      label: "Cancer (Cured)" },
                { value: "surgery_treated",   label: "Surgery (Treated/Operated)" },
                { value: "surgery_untreated", label: "Surgery (Untreated)" },
                { value: "mental",            label: "Mental Illness" },
                { value: "rheumatoid",        label: "Rheumatoid Arthritis" },
                { value: "hyperthyroid",      label: "Hyperthyroid" },
              ]} />
            </Field>
            {form.ped.includes("diabetes") && (
              <Field label="HbA1c Level">
                <TInput value={form.hba1c} onChange={set("hba1c")} placeholder="e.g. 7.2" type="number" />
              </Field>
            )}
            <Field label="Family Size">
              <Pills value={form.familySize} onChange={set("familySize")} options={[
                { value: "self",    label: "Self",          emoji: "🧍" },
                { value: "2a",      label: "Self+Spouse",   emoji: "👫" },
                { value: "family",  label: "Family",        emoji: "👨‍👩‍👧‍👦" },
                { value: "parents", label: "+Parents",      emoji: "👴" },
                { value: "senior",  label: "Senior 60+",    emoji: "🧓" },
              ]} />
            </Field>
            <Field label="Maternity Planning?">
              <Pills value={form.maternity} onChange={set("maternity")} options={[
                { value: "no",  label: "Not needed" },
                { value: "yes", label: "Yes 🤱" },
              ]} />
            </Field>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <SectionTitle>Coverage Needs</SectionTitle>
            <Field label="Budget Preference">
              <Pills value={form.budget} onChange={set("budget")} options={[
                { value: "low",    label: "Low",    emoji: "💸" },
                { value: "medium", label: "Medium", emoji: "💰" },
                { value: "high",   label: "High",   emoji: "💎" },
              ]} />
            </Field>
            <Field label="Sum Insured">
              <Pills value={form.sumInsured} onChange={set("sumInsured")} options={[
                { value: "5",   label: "₹5L"  },
                { value: "10",  label: "₹10L" },
                { value: "15",  label: "₹15L" },
                { value: "25",  label: "₹25L" },
                { value: "50",  label: "₹50L" },
                { value: "1cr", label: "₹1Cr" },
              ]} />
            </Field>
          </div>
        )}

        {/* STEP 3 — Results */}
        {step === 3 && (
          <div>
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "70px 20px", gap: "18px" }}>
                <div style={{ width: "48px", height: "48px", border: "3px solid #e0e7ff",
                  borderTop: "3px solid #6366f1", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontWeight: 600, color: "#6366f1", fontSize: "15px" }}>Analysing profile…</div>
              </div>
            )}

            {!loading && results && (
              <>
                {aiInsight && (
                  <div style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)",
                    borderRadius: "16px", padding: "16px", marginBottom: "18px",
                    display: "flex", gap: "11px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>🤖</span>
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#a5b4fc",
                        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>
                        AI Advisory
                      </div>
                      <p style={{ color: "#e0e7ff", fontSize: "13px", lineHeight: 1.65, margin: 0 }}>
                        {aiInsight}
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {results.map((plan, idx) => {
                    const isExp = expanded === idx;
                    const [pb, pt] = premiumColors[plan.premiumRange] || ["#f3f4f6","#374151"];
                    return (
                      <div key={plan.name} style={{
                        background: "#fff", borderRadius: "18px", overflow: "hidden",
                        boxShadow: idx === 0 ? "0 6px 28px rgba(99,102,241,0.16)" : "0 2px 10px rgba(0,0,0,0.07)",
                        border: idx === 0 ? "2px solid #6366f1" : "1.5px solid #eee",
                      }}>
                        {idx === 0 && (
                          <div style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                            color: "#fff", textAlign: "center", padding: "6px",
                            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            ⭐ Top Recommendation
                          </div>
                        )}

                        <div style={{ padding: "16px 16px 0" }}>
                          {/* Header */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                            <div>
                              <div style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af",
                                letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>
                                {plan.insurer}
                              </div>
                              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800,
                                fontSize: "16px", color: "#111", lineHeight: 1.2 }}>
                                {plan.name}
                              </div>
                            </div>
                            <span style={{ fontSize: "22px" }}>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                          </div>

                          {/* Premium badge */}
                          <span style={{ display: "inline-block", background: pb, color: pt,
                            borderRadius: "20px", padding: "3px 11px", fontSize: "11px", fontWeight: 700, marginBottom: "12px" }}>
                            {plan.premiumRange} Premium
                          </span>

                          {/* Quick stat chips */}
                          <div style={{ display: "flex", gap: "7px", marginBottom: "10px", flexWrap: "wrap" }}>
                            {[["PED", plan.pedWaiting.split(" ").slice(0,2).join(" ")], ["Co-pay", plan.copay], ["Max BMI", plan.maxBMI]].map(([k,v]) => (
                              <div key={k} style={{ background: "#f9fafb", borderRadius: "8px", padding: "6px 10px", flex: "1", minWidth: "70px" }}>
                                <div style={{ fontSize: "9px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{k}</div>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#111", marginTop: "1px" }}>{v}</div>
                              </div>
                            ))}
                          </div>

                          {/* Payout */}
                          <div style={{ display: "flex", gap: "7px", marginBottom: "14px" }}>
                            {[
                              { label: "Fresh Payout", rating: plan.payoutFresh, active: form.isPort === "no" },
                              { label: "Port Payout",  rating: plan.payoutPort,  active: form.isPort === "yes" },
                            ].map(({ label, rating, active }) => {
                              const col = rc(rating);
                              return (
                                <div key={label} style={{ flex: 1, borderRadius: "8px", padding: "7px 10px",
                                  background: active ? col + "10" : "#f9fafb",
                                  border: active ? `1.5px solid ${col}30` : "1.5px solid transparent" }}>
                                  <div style={{ fontSize: "9px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>
                                    💰 {label}
                                  </div>
                                  <span style={{ display: "inline-block", background: col + "18", color: col,
                                    border: `1px solid ${col}40`, borderRadius: "20px",
                                    padding: "2px 10px", fontSize: "12px", fontWeight: 700 }}>
                                    {rating}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Expand toggle */}
                        <button onClick={() => setExpanded(isExp ? null : idx)}
                          style={{ width: "100%", background: "#f9fafb", border: "none",
                            borderTop: "1px solid #f0f0f0", padding: "10px",
                            fontSize: "12px", fontWeight: 600, color: "#6366f1",
                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                            WebkitTapHighlightColor: "transparent" }}>
                          {isExp ? "▲ Less details" : "▼ More details"}
                        </button>

                        {isExp && (
                          <div style={{ padding: "14px 16px 16px", borderTop: "1px solid #f3f4f6" }}>
                            <InfoRow label="Room Rent" value={plan.roomRent} />
                            <InfoRow label="NCB" value={plan.ncb} />
                            <InfoRow label="Max Age" value={plan.maxAge === 99 ? "No limit" : plan.maxAge + " yrs"} />
                            <InfoRow label="Medicals" value={plan.medicals} />
                            {plan.reasons?.length > 0 && (
                              <div style={{ marginTop: "12px" }}>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280",
                                  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>
                                  Why Recommended
                                </div>
                                {plan.reasons.map((r, i) => (
                                  <div key={i} style={{ display: "flex", gap: "7px", alignItems: "flex-start",
                                    fontSize: "13px", color: "#374151", marginBottom: "5px" }}>
                                    <span style={{ color: "#10b981", fontWeight: 700, flexShrink: 0 }}>✓</span>
                                    <span>{r}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{ marginTop: "12px" }}>
                              <div style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280",
                                textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>
                                Key Features
                              </div>
                              {plan.specialFeatures.slice(0, 4).map((f, i) => (
                                <div key={i} style={{ display: "flex", gap: "7px", alignItems: "flex-start",
                                  fontSize: "12px", color: "#374151", marginBottom: "4px" }}>
                                  <span style={{ color: "#6366f1", flexShrink: 0 }}>★</span>
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: "18px", background: "#f9fafb", borderRadius: "12px",
                  padding: "12px 14px", border: "1px solid #e5e7eb" }}>
                  <p style={{ color: "#9ca3af", fontSize: "11px", margin: 0, lineHeight: 1.6 }}>
                    ⚠️ Recommendations are indicative. Final underwriting subject to insurer guidelines.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── STICKY BOTTOM NAV ── */}
      {step < 3 && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: "480px", background: "#fff", borderTop: "1px solid #e5e7eb",
          padding: "12px 18px", display: "flex", gap: "10px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.07)", zIndex: 200, boxSizing: "border-box" }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{ flex: 1, padding: "14px", borderRadius: "12px",
                border: "1.5px solid #e5e7eb", background: "#fff",
                fontSize: "15px", fontWeight: 600, color: "#374151",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                WebkitTapHighlightColor: "transparent" }}>← Back</button>
          )}
          {step < 2 ? (
            <button onClick={() => canNext[step] && setStep(s => s + 1)} disabled={!canNext[step]}
              style={{ flex: 3, padding: "14px", borderRadius: "12px", border: "none",
                background: canNext[step] ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#e5e7eb",
                color: canNext[step] ? "#fff" : "#9ca3af",
                fontSize: "15px", fontWeight: 700, cursor: canNext[step] ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif", WebkitTapHighlightColor: "transparent" }}>
              Continue →
            </button>
          ) : (
            <button onClick={handleGenerate}
              style={{ flex: 3, padding: "14px", borderRadius: "12px", border: "none",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
                fontSize: "15px", fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", WebkitTapHighlightColor: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              ✨ Get Recommendations
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        * { -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: #f4f6fb; }
      `}</style>
    </div>
  );
}
