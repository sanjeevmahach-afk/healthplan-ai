import { useState, useMemo } from "react";

/* ── CONFIG ─────────────────────────────────────────────────── */
const CALC_URL = "https://script.google.com/macros/s/AKfycbxcf2Fg9GtszMdbq36m9q0ynfzlrnT0dG-Y2jiOFCp90S4cuSqgjaAHJS6bN2uKVrNU/exec";

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

const baseInp = {
  width:"100%", padding:"12px 14px", borderRadius:"9px",
  border:`1.5px solid #F0DEDE`, background:"#FAFAFA",
  fontFamily:"'Inter',sans-serif", fontSize:"15px",
  color:"#111", fontWeight:500, outline:"none",
  boxSizing:"border-box", WebkitAppearance:"none",
};

/* ── INSURER → PLANS ─────────────────────────────────────────── */
const INSURER_PLANS = {
  "Care Health Insurance Limited":                    ["Care Supreme Classic","Care Supreme Enhance","Care Supreme VFM","Care Joy","Care Arogya","Care SuperMediclaim","Care PA"],
  "Aditya Birla Health Insurance Co Ltd":             ["Activ One Max","Activ One Max Plus","Activ One Vytl","Activ Fit","Activ Health Platinum Enhanced","Activ Health Platinum Essential","Arogya Sanjeevani"],
  "Bajaj General Insurance Co. Ltd":                 ["Health Guard","Extra Care Plus","Personal Accident"],
  "Niva Bupa Health Insurance Co Ltd":               ["ReAssure 3.0","ReAssure 2.0","Gold","Gold Plus","Bronze","Bronze Plus","Aspire","Senior First"],
  "HDFC ERGO General Insurance Company":             ["Optima Secure","Optima Restore","my:health Suraksha","Personal Accident"],
  "ICICI Lombard":                                   ["Complete Health Insurance","Health Advantage","Max Protect","Personal Accident"],
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
  "Cigna Health Insurance Co Ltd":                   ["ProHealth Prime","ProHealth Plus","ProHealth Protect","ProHealth Senior","Lifetime","Sarvah","Accumulate","Super Top Up CI","Personal Accident"],
  "Genralli Central India Insurance Co Ltd":         ["Health Plan"],
  "IndusInd (Reliance General Insurance)":           ["Health Gain","Health Infinity","Health Global","Super Top Up","CI","Hospicare"],
  "United India Insurance Company Limited":          ["Individual Health","Family Medicare","Aarogya Sanjeevani","Super Top Up Medicare","Yuvaan"],
};

/* ── SI OPTIONS ──────────────────────────────────────────────── */
const SI_OPTIONS = [
  { label:"₹1L",       value:100000   },
  { label:"₹2L",       value:200000   },
  { label:"₹3L",       value:300000   },
  { label:"₹4L",       value:400000   },
  { label:"₹5L",       value:500000   },
  { label:"₹7.5L",     value:750000   },
  { label:"₹10L",      value:1000000  },
  { label:"₹15L",      value:1500000  },
  { label:"₹20L",      value:2000000  },
  { label:"₹25L",      value:2500000  },
  { label:"₹50L",      value:5000000  },
  { label:"₹1Cr",      value:10000000 },
  { label:"Unlimited", value:100000000},
];

/* ── INSURERS THAT NEED LOCATION ─────────────────────────────── */
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

/* ── HELPERS ─────────────────────────────────────────────────── */
const Label = ({ children }) => (
  <div style={{ fontSize:"11px", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:C.muted, marginBottom:"8px" }}>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom:"18px" }}>
    <Label>{label}</Label>
    {children}
  </div>
);

const Seg = ({ options, value, onChange, small }) => (
  <div style={{ display:"flex", background:"#EFEFEF", borderRadius:"9px", padding:"3px", gap:"2px", flexWrap: small ? "wrap" : "nowrap" }}>
    {options.map(o => {
      const a = value === o.value;
      return (
        <button key={o.value} onClick={() => onChange(o.value)}
          style={{ flex:1, padding: small ? "7px 4px" : "9px 4px", borderRadius:"7px", border:"none",
            background: a ? "#fff" : "transparent",
            color: a ? C.text : C.muted,
            fontFamily:"'Inter',sans-serif", fontSize: small ? "12px" : "13px", fontWeight: a ? 600 : 400,
            cursor:"pointer", transition:"all 0.12s",
            boxShadow: a ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            WebkitTapHighlightColor:"transparent", whiteSpace:"nowrap",
          }}>
          {o.label}
        </button>
      );
    })}
  </div>
);

const SelectInput = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ ...baseInp, cursor:"pointer" }}>
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

/* ── MAIN ────────────────────────────────────────────────────── */
export default function CommissionCalculator({ onBack }) {
  const [form, setForm] = useState({
    insurer:  "",
    plan:     "",
    planType: "health",
    si:       "",
    age:      "",
    state:    "",
    city:     "",
    policy:   "new",
    coverage: "family floater",
    premium:  "",
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const needsLocation = LOCATION_INSURERS.includes(form.insurer);
  const plans = form.insurer ? (INSURER_PLANS[form.insurer] || []) : [];
  const cities = form.state ? (STATE_CITIES[form.state] || []) : [];

  function handleInsurerChange(val) {
    setForm(f => ({ ...f, insurer: val, plan: "", state: "", city: "" }));
    setResult(null);
  }

  async function calculate() {
    const { insurer, plan, si, age, policy, coverage, premium } = form;
    if (!insurer)  { setError("Please select an insurer.");  return; }
    if (!plan)     { setError("Please select a plan.");      return; }
    if (!si)       { setError("Please select sum insured."); return; }
    if (!age)      { setError("Please enter member age.");   return; }
    if (!premium)  { setError("Please enter net premium.");  return; }
    if (needsLocation && !form.city) { setError("Please select city."); return; }

    setError(""); setResult(null); setLoading(true);

    try {
      const isPlanPA = plan.toLowerCase().includes("personal accident") || plan.toLowerCase().includes("pa)") || plan.toLowerCase().includes("accident guard");
      const params = new URLSearchParams({
        insurer:  insurer,
        plan:     plan,
        planType: isPlanPA ? "personal accident" : form.planType,
        si:       si,
        age:      age,
        city:     form.city || "rest of india",
        policy:   policy,
        coverage: coverage,
        premium:  premium,
      });
      const resp = await fetch(`${CALC_URL}?${params.toString()}`);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const json = await resp.json();
      if (json.error) { setError(json.error); setLoading(false); return; }
      setResult(json);
    } catch (e) {
      setError("Could not calculate. Please try again.");
    }
    setLoading(false);
  }

  function reset() {
    setForm({ insurer:"", plan:"", planType:"health", si:"", age:"", state:"", city:"", policy:"new", coverage:"family floater", premium:"" });
    setResult(null); setError("");
  }

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:C.bg, minHeight:"100vh", paddingBottom:"60px" }}>

      {/* HEADER */}
      <div style={{ background:C.accent, padding:"22px 20px 28px", textAlign:"center", position:"relative" }}>
        {onBack && (
          <div onClick={onBack} style={{ position:"absolute", left:"16px", top:"22px", fontSize:"13px", fontWeight:600, color:"rgba(255,255,255,0.85)", cursor:"pointer" }}>
            ← Back
          </div>
        )}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"10px" }}>
          <img src="https://www.google.com/s2/favicons?domain=insurancedekho.com&sz=128" alt="" style={{ height:"28px", width:"28px", borderRadius:"6px" }}/>
          <div style={{ fontSize:"12px", fontWeight:700, color:"rgba(255,255,255,0.85)" }}>InsuranceDekho</div>
        </div>
        <div style={{ fontSize:"clamp(22px,6vw,30px)", fontWeight:700, color:"#fff", lineHeight:1.1 }}>
          Base Payout <span style={{ color:"#FFE082" }}>Calculator</span>
        </div>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.75)", marginTop:"6px" }}>
          Estimate your base commission before selling
        </div>
      </div>

      <div style={{ maxWidth:"480px", margin:"0 auto", padding:"16px 16px" }}>
        <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"18px", marginBottom:"10px" }}>

          {/* INSURER */}
          <Field label="Insurer">
            <SelectInput
              value={form.insurer}
              onChange={handleInsurerChange}
              options={Object.keys(INSURER_PLANS)}
              placeholder="Select insurer…"
            />
          </Field>

          {/* PLAN — only show after insurer selected */}
          {form.insurer && (
            <Field label="Plan Name">
              <SelectInput
                value={form.plan}
                onChange={v => { set("plan")(v); setResult(null); }}
                options={plans}
                placeholder="Select plan…"
              />
            </Field>
          )}

          {/* POLICY TYPE */}
          {form.plan && (
            <Field label="Policy Type">
              <Seg value={form.policy} onChange={set("policy")} options={[
                { value:"new",   label:"New"   },
                { value:"port",  label:"Port"  },
                { value:"renew", label:"Renew" },
              ]}/>
            </Field>
          )}

          {/* MEMBER COVERAGE */}
          {form.plan && (
            <Field label="Member Coverage">
              <Seg value={form.coverage} onChange={set("coverage")} options={[
                { value:"individual",     label:"Individual" },
                { value:"family floater", label:"Family"     },
              ]}/>
            </Field>
          )}

          {/* SUM INSURED */}
          {form.plan && (
            <Field label="Sum Insured">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"6px" }}>
                {SI_OPTIONS.map(o => {
                  const a = form.si === String(o.value);
                  return (
                    <button key={o.value} onClick={() => { set("si")(String(o.value)); setResult(null); }}
                      style={{ padding:"8px 4px", borderRadius:"8px",
                        border: a ? `1.5px solid ${C.accent}` : `1.5px solid ${C.border}`,
                        background: a ? C.accentLight : "#FAFAFA",
                        color: a ? C.accent : C.text,
                        fontFamily:"'Inter',sans-serif", fontSize:"12px", fontWeight: a ? 700 : 400,
                        cursor:"pointer", WebkitTapHighlightColor:"transparent",
                      }}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

          {/* AGE */}
          {form.plan && (
            <Field label="Eldest Member Age">
              <input value={form.age} onChange={e => set("age")(e.target.value)} placeholder="e.g. 40" type="number" style={baseInp}/>
            </Field>
          )}

          {/* STATE + CITY — only for 4 specific insurers */}
          {form.plan && needsLocation && (
            <>
              <Field label="State">
                <SelectInput
                  value={form.state}
                  onChange={v => { setForm(f => ({ ...f, state: v, city: "" })); }}
                  options={Object.keys(STATE_CITIES)}
                  placeholder="Select state…"
                />
              </Field>
              {form.state && (
                <Field label="City">
                  <SelectInput
                    value={form.city}
                    onChange={set("city")}
                    options={cities}
                    placeholder="Select city…"
                  />
                </Field>
              )}
            </>
          )}

          {/* NET PREMIUM */}
          {form.plan && (
            <Field label="Net Premium (₹)">
              <input value={form.premium} onChange={e => set("premium")(e.target.value)} placeholder="e.g. 33290" type="number" style={baseInp}/>
            </Field>
          )}

          {error && (
            <div style={{ padding:"10px 12px", background:C.accentLight, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, fontSize:"12px", color:C.accentText, marginBottom:"14px" }}>
              ❌ {error}
            </div>
          )}

          {form.plan && (
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={calculate} style={{ flex:3, padding:"13px", borderRadius:C.radiusSm, border:"none", background:C.accent, color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"14px", fontWeight:700, cursor:"pointer" }}>
                {loading ? "Calculating…" : "Calculate Payout →"}
              </button>
              <button onClick={reset} style={{ flex:1, padding:"13px", borderRadius:C.radiusSm, border:`1.5px solid ${C.border}`, background:C.card, color:C.muted, fontFamily:"'Inter',sans-serif", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
                Reset
              </button>
            </div>
          )}
        </div>

        {/* RESULT */}
        {result && (
          <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"18px", marginBottom:"10px", animation:"fadeUp 0.3s ease" }}>
            <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:C.muted, marginBottom:"16px" }}>
              Payout Estimate
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"14px" }}>
              <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, padding:"16px", textAlign:"center" }}>
                <div style={{ fontSize:"10px", color:C.muted, fontWeight:600, letterSpacing:"1px", marginBottom:"6px" }}>PAYOUT %</div>
                <div style={{ fontSize:"36px", fontWeight:700, color:C.accent, lineHeight:1 }}>{result.outRate}%</div>
              </div>
              <div style={{ background:"#F0FDF4", border:"1.5px solid #86efac", borderRadius:C.radiusSm, padding:"16px", textAlign:"center" }}>
                <div style={{ fontSize:"10px", color:C.muted, fontWeight:600, letterSpacing:"1px", marginBottom:"6px" }}>PAYOUT (₹)</div>
                <div style={{ fontSize:"36px", fontWeight:700, color:C.green, lineHeight:1 }}>₹{result.payoutAmt.toLocaleString("en-IN")}</div>
              </div>
            </div>

            <div style={{ background:C.accentLight, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, padding:"12px 14px" }}>
              {[
                { label:"Insurer",     value: form.insurer },
                { label:"Plan",        value: form.plan },
                { label:"Sum Insured", value: SI_OPTIONS.find(s => s.value === Number(form.si))?.label || form.si },
                { label:"Net Premium", value: "₹" + Number(form.premium).toLocaleString("en-IN") },
                { label:"Payout %",   value: result.outRate + "%" },
                { label:"Payout ₹",   value: "₹" + result.payoutAmt.toLocaleString("en-IN") },
              ].map((r, i, arr) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize:"12px", color:C.muted }}>{r.label}</span>
                  <span style={{ fontSize:"12px", fontWeight:600, color:C.text, textAlign:"right", maxWidth:"65%" }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop:"10px", padding:"10px 12px", background:C.bg, borderRadius:C.radiusSm, border:`1px solid ${C.border}` }}>
              <p style={{ color:C.muted, fontSize:"11px", margin:0, lineHeight:1.6 }}>
                ⚠️ Base payout calculated on Net Premium. Final payout subject to insurer guidelines and policy issuance.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
        input { color:#111 !important; font-weight:600 !important; }
        input::placeholder { color:#aaa !important; font-weight:400 !important; }
        select { color:#111 !important; }
        body { margin:0; background:${C.bg}; }
      `}</style>
    </div>
  );
}
