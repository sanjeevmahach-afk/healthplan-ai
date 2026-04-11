import { useState } from "react";
import { C } from './theme';

const CALC_URL = "https://script.google.com/macros/s/AKfycbxcf2Fg9GtszMdbq36m9q0ynfzlrnT0dG-Y2jiOFCp90S4cuSqgjaAHJS6bN2uKVrNU/exec";

/* ── INSURER → PLANS ─────────────────────────────────────────── */
const INSURER_PLANS = {
  "Care Health Insurance Limited":                    ["Care Supreme Classic","Care Supreme Enhance","Care Supreme VFM","Care Joy","Care Arogya","Care SuperMediclaim","Care PA"],
  "Aditya Birla Health Insurance Co Ltd":             ["Activ One Max","Activ One Max Plus","Activ One Vytl","Activ Fit","Activ Health Platinum Enhanced","Activ Health Platinum Essential","Arogya Sanjeevani"],
  "Bajaj General Insurance Co. Ltd":                 ["Health Guard","Extra Care Plus","Personal Accident"],
  "Niva Bupa Health Insurance Co Ltd":               ["ReAssure 3.0","ReAssure 2.0","Gold","Gold Plus","Bronze","Bronze Plus","Aspire","Senior First"],
  "HDFC ERGO General Insurance Company":             ["Optima Secure","Optima Restore","my:health Suraksha","Personal Accident"],
  "ICICI Lombard":                                   ["Elevate","Complete Health Insurance","Health Advantage","Max Protect","Personal Accident"],
  "Star Health":                                     ["Star Comprehensive","Star Assure","Star Family Health Optima","Star Senior Citizens Red Carpet","Star Cancer Care","Star Cardiac Care","Personal Accident"],
  "Tata AIG General Insurance Company Limited":      ["Medicare Select","Medicare Premier","Medicare Plus","Medicare","Medicare Lite","Elder Care","CritiMedicare","Supercharge","Accident Guard (PA)"],
  "SBI General Insurance Company Limited":           ["Health Alpha","Super Health","Arogya Supreme","Arogya Top Up","Personal Accident"],
  "Digit Insurance Company Limited":                 ["Health Care","Arogya Sanjeevani","Personal Accident"],
  "Magma HDI General Insurance Company Ltd":         ["OneHealth","One Protect","One Secure","One Support","Double Suraksha"],
  "Cholamandalam MS General Insurance Company Ltd":  ["Flexi Health Supreme Plus","Flexi Health Floater","Flexi Health Individual","Super Top Up"],
  "Royal Sundaram General Insurance Company Limited":["Lifeline Supreme","Lifeline Elite","Lifeline Classic","Family Plus","Multiplier","Saral Suraksha Bima","Safety Net","Hospital Cash","Advance Top Up","Arogya Sanjeevani"],
  "Raheja QBE General Insurance Company Limited":    ["Health QuBE","Arogya Sanjeevani"],
  "Galaxy Health Insurance":                         ["Galaxy Health Plan"],
  "National Insurance":                              ["National Mediclaim","Sanjeevani","Super Top Up","Young Mediclaim","Parivar Mediclaim","Mediclaim Plus","New Parivar Plus","CI","Vidyarthi"],
  "New India Insurance":                             ["Premier Mediclaim","Yuva","Overseas Mediclaim","Floater Mediclaim"],
  "Oriental Insurance":                              ["Happy Family Floater","Individual Mediclaim","Senior Citizen"],
  "IFFCO Tokio General Insurance Limited":           ["SwasthyaKavach","Individual Health Protector","Family Health Protector"],
  "Zuno General Insurance":                          ["Health","Super Top Up"],
  "Kotak Mahindra General Insurance Limited":        ["Health Care","Health Premier","Secure"],
  "Liberty General Insurance Limited":               ["Health Connect Supra","Health Connect"],
  "Universal Sompo General Insurance Co. Ltd.":      ["Complete Healthcare","Individual Health Insurance","Arogya Sanjeevani","Super Healthcare"],
  "Cigna Health Insurance Co Ltd":                   ["ProHealth Prime","ProHealth Plus","ProHealth Protect","ProHealth Senior","Lifetime","Sarvah Pratham","Sarvah Uttam","Sarvah Param","Super Top Up CI","Personal Accident"],
  "Genralli Central India Insurance Co Ltd":         ["Health Plan"],
  "IndusInd (Reliance General Insurance)":           ["Health Gain","Health Infinity","Health Global","Super Top Up","CI","Hospicare"],
  "United India Insurance Company Limited":          ["Individual Health","Family Medicare","Aarogya Sanjeevani","Super Top Up Medicare","Yuvaan"],
};

/* ── LOCATION INSURERS ───────────────────────────────────────── */
const LOCATION_INSURERS = [
  "HDFC ERGO General Insurance Company",
  "SBI General Insurance Company Limited",
  "Magma HDI General Insurance Company Ltd",
  "IndusInd (Reliance General Insurance)",
];

/* ── STATE → CITIES ──────────────────────────────────────────── */
const STATE_CITIES = {
  "Delhi / NCR":    ["New Delhi","Noida","Ghaziabad","Faridabad","Gurgaon","Greater Noida"],
  "Haryana":        ["Ambala","Hisar","Rohtak","Panipat","Sonipat","Karnal","Kurukshetra","Rewari","Palwal","Sirsa","Fatehabad","Bhiwani","Jhajjar","Narnaul","Kaithal","Bahadurgarh"],
  "Punjab":         ["Amritsar","Ludhiana","Jalandhar","Patiala","Mansa","Tarn Taran","Bathinda","Mohali"],
  "Uttar Pradesh":  ["Agra","Aligarh","Mathura","Bareilly","Lucknow","Kanpur","Varanasi","Allahabad","Meerut","Gorakhpur"],
  "Gujarat":        ["Ahmedabad","Surat","Vadodara","Rajkot","Gandhinagar","Anand","Navsari","Jamnagar","Bhavnagar","Junagadh"],
  "Maharashtra":    ["Mumbai","Pune","Nashik","Thane","Navi Mumbai","Aurangabad","Nagpur","Kolhapur","Solapur"],
  "Karnataka":      ["Bangalore","Mysore","Mangalore","Hubli"],
  "Tamil Nadu":     ["Chennai","Coimbatore","Madurai","Salem","Trichy"],
  "Telangana":      ["Hyderabad","Secunderabad","Warangal"],
  "Rajasthan":      ["Jaipur","Jodhpur","Udaipur","Kota","Ajmer"],
  "Madhya Pradesh": ["Bhopal","Indore","Gwalior","Jabalpur"],
  "West Bengal":    ["Kolkata","Howrah","Durgapur","Siliguri"],
  "Kerala":         ["Kochi","Thiruvananthapuram","Kozhikode","Thrissur"],
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore"],
  "Bihar":          ["Patna","Gaya","Muzaffarpur"],
  "Jharkhand":      ["Ranchi","Jamshedpur","Dhanbad"],
  "Odisha":         ["Bhubaneswar","Cuttack","Rourkela"],
  "Assam":          ["Guwahati","Dibrugarh","Silchar"],
  "Chandigarh":     ["Chandigarh"],
  "Goa":            ["Panaji","Margao"],
};

/* ── SI OPTIONS ──────────────────────────────────────────────── */
const SI_OPTIONS = [
  { label:"1L",       value:100000    },
  { label:"2L",       value:200000    },
  { label:"3L",       value:300000    },
  { label:"4L",       value:400000    },
  { label:"5L",       value:500000    },
  { label:"7.5L",     value:750000    },
  { label:"10L",      value:1000000   },
  { label:"15L",      value:1500000   },
  { label:"20L",      value:2000000   },
  { label:"25L",      value:2500000   },
  { label:"50L",      value:5000000   },
  { label:"1Cr",      value:10000000  },
  { label:"Unlimited",value:100000000 },
];

/* ── UI COMPONENTS ───────────────────────────────────────────── */
const Label = ({ children, required }) => (
  <div style={{ fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>
    {children}{required && <span style={{ color: C.red, marginLeft: "3px" }}>*</span>}
  </div>
);

const FieldGroup = ({ label, required, children }) => (
  <div style={{ marginBottom: "18px" }}>
    <Label required={required}>{label}</Label>
    {children}
  </div>
);

const baseSelect = {
  width: "100%", padding: "12px 14px", borderRadius: C.radiusSm,
  border: `1.5px solid ${C.border}`, background: "#fff",
  fontFamily: C.font, fontSize: "14px", color: C.text,
  fontWeight: 500, outline: "none", WebkitAppearance: "none",
  boxSizing: "border-box", cursor: "pointer",
};

/* ── SEGMENT CONTROL (matching ID app blue style) ────────────── */
function Seg({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: C.blueLight, borderRadius: "99px",
      padding: "3px", gap: "2px" }}>
      {options.map(o => {
        const a = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{ flex: 1, padding: "8px 4px", borderRadius: "99px", border: "none",
              background: a ? C.blue : "transparent",
              color: a ? "#fff" : C.blue,
              fontFamily: C.font, fontSize: "13px", fontWeight: a ? 600 : 500,
              cursor: "pointer", transition: "all 0.15s",
              WebkitTapHighlightColor: "transparent" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── MAIN ────────────────────────────────────────────────────── */
export default function CommissionCalculator() {
  const [form, setForm] = useState({
    insurer: "", plan: "", planType: "health",
    si: "", age: "", state: "", city: "",
    policy: "new", coverage: "family floater", premium: "",
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = k => v => { setForm(f => ({ ...f, [k]: v })); setResult(null); };

  const needsLocation = LOCATION_INSURERS.includes(form.insurer);
  const plans   = form.insurer ? (INSURER_PLANS[form.insurer] || []) : [];
  const cities  = form.state   ? (STATE_CITIES[form.state]   || []) : [];

  function handleInsurer(val) {
    setForm(f => ({ ...f, insurer: val, plan: "", state: "", city: "" }));
    setResult(null);
  }

  async function calculate() {
    if (!form.insurer) { setError("Please select an insurer."); return; }
    if (!form.plan)    { setError("Please select a plan for " + form.insurer + "."); return; }
    if (!form.si)      { setError("Sum insured is required — tap a value above."); return; }
    if (!form.age)     { setError("Please enter the eldest member's age."); return; }
    if (!form.premium) { setError("Net premium is required to calculate payout."); return; }
    if (needsLocation && !form.state) { setError("State is required for " + form.insurer.split(" ")[0] + " — it affects the payout rate."); return; }
    if (needsLocation && !form.city)  { setError("Please select a city to determine the correct rate."); return; }
    setError(""); setResult(null); setLoading(true);
    try {
      const isPlanPA = form.plan.toLowerCase().includes("personal accident") || form.plan.toLowerCase().includes("accident guard") || form.plan.toLowerCase().includes(" pa)");
      const params = new URLSearchParams({
        insurer: form.insurer, plan: form.plan,
        planType: isPlanPA ? "personal accident" : form.planType,
        si: form.si, age: form.age,
        city: form.city || "rest of india",
        policy: form.policy, coverage: form.coverage, premium: form.premium,
      });
      const resp = await fetch(`${CALC_URL}?${params.toString()}`);
      if (!resp.ok) throw new Error();
      const json = await resp.json();
      if (json.error) { setError(json.error); setLoading(false); return; }
      setResult(json);
    } catch { setError("Network error — check your connection and try again."); }
    setLoading(false);
  }

  function reset() {
    setForm({ insurer:"", plan:"", planType:"health", si:"", age:"", state:"", city:"", policy:"new", coverage:"family floater", premium:"" });
    setResult(null); setError("");
  }

  return (
    <div style={{ fontFamily: C.font }}>

      {/* PAGE HEADER */}
      <div style={{ background: C.card, padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>Base Payout Calculator</div>
        <div style={{ fontSize: "13px", color: C.muted, marginTop: "2px" }}>Estimate your base commission</div>
      </div>

      <div style={{ padding: "16px" }}>
        <div style={{ background: C.card, borderRadius: C.radius, padding: "18px",
          boxShadow: C.shadow, marginBottom: "10px" }}>

          {/* INSURER */}
          <FieldGroup label="Insurer" required>
            <select value={form.insurer} onChange={e => handleInsurer(e.target.value)} style={baseSelect}>
              <option value="">Select insurer</option>
              {Object.keys(INSURER_PLANS).map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </FieldGroup>

          {/* PLAN */}
          {form.insurer && (
            <FieldGroup label="Plan" required>
              <select value={form.plan} onChange={e => set("plan")(e.target.value)} style={baseSelect}>
                <option value="">Select plan</option>
                {plans.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </FieldGroup>
          )}

          {form.plan && (
            <>
              {/* POLICY TYPE */}
              <FieldGroup label="Policy Type">
                <Seg value={form.policy} onChange={set("policy")} options={[
                  { value:"new",   label:"New"   },
                  { value:"port",  label:"Port"  },
                  { value:"renew", label:"Renew" },
                ]}/>
              </FieldGroup>

              {/* COVERAGE */}
              <FieldGroup label="Member Coverage">
                <Seg value={form.coverage} onChange={set("coverage")} options={[
                  { value:"individual",     label:"Individual" },
                  { value:"family floater", label:"Family"     },
                ]}/>
              </FieldGroup>

              {/* SUM INSURED */}
              <FieldGroup label="Sum Insured" required>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
                  {SI_OPTIONS.map(o => {
                    const a = form.si === String(o.value);
                    return (
                      <button key={o.value} onClick={() => set("si")(String(o.value))}
                        style={{ padding: "9px 4px", borderRadius: C.radiusSm,
                          border: `1.5px solid ${a ? C.blue : C.border}`,
                          background: a ? C.blueLight : "#fff",
                          color: a ? C.blue : C.text,
                          fontFamily: C.font, fontSize: "12px", fontWeight: a ? 700 : 400,
                          cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </FieldGroup>

              {/* AGE */}
              <FieldGroup label="Eldest Member Age" required>
                <input value={form.age} onChange={e => set("age")(e.target.value)}
                  placeholder="e.g. 40" type="number"
                  style={{ ...baseSelect, cursor: "text",
                    borderColor: error && !form.age ? C.red : C.border }}/>
                {form.age >= 60 && form.policy === "renew" && (
                  <div style={{ marginTop: "6px", padding: "7px 10px", background: C.blueLight,
                    borderRadius: C.radiusXs, fontSize: "11px", color: C.blue }}>
                    Age 60+ renewal — senior cap rate applies (7.5% max payout)
                  </div>
                )}
              </FieldGroup>

              {/* STATE + CITY — with inline hint */}
              {needsLocation && (
                <>
                  <div style={{ padding: "8px 10px", background: C.blueLight,
                    borderRadius: C.radiusXs, fontSize: "11px", color: C.blue,
                    marginBottom: "12px", lineHeight: 1.5 }}>
                    City is required for {form.insurer.split(" ")[0]} — it determines Preferred vs Non-Preferred payout rate
                  </div>
                  <FieldGroup label="State" required>
                    <select value={form.state}
                      onChange={e => setForm(f => ({ ...f, state: e.target.value, city: "" }))}
                      style={baseSelect}>
                      <option value="">Select state</option>
                      {Object.keys(STATE_CITIES).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FieldGroup>
                  {form.state && (
                    <FieldGroup label="City" required>
                      <select value={form.city} onChange={e => set("city")(e.target.value)} style={baseSelect}>
                        <option value="">Select city</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </FieldGroup>
                  )}
                </>
              )}

              {/* NET PREMIUM */}
              <FieldGroup label="Net Premium (Rs.)" required>
                <input value={form.premium} onChange={e => set("premium")(e.target.value)}
                  placeholder="e.g. 33290" type="number"
                  style={{ ...baseSelect, cursor: "text",
                    borderColor: error && !form.premium ? C.red : C.border }}/>
                <div style={{ marginTop: "5px", fontSize: "11px", color: C.hint }}>
                  Enter the net premium after all discounts
                </div>
              </FieldGroup>

              {error && (
                <div style={{ padding: "10px 12px", background: C.redLight, borderRadius: C.radiusXs,
                  fontSize: "12px", color: C.red, marginBottom: "14px", lineHeight: 1.5 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={calculate}
                  style={{ flex: 3, padding: "13px", borderRadius: C.radiusSm, border: "none",
                    background: C.red, color: "#fff", fontFamily: C.font, fontSize: "14px",
                    fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Calculating..." : "Calculate Payout"}
                </button>
                <button onClick={reset}
                  style={{ flex: 1, padding: "13px", borderRadius: C.radiusSm,
                    border: `1.5px solid ${C.border}`, background: C.card,
                    color: C.muted, fontFamily: C.font, fontSize: "13px",
                    fontWeight: 600, cursor: "pointer" }}>
                  Reset
                </button>
              </div>
            </>
          )}
        </div>

        {/* RESULT */}
        {result && (
          <div style={{ background: C.card, borderRadius: C.radius, padding: "18px",
            boxShadow: C.shadow, animation: "fadeUp 0.3s ease" }}>

            {/* Header with copy button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.05em" }}>Payout Estimate</div>
              <button onClick={() => {
                const txt = `Payout: ${result.outRate}% — Rs.${result.payoutAmt.toLocaleString("en-IN")} | ${form.insurer} | ${form.plan} | Rs.${Number(form.premium).toLocaleString("en-IN")} premium`;
                navigator.clipboard?.writeText(txt).catch(() => {});
              }} style={{ display: "flex", alignItems: "center", gap: "5px", background: C.blueLight,
                border: "none", borderRadius: C.radiusXs, padding: "6px 10px", cursor: "pointer",
                fontSize: "11px", color: C.blue, fontWeight: 600, fontFamily: C.font }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke={C.blue} strokeWidth="2"/>
                  <path d="M5 15H4C2.9 15 2 14.1 2 13V4C2 2.9 2.9 2 4 2H13C14.1 2 15 2.9 15 4V5"
                    stroke={C.blue} strokeWidth="2"/>
                </svg>
                Copy
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <div style={{ background: C.redLight, borderRadius: C.radiusSm, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: C.red, fontWeight: 600, letterSpacing: "0.05em",
                  textTransform: "uppercase", marginBottom: "6px" }}>Payout %</div>
                <div style={{ fontSize: "34px", fontWeight: 700, color: C.red, lineHeight: 1 }}>{result.outRate}%</div>
              </div>
              <div style={{ background: C.greenLight, borderRadius: C.radiusSm, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: C.green, fontWeight: 600, letterSpacing: "0.05em",
                  textTransform: "uppercase", marginBottom: "6px" }}>Payout (Rs.)</div>
                <div style={{ fontSize: "34px", fontWeight: 700, color: C.green, lineHeight: 1 }}>
                  {result.payoutAmt.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "12px" }}>
              {[
                { label: "Insurer",     value: form.insurer },
                { label: "Plan",        value: form.plan },
                { label: "Sum Insured", value: SI_OPTIONS.find(s => s.value === Number(form.si))?.label || form.si },
                { label: "Net Premium", value: "Rs." + Number(form.premium).toLocaleString("en-IN") },
                { label: "Payout %",    value: result.outRate + "%" },
                { label: "Payout",      value: "Rs." + result.payoutAmt.toLocaleString("en-IN") },
              ].map((r, i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between",
                  padding: "7px 0", borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: "12px", color: C.muted }}>{r.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: C.text,
                    textAlign: "right", maxWidth: "60%" }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "12px", padding: "10px 12px", background: C.bg,
              borderRadius: C.radiusXs, fontSize: "11px", color: C.muted, lineHeight: 1.6 }}>
              Base payout on Net Premium. Final payout subject to insurer guidelines and policy issuance.
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        select option { color: ${C.text}; }
        input::placeholder { color: ${C.hint} !important; font-weight: 400 !important; }
      `}</style>
    </div>
  );
}
