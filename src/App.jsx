import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════
   PAYOUT RATES (from Apps Script commission grid)
   Format: { fresh: "X%", port: "Y%" }
   SI assumed ≥ 10L (most common recommendation case)
═══════════════════════════════════════════════════════════════ */
const PAYOUT = {
  // Rates from Apps Script commission grid · SI ≥ 10L · Family floater · Fresh/Port
  "Niva Reassure 3.0":           { fresh: "23%", port: "20%" },  // ReAssure 3.0, 10L–1Cr slab
  "Niva Aspire":                 { fresh: "23%", port: "13%" },  // Default Niva rates, ≥10L
  "HDFC Optima Secure":          { fresh: "25%", port: "15%" },  // Family, preferred city, ≥10L
  "ICICI Elevate":               { fresh: "25%", port: "12%" },  // ICICI health fresh/port
  "TATA Medicare Select":        { fresh: "27%", port: "12%" },  // Medicare Select ≥10L
  "Star Assure":                 { fresh: "25%", port: "15%" },  // Star standard grid
  "Care Supreme":                { fresh: "22%", port: "15%" },  // Supreme/Classic row
  "Care Freedom":                { fresh: "22%", port: "15%" },  // General Care row
  "Care Heart / Star Cardiac":   { fresh: "22%", port: "15%" },  // Care row
  "Star Cancer Care":            { fresh: "25%", port: "15%" },  // Star standard grid
  "Reliance Health Gain":        { fresh: "23%", port: "15%" },  // Health Gain, ≥10L, rest of India
  "Reliance Health Infinity":    { fresh: "23%", port: "15%" },  // Health Infinity, same grid
  "Aditya Birla Active One Max": { fresh: "30%", port: "15%" },  // AB ≥10L slab
  "Aditya Birla Active One Vytl":{ fresh: "30%", port: "15%" },  // AB ≥10L slab
  "SBI Health Alpha":            { fresh: "35%", port: "10%" },  // SBI Alpha, >10L, rest of India
};

/* ═══════════════════════════════════════════════════════════════
   PLANS DATA
═══════════════════════════════════════════════════════════════ */
const PLANS_DATA = {
  "Niva Reassure 3.0":           { insurer:"Niva Bupa",      pedWaiting:"Day 1",                         copay:"No",      roomRent:"No Cap",              ncb:"Unlimited",             maxAge:99, premiumRange:"High",     medicals:"PPMC (in absence of reports)", specialFeatures:["Lock the Age","OPD covered (Optional)","Day 1 PED covered","Unlimited SI"] },
  "HDFC Optima Secure":          { insurer:"HDFC",           pedWaiting:"3 years",                       copay:"No",      roomRent:"No Cap",              ncb:"50% to 100%",           maxAge:65, premiumRange:"Very High", medicals:"PPMC (in absence of reports)", specialFeatures:["2X Cover from Day 1","Loading relaxation on single PED"] },
  "ICICI Elevate":               { insurer:"ICICI",          pedWaiting:"3 yrs (30-day jumpstart opt.)", copay:"No",      roomRent:"Single Pvt. AC room", ncb:"20% to 100%",           maxAge:65, premiumRange:"High",     medicals:"PPMC (in absence of reports)", specialFeatures:["Unlimited claim (Infinite Care)","Day 30 PED Jumpstart","Worldwide cover after 2 yrs","2-hour hospitalisation"] },
  "TATA Medicare Select":        { insurer:"TATA AIG",       pedWaiting:"3 years",                       copay:"No",      roomRent:"Single Pvt. AC room", ncb:"50% to 100%",           maxAge:65, premiumRange:"High",     medicals:"PPMC (in absence of reports)", specialFeatures:["Unlimited claim (Infinite Advantage)","7.5% discount for salaried","Day 30 PED Advance Cover Rider","Women & mental wellbeing rider"] },
  "Star Assure":                 { insurer:"Star",           pedWaiting:"3 yrs (2.5 yr for 3-yr tenure)",copay:"10% if age>60",roomRent:"5L:1%, >5L:Any except Suite",ncb:"25%–100% (non-reducing)", maxAge:75, premiumRange:"Medium", medicals:"No PPMC", specialFeatures:["Consumables inbuilt","No sublimits","Aggregate deductible (45% discount)","Unlimited restoration"] },
  "Care Supreme":                { insurer:"Care",           pedWaiting:"4 yrs (Rider: 1 yr)",           copay:"No",      roomRent:"No Cap",              ncb:"50% to 600%",           maxAge:99, premiumRange:"High",     medicals:"No PPMC",                      specialFeatures:["No loading","Super NCB","Instant Cover rider","PED Modification rider"] },
  "Reliance Health Gain":        { insurer:"Reliance",       pedWaiting:"3 years",                       copay:"No",      roomRent:"Any",                 ncb:"100% to 500%",          maxAge:55, premiumRange:"Very Low", medicals:"No PPMC",                      specialFeatures:["Multi-year discounts for healthy people"] },
  "Niva Aspire":                 { insurer:"Niva Bupa",      pedWaiting:"3 years",                       copay:"No",      roomRent:"No Cap",              ncb:"100% to 1000%",         maxAge:65, premiumRange:"Very High",medicals:"PPMC (in absence of reports)", specialFeatures:["Lock the Age","Maternity (9 months)","Global cover (Borderless)","OPD Well Consult","Future spouse Day 1 cover"] },
  "Aditya Birla Active One Max": { insurer:"Aditya Birla",   pedWaiting:"3 years",                       copay:"No",      roomRent:"No Cap",              ncb:"100% to 500%",          maxAge:99, premiumRange:"High",     medicals:"PPMC above 60",                specialFeatures:["Chronic Care Day 1 (7 listed)","100% health returns","Consumables inbuilt","Health checkup inbuilt"] },
  "SBI Health Alpha":            { insurer:"SBI",            pedWaiting:"3 years",                       copay:"No",      roomRent:"Any",                 ncb:"100% to 500%",          maxAge:99, premiumRange:"Very Low", medicals:"No PPMC",                      specialFeatures:["Wellness discount 100%","Very affordable premium"] },
  "Care Freedom":                { insurer:"Care",           pedWaiting:"2 years",                       copay:"20%",     roomRent:"1%, Twin, Single",    ncb:"None",                  maxAge:99, premiumRange:"High",     medicals:"Yes (Subject to UW)",          specialFeatures:["100% Restoration","Ideal for multiple co-morbidities"] },
  "Care Heart / Star Cardiac":   { insurer:"Care / Star",    pedWaiting:"Varies",                        copay:"Varies",  roomRent:"Varies",              ncb:"Varies",                maxAge:99, premiumRange:"High",     medicals:"Yes (Subject to UW)",          specialFeatures:["Specialized cardiac coverage"] },
  "Star Cancer Care":            { insurer:"Star",           pedWaiting:"Varies (subject to UW)",        copay:"No",      roomRent:"No Cap",              ncb:"Varies",                maxAge:99, premiumRange:"High",     medicals:"Yes (Subject to UW)",          specialFeatures:["Specialized cancer coverage","Final issuance depends on UW decision"] },
  "Aditya Birla Active One Vytl":{ insurer:"Aditya Birla",   pedWaiting:"3 years",                       copay:"No",      roomRent:"No Cap",              ncb:"50% to 100%",           maxAge:99, premiumRange:"Medium",   medicals:"PPMC above 60",                specialFeatures:["Chronic Care Day 1","Affordable Active One variant"] },
  "Reliance Health Infinity":    { insurer:"Reliance",       pedWaiting:"3 years",                       copay:"No",      roomRent:"Any",                 ncb:"100% to 500%",          maxAge:65, premiumRange:"Low",      medicals:"No PPMC",                      specialFeatures:["Affordable for age 40–55","Good for maternity planning"] },
};

/* ═══════════════════════════════════════════════════════════════
   RECOMMENDATION TABLE (from Excel sheet)
═══════════════════════════════════════════════════════════════ */
const REC_TABLE = {
  none_u40:         { low:["TATA Medicare Select","ICICI Elevate","Niva Aspire"],          value:["TATA Medicare Select","ICICI Elevate","Niva Aspire"],             premium:["Niva Reassure 3.0","HDFC Optima Secure"],                     note:"" },
  none_40_55:       { low:["Reliance Health Gain","Niva Aspire"],                          value:["ICICI Elevate","Niva Reassure 3.0","TATA Medicare Select"],        premium:["Niva Reassure 3.0","HDFC Optima Secure"],                     note:"" },
  none_55plus:      { low:["ICICI Elevate","Aditya Birla Active One Max","Niva Aspire"],   value:["Aditya Birla Active One Max","Niva Reassure 3.0","ICICI Elevate"], premium:["Niva Reassure 3.0","HDFC Optima Secure"],                     note:"" },
  diab_low:         { low:["TATA Medicare Select","ICICI Elevate","Niva Aspire"],          value:["TATA Medicare Select","ICICI Elevate","Niva Aspire"],             premium:["Niva Reassure 3.0","HDFC Optima Secure","Care Supreme"],       note:"Loading may apply on some plans" },
  diab_high:        { low:["SBI Health Alpha","Aditya Birla Active One Max"],              value:["SBI Health Alpha","Aditya Birla Active One Max"],                premium:["Aditya Birla Active One Max","Care Supreme"],                 note:"Individual plans only" },
  diab_ins:         { low:["SBI Health Alpha","Care Freedom"],                             value:["SBI Health Alpha","Care Freedom"],                               premium:["SBI Health Alpha","Care Freedom"],                            note:"Subject to underwriting. Very limited options for insulin-dependent" },
  bp:               { low:["TATA Medicare Select","ICICI Elevate","Star Assure"],          value:["TATA Medicare Select","ICICI Elevate","Star Assure"],             premium:["Niva Reassure 3.0","HDFC Optima Secure","Care Supreme"],       note:"Loading may apply" },
  bp_diab:          { low:["TATA Medicare Select","ICICI Elevate","Star Assure"],          value:["TATA Medicare Select","ICICI Elevate","Star Assure"],             premium:["Niva Reassure 3.0","Care Supreme"],                           note:"" },
  asthma:           { low:["Aditya Birla Active One Max"],                                 value:["ICICI Elevate"],                                                 premium:["Niva Reassure 3.0","HDFC Optima Secure","Care Supreme"],       note:"" },
  copd:             { low:["Aditya Birla Active One Max"],                                 value:["Care Supreme"],                                                  premium:["Niva Reassure 3.0"],                                          note:"" },
  liver:            { low:["Aditya Birla Active One Max"],                                 value:["Care Supreme"],                                                  premium:["Niva Reassure 3.0"],                                          note:"" },
  heart:            { low:["Aditya Birla Active One Max","Niva Reassure 3.0"],             value:["Aditya Birla Active One Max"],                                   premium:["Care Heart / Star Cardiac"],                                  note:"Depends on severity. UW decision applies." },
  kidney:           { low:["Aditya Birla Active One Max","Niva Reassure 3.0"],             value:["Aditya Birla Active One Max"],                                   premium:["Care Freedom"],                                               note:"" },
  cancer_cured:     { low:["Star Cancer Care","Care Freedom"],                             value:["Star Cancer Care","Care Freedom"],                               premium:["Star Cancer Care"],                                           note:"Final issuance depends on UW decision" },
  surgery_treated:  { low:["Star Assure","Aditya Birla Active One Max","Care Supreme"],     value:["Star Assure","Niva Reassure 3.0","Aditya Birla Active One Max"],  premium:["Niva Reassure 3.0","Care Freedom"],                          note:"Cataract, kidney stone, rod implant etc." },
  surgery_untreated:{ low:["SBI Health Alpha","Aditya Birla Active One Max","Care Supreme"],value:["Care Supreme","Aditya Birla Active One Max"],                    premium:["Niva Reassure 3.0","Care Freedom"],                           note:"Kidney stones, gall bladder, piles, cataract etc." },
  mental:           { low:["SBI Health Alpha","Aditya Birla Active One Max"],              value:["SBI Health Alpha","Aditya Birla Active One Max"],                premium:["Care Freedom"],                                               note:"Final issuance depends on UW decision" },
  hyperthyroid:     { low:["SBI Health Alpha"],                                            value:["HDFC Optima Secure"],                                            premium:["Care Freedom"],                                               note:"Final issuance depends on UW decision" },
  rheumatoid:       { low:["SBI Health Alpha","Care Freedom"],                             value:["Care Freedom"],                                                  premium:["Care Freedom"],                                               note:"Final issuance depends on UW decision" },
  maternity:        { low:["SBI Health Alpha","Star Assure","Niva Aspire"],                value:["Niva Aspire","TATA Medicare Select"],                            premium:["Niva Aspire","Reliance Health Gain"],                         note:"" },
};

const PED_KEY_MAP = {
  diabetes_tab_low:"diab_low", diabetes_tab_high:"diab_high", diabetes_insulin:"diab_ins",
  bp:"bp", bp_diab:"bp_diab", asthma:"asthma", copd:"copd", liver:"liver",
  heart:"heart", kidney:"kidney", cancer_cured:"cancer_cured",
  surgery_treated:"surgery_treated", surgery_untreated:"surgery_untreated",
  mental:"mental", hyperthyroid:"hyperthyroid", rheumatoid:"rheumatoid", maternity:"maternity",
};

function getPedKey(ped, age) {
  if (ped === "none") {
    if (age < 40) return "none_u40";
    if (age <= 55) return "none_40_55";
    return "none_55plus";
  }
  return PED_KEY_MAP[ped] || "none_u40";
}

function mergePedRows(keys) {
  if (keys.length === 1) return REC_TABLE[keys[0]] || REC_TABLE["none_u40"];
  const rows = keys.map(k => REC_TABLE[k] || REC_TABLE["none_u40"]);
  const allPlans = [...new Set(rows.flatMap(r => [...r.low,...r.value,...r.premium]))];
  const scores = {};
  allPlans.forEach(p => {
    scores[p] = rows.reduce((acc, r) => {
      if (r.low.includes(p))     return acc + 3;
      if (r.value.includes(p))   return acc + 2;
      if (r.premium.includes(p)) return acc + 1;
      return acc - 2;
    }, 0);
  });
  const sorted = allPlans.filter(p => scores[p] > 0).sort((a,b) => scores[b]-scores[a]);
  const notes = [...new Set(rows.map(r => r.note).filter(Boolean))].join(" • ");
  return { low:sorted.slice(0,3), value:sorted.slice(0,3), premium:sorted.slice(0,3), note:notes };
}

function getRecommendations(form) {
  const { age, ped, bmi, budget, maternity } = form;
  const ageNum = parseInt(age) || 30;
  const bmiNum = parseFloat(bmi) || 0;
  const effectivePed = (!ped || ped === "none") ? (maternity === "yes" ? "maternity" : "none") : ped;
  const key = getPedKey(effectivePed, ageNum);
  const row = REC_TABLE[key] || REC_TABLE["none_u40"];
  let ordered = [];
  if (budget === "low")       ordered = [...row.low,   ...row.value,  ...row.premium];
  else if (budget === "high") ordered = [...row.premium,...row.value, ...row.low];
  else                        ordered = [...row.value,  ...row.low,   ...row.premium];
  const seen = new Set();
  const candidates = ordered.filter(n => { if (seen.has(n)) return false; seen.add(n); return true; });
  const eligible = candidates.filter(name => {
    const plan = PLANS_DATA[name];
    if (!plan) return false;
    if (bmiNum > 0 && bmiNum > 40) return false; // hard cap
    if (ageNum > plan.maxAge) return false;
    return true;
  });
  const buildReasons = (name) => {
    const r = [];
    if (row.low.includes(name))     r.push("Budget-friendly option");
    if (row.value.includes(name))   r.push("Best value for money");
    if (row.premium.includes(name)) r.push("Premium coverage");
    if (row.note)                   r.push(row.note);
    return r.slice(0, 3);
  };
  return eligible.slice(0,3).map(name => ({ name, ...PLANS_DATA[name], reasons:buildReasons(name) }));
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const calcBMI = (h,w) => { const hm=parseFloat(h)/100,wk=parseFloat(w); if(!hm||!wk||hm<=0) return null; return parseFloat((wk/(hm*hm)).toFixed(1)); };
const bmiMeta = b => { if(!b) return null; if(b<18.5) return{label:"Underweight",color:"#3b82f6"}; if(b<25) return{label:"Normal",color:"#10b981"}; if(b<30) return{label:"Overweight",color:"#f59e0b"}; return{label:"Obese",color:"#ef4444"}; };
const premBadge = r => ({"Very Low":["#f0fdf4","#15803d"],"Low":["#f0fdf4","#166534"],"Medium":["#fefce8","#92400e"],"High":["#fff7ed","#c2410c"],"Very High":["#fdf2f8","#9d174d"]}[r]||["#f9fafb","#374151"]);

const PED_OPTIONS = [
  {value:"none",              label:"No PED",                  group:""},
  {value:"diabetes_tab_low",  label:"Diabetes (Tab, HbA1c ≤ 8)",group:"Diabetes"},
  {value:"diabetes_tab_high", label:"Diabetes (Tab, HbA1c > 8)",group:"Diabetes"},
  {value:"diabetes_insulin",  label:"Diabetes (Insulin)",       group:"Diabetes"},
  {value:"bp",                label:"Blood Pressure",           group:"Cardio"},
  {value:"bp_diab",           label:"BP + Diabetes",            group:"Cardio"},
  {value:"heart",             label:"Heart Condition",          group:"Cardio"},
  {value:"kidney",            label:"Kidney Condition",         group:"Organ"},
  {value:"liver",             label:"Liver Related",            group:"Organ"},
  {value:"cancer_cured",      label:"Cancer (Cured)",           group:"Serious"},
  {value:"surgery_treated",   label:"Surgery (Treated)",        group:"Serious"},
  {value:"surgery_untreated", label:"Surgery (Untreated)",      group:"Serious"},
  {value:"mental",            label:"Mental Illness",           group:"Other"},
  {value:"rheumatoid",        label:"Rheumatoid Arthritis",     group:"Other"},
  {value:"hyperthyroid",      label:"Hyperthyroid",             group:"Other"},
  {value:"asthma",            label:"Asthma",                   group:"Other"},
  {value:"copd",              label:"COPD",                     group:"Other"},
];

// Prevent selecting both HbA1c variants simultaneously
const MUTUALLY_EXCLUSIVE = [
  ["diabetes_tab_low","diabetes_tab_high"],
];

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════ */
const C = {
  bg:"#FDF6F6", card:"#FFFFFF", border:"#F0DEDE",
  text:"#111111", sub:"#555555", muted:"#999999",
  accent:"#E53935", accentLight:"#FFF0F0", accentText:"#C62828",
  green:"#059669", radius:"14px", radiusSm:"9px",
};

/* ═══════════════════════════════════════════════════════════════
   UI COMPONENTS
═══════════════════════════════════════════════════════════════ */
const Label = ({children}) => (
  <div style={{fontSize:"11px",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:C.muted,marginBottom:"8px"}}>
    {children}
  </div>
);

const Field = ({label,hint,children}) => (
  <div style={{marginBottom:"20px"}}>
    <Label>{label}</Label>
    {children}
    {hint && <div style={{fontSize:"11px",color:C.muted,marginTop:"5px"}}>{hint}</div>}
  </div>
);

const baseInp = {width:"100%",padding:"12px 14px",borderRadius:C.radiusSm,border:`1.5px solid ${C.border}`,background:"#FAFAFA",fontFamily:"'Inter',sans-serif",fontSize:"15px",color:"#111111",fontWeight:500,outline:"none",boxSizing:"border-box",WebkitAppearance:"none"};

const TInput = ({value,onChange,placeholder,type="text"}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} inputMode={type==="number"?"decimal":"text"} style={baseInp}/>
);

/* Segmented control */
const Seg = ({options,value,onChange}) => (
  <div style={{display:"flex",background:"#EFEFEF",borderRadius:"9px",padding:"3px",gap:"2px"}}>
    {options.map(o=>{
      const a=value===o.value;
      return <button key={o.value} onClick={()=>onChange(o.value)} style={{flex:1,padding:"9px 4px",borderRadius:"7px",border:"none",background:a?"#fff":"transparent",color:a?C.text:C.muted,fontFamily:"'Inter',sans-serif",fontSize:"13px",fontWeight:a?600:400,cursor:"pointer",transition:"all 0.12s",boxShadow:a?"0 1px 3px rgba(0,0,0,0.1)":"none",WebkitTapHighlightColor:"transparent"}}>{o.emoji&&<span style={{marginRight:"4px"}}>{o.emoji}</span>}{o.label}</button>;
    })}
  </div>
);

/* Pill row */
const PillRow = ({options,value,onChange}) => (
  <div style={{display:"flex",flexWrap:"wrap",gap:"7px"}}>
    {options.map(o=>{
      const a=value===o.value;
      return <button key={o.value} onClick={()=>onChange(o.value)} style={{padding:"8px 15px",borderRadius:"30px",border:a?`1.5px solid ${C.accent}`:`1.5px solid ${C.border}`,background:a?C.accentLight:"#FAFAFA",color:a?C.accent:C.text,fontFamily:"'Inter',sans-serif",fontSize:"13px",fontWeight:a?600:400,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>{o.emoji&&<span style={{marginRight:"5px"}}>{o.emoji}</span>}{o.label}</button>;
    })}
  </div>
);

/* PED multi-select grid with mutual exclusion */
const PedSelector = ({value,onChange}) => {
  const toggle = (v) => {
    if (v === "none") { onChange(["none"]); return; }
    let next = (value||[]).filter(x=>x!=="none");
    // Remove mutually exclusive counterpart
    MUTUALLY_EXCLUSIVE.forEach(group => {
      if (group.includes(v)) next = next.filter(x=>!group.includes(x));
    });
    if (next.includes(v)) next = next.filter(x=>x!==v);
    else if (next.length < 2) next = [...next, v];
    onChange(next.length===0?["none"]:next);
  };
  const selected = (value||[]).filter(p=>p!=="none");
  const groups = [...new Set(PED_OPTIONS.filter(o=>o.group).map(o=>o.group))];
  return (
    <div>
      {/* No PED option */}
      {[PED_OPTIONS[0]].map(o=>{
        const a=(value||[]).includes(o.value);
        return (
          <button key={o.value} onClick={()=>toggle(o.value)} style={{width:"100%",padding:"11px 14px",borderRadius:C.radiusSm,border:a?`1.5px solid ${C.accent}`:`1.5px solid ${C.border}`,background:a?C.accentLight:"#FAFAFA",color:a?C.accent:C.text,fontFamily:"'Inter',sans-serif",fontSize:"14px",fontWeight:a?600:400,cursor:"pointer",marginBottom:"12px",textAlign:"left",WebkitTapHighlightColor:"transparent"}}>
            {a&&<span style={{marginRight:"6px"}}>✓</span>}No Pre-existing Disease
          </button>
        );
      })}
      {/* Grouped options */}
      {groups.map(grp=>(
        <div key={grp} style={{marginBottom:"12px"}}>
          <div style={{fontSize:"10px",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"6px"}}>{grp}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
            {PED_OPTIONS.filter(o=>o.group===grp).map(o=>{
              const a=(value||[]).includes(o.value);
              const disabled = selected.length>=2 && !a;
              return (
                <button key={o.value} onClick={()=>!disabled&&toggle(o.value)} style={{padding:"9px 11px",borderRadius:C.radiusSm,textAlign:"left",border:a?`1.5px solid ${C.accent}`:`1.5px solid ${C.border}`,background:a?C.accentLight:disabled?"#F8F8F8":"#FAFAFA",color:a?C.accent:disabled?C.muted:C.text,fontFamily:"'Inter',sans-serif",fontSize:"12px",fontWeight:a?600:400,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,WebkitTapHighlightColor:"transparent"}}>
                  {a&&<span style={{marginRight:"5px",fontSize:"10px"}}>✓</span>}{o.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{fontSize:"11px",color:C.muted,marginTop:"4px"}}>
        {selected.length}/2 selected · Select up to 2 conditions
      </div>
    </div>
  );
};

const InfoRow = ({label,value}) => (
  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,gap:"12px"}}>
    <span style={{fontSize:"11px",color:C.muted,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",flexShrink:0}}>{label}</span>
    <span style={{fontSize:"13px",fontWeight:500,color:C.text,textAlign:"right"}}>{value}</span>
  </div>
);

const STEPS = ["Basics","Health","Cover","Results"];

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [step,setStep]           = useState(0);
  const [form,setForm]           = useState({age:"",height:"",weight:"",peds:["none"],hba1c:"",familySize:"2a",maternity:"no",budget:"medium",isPort:"no",city:"tier1",sumInsured:"10"});
  const [results,setResults]     = useState(null);
  const [loading,setLoading]     = useState(false);
  const [aiInsight,setAiInsight] = useState("");
  const [expanded,setExpanded]   = useState(null);

  const set = k => v => setForm(f=>({...f,[k]:v}));
  const bmi = calcBMI(form.height,form.weight);
  const bmiInfo = bmiMeta(bmi);
  const hasDiab = (form.ped||"").startsWith("diabetes");

  useEffect(()=>{ window.scrollTo({top:0,behavior:"smooth"}); },[step]);

  const handleGenerate = async () => {
    setLoading(true); setResults(null); setAiInsight(""); setExpanded(null);
    setStep(3);
    const recs = getRecommendations({...form,bmi});
    setResults(recs);

    // ── LOG TO GOOGLE SHEETS ──
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbzChn1PRSOBEBN8TZ8U03nsUK833NvOqfqCR93g4dyD7d4CUwCPh40jOFX5HLqNbsg/exec";
    try {
      const params = new URLSearchParams({
        age:        form.age        || "",
        bmi:        bmi             || "",
        city:       form.city       || "",
        isPort:     form.isPort     || "",
        ped:        form.ped        || "",
        hba1c:      form.hba1c      || "",
        familySize: form.familySize || "",
        maternity:  form.maternity  || "",
        budget:     form.budget     || "",
        sumInsured: form.sumInsured || "",
        plan1:      recs[0]?.name   || "",
        plan2:      recs[1]?.name   || "",
        plan3:      recs[2]?.name   || "",
      });
      fetch(`${SHEET_URL}?${params.toString()}`, {
        method: "GET",
        mode: "no-cors",
      }).catch(()=>{});
    } catch(e) {}

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,
          messages:[{role:"user",content:`Health insurance advisor India. Customer: Age ${form.age}, PED: ${form.ped||"none"}, BMI: ${bmi||"N/A"}, Family: ${form.familySize}, Maternity: ${form.maternity}, Budget: ${form.budget}, Port: ${form.isPort}. Recommended: ${recs.map(r=>r.name).join(", ")}. Write 2 sentences explaining why these plans fit this customer. Max 55 words.`}]})
      });
      const d = await res.json();
      if(d.content?.[0]?.text) setAiInsight(d.content[0].text);
    } catch(e){}
    setLoading(false);
  };

  const canNext = [!!form.age,true,true];

  // ── LOG POS CLICK ──
  const logPosClick = (planName) => {
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbzChn1PRSOBEBN8TZ8U03nsUK833NvOqfqCR93g4dyD7d4CUwCPh40jOFX5HLqNbsg/exec";
    try {
      const params = new URLSearchParams({
        action:     "pos_click",
        planClicked: planName,
        age:        form.age        || "",
        city:       form.city       || "",
        isPort:     form.isPort     || "",
        ped:        form.ped        || "",
        budget:     form.budget     || "",
        sumInsured: form.sumInsured || "",
      });
      fetch(`${SHEET_URL}?${params.toString()}`, { method:"GET", mode:"no-cors" }).catch(()=>{});
    } catch(e) {}
  };

  return (
    <div style={{minHeight:"100vh",maxWidth:"480px",margin:"0 auto",background:C.bg,fontFamily:"'Inter',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* ── HEADER ── */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"14px 18px",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"34px",height:"34px",borderRadius:"9px",background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>👨‍⚕️</div>
            <div>
              <div style={{fontWeight:700,fontSize:"15px",color:C.text,letterSpacing:"-0.2px"}}>Health Plan Recommender</div>
              <div style={{fontSize:"10px",color:C.muted,marginTop:"1px"}}>AI-powered · Health Insurance</div>
            </div>
          </div>
          {step===3&&(
            <button onClick={()=>{setStep(0);setResults(null);setAiInsight("");}} style={{background:C.accent,border:"none",color:"#fff",borderRadius:"20px",padding:"8px 16px",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",flexShrink:0,boxShadow:"0 2px 8px rgba(229,57,53,0.3)"}}>＋ New Search</button>
          )}
        </div>
        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",gap:"0"}}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:i<3?1:"auto"}}>
              <div style={{display:"flex",alignItems:"center",gap:"5px",flexShrink:0}}>
                <div style={{width:"20px",height:"20px",borderRadius:"50%",background:i<step?C.green:i===step?C.accent:"#E0E0E0",color:i<=step?"#fff":C.muted,fontSize:"10px",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",flexShrink:0}}>{i<step?"✓":i+1}</div>
                <span style={{fontSize:"11px",color:i===step?C.text:C.muted,fontWeight:i===step?600:400,whiteSpace:"nowrap"}}>{s}</span>
              </div>
              {i<3&&<div style={{flex:1,height:"1px",background:i<step?C.green:C.border,margin:"0 6px",transition:"background 0.3s",minWidth:"6px"}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{padding:"22px 18px 120px"}}>

        {/* STEP 0 */}
        {step===0&&(
          <div>
            <div style={{fontWeight:700,fontSize:"19px",color:C.text,marginBottom:"4px",letterSpacing:"-0.3px"}}>Basic Info</div>
            <div style={{fontSize:"13px",color:C.muted,marginBottom:"22px"}}>Enter customer details</div>

            <Field label="Age (years)">
              <TInput value={form.age} onChange={set("age")} placeholder="e.g. 35" type="number"/>
            </Field>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"11px",marginBottom:"20px"}}>
              <div><Label>Height (cm)</Label><TInput value={form.height} onChange={set("height")} placeholder="e.g. 168" type="number"/></div>
              <div><Label>Weight (kg)</Label><TInput value={form.weight} onChange={set("weight")} placeholder="e.g. 72" type="number"/></div>
            </div>
            {bmi&&bmiInfo&&(
              <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 13px",background:bmiInfo.color+"12",borderRadius:C.radiusSm,border:`1px solid ${bmiInfo.color}22`,marginTop:"-10px",marginBottom:"20px"}}>
                <div style={{width:"7px",height:"7px",borderRadius:"50%",background:bmiInfo.color,flexShrink:0}}/>
                <span style={{fontSize:"13px",color:C.text}}>BMI <strong>{bmi}</strong></span>
                <span style={{fontSize:"11px",color:bmiInfo.color,fontWeight:600,marginLeft:"auto"}}>{bmiInfo.label}</span>
              </div>
            )}

            <div style={{height:"1px",background:C.border,margin:"4px 0 20px"}}/>

            <Field label="City Tier">
              <Seg value={form.city} onChange={set("city")} options={[{value:"tier1",label:"Metro",emoji:"🏙️"},{value:"tier2",label:"Tier 2",emoji:"🏘️"},{value:"tier3",label:"Tier 3",emoji:"🌾"}]}/>
            </Field>
            <Field label="Case Type">
              <Seg value={form.isPort} onChange={set("isPort")} options={[{value:"no",label:"Fresh Policy"},{value:"yes",label:"Porting"}]}/>
            </Field>
          </div>
        )}

        {/* STEP 1 */}
        {step===1&&(
          <div>
            <div style={{fontWeight:700,fontSize:"19px",color:C.text,marginBottom:"4px",letterSpacing:"-0.3px"}}>Health Profile</div>
            <div style={{fontSize:"13px",color:C.muted,marginBottom:"22px"}}>Select up to 2 pre-existing conditions</div>

            <Field label="Pre-existing Disease (PED)">
              <select value={form.ped} onChange={e=>set("ped")(e.target.value)} style={{
                ...baseInp, paddingRight:"36px", cursor:"pointer",
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%23999'/%3E%3C/svg%3E")`,
                backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center",
              }}>
                {PED_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            {hasDiab&&(
              <Field label="HbA1c Level" hint="Enter the customer's latest HbA1c reading">
                <TInput value={form.hba1c} onChange={set("hba1c")} placeholder="e.g. 7.2" type="number"/>
              </Field>
            )}

            <div style={{height:"1px",background:C.border,margin:"4px 0 20px"}}/>

            <Field label="Family Size">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px"}}>
                {[{value:"self",label:"Self",emoji:"🧍"},{value:"2a",label:"Self + Spouse",emoji:"👫"},{value:"family",label:"Family 2A+2C",emoji:"👨‍👩‍👧‍👦"},{value:"senior",label:"Senior (60+)",emoji:"🧓"}].map(o=>{
                  const a=form.familySize===o.value;
                  return <button key={o.value} onClick={()=>set("familySize")(o.value)} style={{padding:"10px 11px",borderRadius:C.radiusSm,textAlign:"left",border:a?`1.5px solid ${C.accent}`:`1.5px solid ${C.border}`,background:a?C.accentLight:"#FAFAFA",color:a?C.accent:C.text,fontFamily:"'Inter',sans-serif",fontSize:"13px",fontWeight:a?600:400,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>{o.emoji} {o.label}</button>;
                })}
              </div>
            </Field>
            <Field label="Maternity Planning?">
              <Seg value={form.maternity} onChange={set("maternity")} options={[{value:"no",label:"Not needed"},{value:"yes",label:"Yes 🤱"}]}/>
            </Field>
          </div>
        )}

        {/* STEP 2 */}
        {step===2&&(
          <div>
            <div style={{fontWeight:700,fontSize:"19px",color:C.text,marginBottom:"4px",letterSpacing:"-0.3px"}}>Coverage Needs</div>
            <div style={{fontSize:"13px",color:C.muted,marginBottom:"22px"}}>Almost done!</div>
            <Field label="Budget Preference">
              <Seg value={form.budget} onChange={set("budget")} options={[{value:"low",label:"Low",emoji:"💸"},{value:"medium",label:"Medium",emoji:"💰"},{value:"high",label:"High",emoji:"💎"}]}/>
            </Field>
            <Field label="Sum Insured">
              <PillRow value={form.sumInsured} onChange={set("sumInsured")} options={[{value:"5",label:"₹5L"},{value:"10",label:"₹10L"},{value:"15",label:"₹15L"},{value:"25",label:"₹25L"},{value:"50",label:"₹50L"},{value:"1cr",label:"₹1Cr"}]}/>
            </Field>
          </div>
        )}

        {/* STEP 3 — Results */}
        {step===3&&(
          <div>
            {loading&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 20px",gap:"16px"}}>
                <div style={{width:"34px",height:"34px",border:`2px solid ${C.border}`,borderTop:`2px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
                <div style={{fontSize:"13px",color:C.muted,fontWeight:500}}>Finding best plans…</div>
              </div>
            )}

            {!loading&&results&&(
              <>
                {/* Summary chips */}
                <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"16px"}}>
                  {[`Age ${form.age}`, bmi?`BMI ${bmi}`:"", form.ped&&form.ped!=="none"?PED_OPTIONS.find(o=>o.value===form.ped)?.label||form.ped:"", form.maternity==="yes"?"Maternity":"", `${form.budget} budget`, form.isPort==="yes"?"Port":"Fresh"].filter(Boolean).map((chip,i)=>(
                    <span key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"20px",padding:"3px 9px",fontSize:"11px",color:C.muted,fontWeight:500}}>{chip}</span>
                  ))}
                </div>

                {/* AI Advisory */}
                {aiInsight&&(
                  <div style={{background:C.accentLight,border:`1px solid ${C.accent}18`,borderRadius:C.radius,padding:"14px 16px",marginBottom:"16px"}}>
                    <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:C.accent,marginBottom:"5px"}}>🤖 AI Advisory</div>
                    <p style={{color:C.accentText,fontSize:"13px",lineHeight:1.65,margin:0}}>{aiInsight}</p>
                  </div>
                )}

                {/* Plan Cards */}
                <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                  {results.map((plan,idx)=>{
                    const isExp=expanded===idx;
                    const [pb,pt]=premBadge(plan.premiumRange);
                    const payout = PAYOUT[plan.name] || {fresh:"–",port:"–"};
                    const medal=["🥇","🥈","🥉"][idx];
                    const isTop = idx===0;
                    return (
                      <div key={plan.name} style={{background:C.card,borderRadius:C.radius,overflow:"hidden",border:isTop?`2px solid ${C.accent}`:`1px solid ${C.border}`,boxShadow:isTop?"0 4px 20px rgba(29,78,216,0.1)":"0 1px 6px rgba(0,0,0,0.05)"}}>
                        {isTop&&(
                          <div style={{background:C.accent,color:"#fff",textAlign:"center",padding:"5px",fontSize:"10px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>
                            ★ TOP RECOMMENDATION
                          </div>
                        )}
                        <div style={{padding:"15px 15px 0"}}>
                          {/* Header */}
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:"10px",fontWeight:700,color:C.muted,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:"2px"}}>{plan.insurer}</div>
                              <div style={{fontWeight:700,fontSize:"16px",color:C.text,letterSpacing:"-0.2px",lineHeight:1.2}}>{plan.name}</div>
                            </div>
                            <span style={{fontSize:"20px",marginLeft:"8px",flexShrink:0}}>{medal}</span>
                          </div>

                          {/* Premium badge */}
                          <span style={{display:"inline-block",background:pb,color:pt,borderRadius:"20px",padding:"3px 10px",fontSize:"11px",fontWeight:600,marginBottom:"11px"}}>{plan.premiumRange} Premium</span>

                          {/* Key stats */}
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px",marginBottom:"10px"}}>
                            {[["PED Wait",plan.pedWaiting.split(" ").slice(0,2).join(" ")],["Co-pay",plan.copay]].map(([k,v])=>(
                              <div key={k} style={{background:C.bg,borderRadius:"7px",padding:"7px 9px"}}>
                                <div style={{fontSize:"9px",color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:"2px"}}>{k}</div>
                                <div style={{fontSize:"12px",fontWeight:600,color:C.text}}>{v}</div>
                              </div>
                            ))}
                          </div>

                          {/* Payout % — highlighted based on port/fresh */}
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px",marginBottom:"14px"}}>
                            {[
                              {label:"Fresh Payout",val:payout.fresh,active:form.isPort==="no"},
                              {label:"Port Payout", val:payout.port,  active:form.isPort==="yes"},
                            ].map(({label,val,active})=>(
                              <div key={label} style={{borderRadius:"7px",padding:"8px 10px",background:active?"#f0fdf4":C.bg,border:active?`1px solid #86efac`:`1px solid transparent`}}>
                                <div style={{fontSize:"9px",color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:"3px"}}>💰 {label}</div>
                                <div style={{fontSize:"18px",fontWeight:700,color:active?C.green:C.sub,letterSpacing:"-0.5px"}}>{val}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card action row */}
                        <div style={{display:"flex",borderTop:`1px solid ${C.border}`}}>
                          <button onClick={()=>setExpanded(isExp?null:idx)} style={{flex:1,background:C.bg,border:"none",borderRight:`1px solid ${C.border}`,padding:"10px",fontSize:"12px",fontWeight:500,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px",WebkitTapHighlightColor:"transparent",fontFamily:"'Inter',sans-serif"}}>
                            {isExp?"▲ Hide":"▼ Details"}
                          </button>
                          <a href="https://pos.insurancedekho.com/core/sell/health" target="_blank" rel="noopener noreferrer"
                            onClick={()=>logPosClick(plan.name)}
                            style={{flex:1,background:"#FFF0F0",border:"none",padding:"10px",fontSize:"12px",fontWeight:700,color:C.accent,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px",textDecoration:"none",WebkitTapHighlightColor:"transparent"}}>
                            🛒 Sell on POS
                          </a>
                        </div>

                        {isExp&&(
                          <div style={{padding:"13px 15px 15px"}}>
                            <InfoRow label="Room Rent" value={plan.roomRent}/>
                            <InfoRow label="NCB" value={plan.ncb}/>
                            <InfoRow label="Medicals" value={plan.medicals}/>
                            {plan.reasons?.length>0&&(
                              <div style={{marginTop:"13px"}}>
                                <Label>Why Recommended</Label>
                                {plan.reasons.map((r,i)=>(
                                  <div key={i} style={{display:"flex",gap:"7px",alignItems:"flex-start",fontSize:"13px",color:C.text,marginBottom:"5px"}}>
                                    <span style={{color:C.green,fontWeight:700,flexShrink:0}}>✓</span><span>{r}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{marginTop:"13px"}}>
                              <Label>Key Features</Label>
                              {plan.specialFeatures.slice(0,4).map((f,i)=>(
                                <div key={i} style={{display:"flex",gap:"7px",alignItems:"flex-start",fontSize:"12px",color:C.text,marginBottom:"4px"}}>
                                  <span style={{color:C.accent,flexShrink:0}}>→</span><span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ── POS CTA ── */}}
                <div style={{marginTop:"18px",background:"linear-gradient(135deg,#E53935,#C62828)",borderRadius:C.radius,padding:"18px 20px",textAlign:"center",boxShadow:"0 4px 20px rgba(229,57,53,0.25)"}}>
                  <div style={{fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.7)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>Ready to sell?</div>
                  <div style={{fontSize:"16px",fontWeight:700,color:"#fff",marginBottom:"14px"}}>Open POS Portal</div>
                  <a href="https://pos.insurancedekho.com/core/sell/health" target="_blank" rel="noopener noreferrer"
                    onClick={()=>logPosClick("CTA Banner")}
                    style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"#fff",color:"#C62828",borderRadius:"10px",padding:"12px 28px",fontSize:"14px",fontWeight:700,textDecoration:"none",boxShadow:"0 2px 10px rgba(0,0,0,0.15)"}}>
                    🛒 Sell on POS →
                  </a>
                </div>

                <div style={{marginTop:"14px",padding:"11px 13px",background:C.card,borderRadius:C.radiusSm,border:`1px solid ${C.border}`}}>
                  <p style={{color:C.muted,fontSize:"11px",margin:0,lineHeight:1.6}}>⚠️ Payout % shown for SI ≥ ₹10L (standard). Rates vary by SI slab, city, and coverage type. Final underwriting subject to insurer guidelines.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      {step<3&&(
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"480px",background:C.card,borderTop:`1px solid ${C.border}`,padding:"12px 18px",display:"flex",gap:"9px",boxSizing:"border-box",zIndex:200,boxShadow:"0 -4px 16px rgba(0,0,0,0.05)"}}>
          {step>0&&(
            <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"13px",borderRadius:C.radiusSm,border:`1.5px solid ${C.border}`,background:C.card,color:C.text,fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",WebkitTapHighlightColor:"transparent"}}>← Back</button>
          )}
          {step<2?(
            <button onClick={()=>canNext[step]&&setStep(s=>s+1)} disabled={!canNext[step]} style={{flex:3,padding:"13px",borderRadius:C.radiusSm,border:"none",background:canNext[step]?C.accent:"#EBEBEB",color:canNext[step]?"#fff":C.muted,fontSize:"14px",fontWeight:600,cursor:canNext[step]?"pointer":"not-allowed",fontFamily:"'Inter',sans-serif",WebkitTapHighlightColor:"transparent"}}>Continue →</button>
          ):(
            <button onClick={handleGenerate} style={{flex:3,padding:"13px",borderRadius:C.radiusSm,border:"none",background:C.accent,color:"#fff",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",WebkitTapHighlightColor:"transparent",display:"flex",alignItems:"center",justifyContent:"center",gap:"7px"}}>
              ✦ Get Recommendations
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        input{color:#111111!important;font-weight:600!important;-webkit-text-fill-color:#111111!important;opacity:1!important;}
        input::placeholder{color:#AAAAAA!important;font-weight:400!important;-webkit-text-fill-color:#AAAAAA!important;}
        input:focus{border-color:${C.accent}!important;box-shadow:0 0 0 3px rgba(229,57,53,0.12);}
        *{-webkit-tap-highlight-color:transparent;}
        body{margin:0;background:${C.bg};}
      `}</style>
    </div>
  );
}
