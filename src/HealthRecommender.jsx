import { useState, useEffect } from "react";
import { C } from "./theme";

/* ═══════════════════════════════════════════════════════════════
   PAYOUT RATES (from Apps Script commission grid)
   Format: { fresh: "X%", port: "Y%" }
   SI assumed ≥ 10L (most common recommendation case)
═══════════════════════════════════════════════════════════════ */
const PAYOUT = {
  // Rates from runCalculator v7 · SI >= 10L · Family · Fresh · Updated Apr 10 2026
  "Niva Reassure 3.0":            { fresh: "23%", port: "13%" },
  "Niva Aspire":                  { fresh: "23%", port: "13%" },
  "HDFC Optima Secure":           { fresh: "25%", port: "15%" },
  "ICICI Elevate":                { fresh: "23%", port: "10%" },
  "TATA Medicare Select":         { fresh: "27%", port: "12%" },
  "Star Assure":                  { fresh: "25%", port: "15%" },
  "Care Supreme":                 { fresh: "22%", port: "15%" },
  "Care Freedom":                 { fresh: "22%", port: "15%" },
  "Care Heart / Star Cardiac":    { fresh: "22%", port: "15%" },
  "Star Cancer Care":             { fresh: "25%", port: "15%" },
  "Reliance Health Gain":         { fresh: "30%", port: "15%" },
  "Reliance Health Infinity":     { fresh: "30%", port: "15%" },
  "Aditya Birla Active One Max":  { fresh: "25%", port: "15%" },
  "Aditya Birla Active One Vytl": { fresh: "25%", port: "15%" },
  "SBI Health Alpha":             { fresh: "35%", port: "10%" },
};


/* ═══════════════════════════════════════════════════════════════
   PLANS DATA
═══════════════════════════════════════════════════════════════ */
const PLANS_DATA = {
  "Niva Reassure 3.0":           { insurer:"Niva Bupa",      pedWaiting:"Day 1",                         copay:"No",      roomRent:"No Cap",              ncb:"Unlimited",             maxAge:99, premiumRange:"High",     medicals:"PPMC (in absence of reports)", specialFeatures:["Lock the Age","OPD covered (Optional)","Day 1 PED covered","Unlimited SI"] },
  "HDFC Optima Secure":          { insurer:"HDFC",           pedWaiting:"3 years",                       copay:"No",      roomRent:"No Cap",              ncb:"50% to 100%",           maxAge:65, premiumRange:"High", medicals:"PPMC (in absence of reports)", specialFeatures:["2X Cover from Day 1","Loading relaxation on single PED"] },
  "ICICI Elevate":               { insurer:"ICICI",          pedWaiting:"3 yrs (30-day jumpstart opt.)", copay:"No",      roomRent:"Single Pvt. AC room", ncb:"20% to 100%",           maxAge:65, premiumRange:"High",     medicals:"PPMC (in absence of reports)", specialFeatures:["Unlimited claim (Infinite Care)","Day 30 PED Jumpstart","Worldwide cover after 2 yrs","2-hour hospitalisation"] },
  "TATA Medicare Select":        { insurer:"TATA AIG",       pedWaiting:"3 years",                       copay:"No",      roomRent:"Single Pvt. AC room", ncb:"50% to 100%",           maxAge:65, premiumRange:"High",     medicals:"PPMC (in absence of reports)", specialFeatures:["Unlimited claim (Infinite Advantage)","7.5% discount for salaried","Day 30 PED Advance Cover Rider","Women & mental wellbeing rider"] },
  "Star Assure":                 { insurer:"Star",           pedWaiting:"3 yrs (2.5 yr for 3-yr tenure)",copay:"10% if age>60",roomRent:"5L:1%, >5L:Any except Suite",ncb:"25%–100% (non-reducing)", maxAge:75, premiumRange:"Medium", medicals:"No PPMC", specialFeatures:["Consumables inbuilt","No sublimits","Aggregate deductible (45% discount)","Unlimited restoration"] },
  "Care Supreme":                { insurer:"Care",           pedWaiting:"4 yrs (Rider: 1 yr)",           copay:"No",      roomRent:"No Cap",              ncb:"50% to 600%",           maxAge:99, premiumRange:"High",     medicals:"No PPMC",                      specialFeatures:["No loading","Super NCB","Instant Cover rider","PED Modification rider"] },
  "Reliance Health Gain":        { insurer:"Reliance",       pedWaiting:"3 years",                       copay:"No",      roomRent:"Any",                 ncb:"100% to 500%",          maxAge:55, premiumRange:"Low", medicals:"No PPMC",                      specialFeatures:["Multi-year discounts for healthy people"] },
  "Niva Aspire":                 { insurer:"Niva Bupa",      pedWaiting:"3 years",                       copay:"No",      roomRent:"No Cap",              ncb:"100% to 1000%",         maxAge:65, premiumRange:"High",medicals:"PPMC (in absence of reports)", specialFeatures:["Lock the Age","Maternity (9 months)","Global cover (Borderless)","OPD Well Consult","Future spouse Day 1 cover"] },
  "Aditya Birla Active One Max": { insurer:"Aditya Birla",   pedWaiting:"3 years",                       copay:"No",      roomRent:"No Cap",              ncb:"100% to 500%",          maxAge:99, premiumRange:"High",     medicals:"PPMC above 60",                specialFeatures:["Chronic Care Day 1 (7 listed)","100% health returns","Consumables inbuilt","Health checkup inbuilt"] },
  "SBI Health Alpha":            { insurer:"SBI",            pedWaiting:"3 years",                       copay:"No",      roomRent:"Any",                 ncb:"100% to 500%",          maxAge:99, premiumRange:"Low", medicals:"No PPMC",                      specialFeatures:["Wellness discount 100%","Affordable premium"] },
  "Care Freedom":                { insurer:"Care",           pedWaiting:"2 years",                       copay:"20%",     roomRent:"1%, Twin, Single",    ncb:"None",                  maxAge:99, premiumRange:"High",     medicals:"Yes (Subject to UW)",          specialFeatures:["100% Restoration","Suitable for multiple co-morbidities"] },
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
  // Per-plan BMI limits (based on underwriting guidelines)
  const PLAN_BMI_LIMITS = {
    "Niva Reassure 3.0":           45,
    "Niva Aspire":                 45,
    "HDFC Optima Secure":          35,
    "ICICI Elevate":               40,
    "TATA Medicare Select":        40,
    "Star Assure":                 40,
    "Care Supreme":                40,
    "Care Freedom":                50, // accepts higher BMI with co-pay
    "Care Heart / Star Cardiac":   40,
    "Star Cancer Care":            40,
    "Reliance Health Gain":        35,
    "Reliance Health Infinity":    35,
    "Aditya Birla Active One Max": 40,
    "Aditya Birla Active One Vytl":40,
    "SBI Health Alpha":            50, // liberal UW
  };

  const eligible = candidates.filter(name => {
    const plan = PLANS_DATA[name];
    if (!plan) return false;
    // Age filter — hard remove if customer exceeds plan max entry age
    if (ageNum > plan.maxAge) return false;
    // BMI filter — hard remove if customer BMI exceeds plan limit
    const bmiLimit = PLAN_BMI_LIMITS[name] || 40;
    if (bmiNum > 0 && bmiNum > bmiLimit) return false;
    return true;
  });
  const buildReasons = (name) => {
    const r = [];
    const pd = PLANS_DATA[name];
    const pedKey = form.ped || "none";

    // PED-specific reasons
    if (pedKey.startsWith("diab")) {
      if (name.includes("Freedom"))        r.push("Accepts diabetes with co-pay, including insulin cases");
      else if (name.includes("SBI"))       r.push("Accepts diabetes cases subject to underwriting");
      else if (name.includes("Reassure"))  r.push("Day 1 PED cover available for diabetes");
      else if (name.includes("AB") || name.includes("Aditya")) r.push("Chronic Care Day 1 covers listed diabetic conditions");
      else                                 r.push("Covers diabetes after standard PED waiting period");
    } else if (pedKey === "bp" || pedKey === "bp_diab") {
      if (name.includes("Reassure"))       r.push("Day 1 PED cover available for hypertension");
      else if (name.includes("Star"))      r.push("Hypertension covered, no loading on standard cases");
      else                                 r.push("Covers hypertension after standard PED waiting period");
    } else if (pedKey === "heart") {
      if (name.includes("Aditya") || name.includes("AB")) r.push("Covers cardiac conditions from Day 1 under Chronic Care");
      else if (name.includes("Heart") || name.includes("Cardiac")) r.push("Specialised cardiac coverage plan");
      else if (name.includes("Reassure")) r.push("Cardiac PED covered after waiting period with no loading");
    } else if (pedKey === "asthma" || pedKey === "copd") {
      if (name.includes("Aditya") || name.includes("AB")) r.push("Respiratory conditions covered under Chronic Care");
      else if (name.includes("Reassure"))  r.push("Asthma/COPD covered after standard waiting period");
      else                                 r.push("Covers respiratory conditions after PED waiting period");
    } else if (pedKey === "kidney") {
      if (name.includes("Aditya") || name.includes("AB")) r.push("Kidney conditions covered under Chronic Care Day 1");
      else if (name.includes("Freedom"))   r.push("Accepts kidney conditions with co-pay");
      else if (name.includes("Reassure"))  r.push("Kidney conditions covered — Day 1 PED available");
    } else if (pedKey === "cancer_cured") {
      if (name.includes("Cancer"))         r.push("Specialised cancer coverage plan");
      else if (name.includes("Freedom"))   r.push("Accepts cured cancer cases subject to underwriting");
    } else if (pedKey === "surgery_treated" || pedKey === "surgery_untreated") {
      if (name.includes("Star Assure"))    r.push("Covers post-surgical conditions without loading");
      else if (name.includes("Freedom"))   r.push("Accepts surgical history cases with co-pay");
      else if (name.includes("Reassure"))  r.push("Surgical history covered after waiting period");
      else if (name.includes("SBI"))       r.push("Accepts surgical cases subject to underwriting");
    } else if (pedKey === "mental") {
      if (name.includes("Aditya") || name.includes("AB")) r.push("Mental health conditions covered");
      else if (name.includes("Freedom"))   r.push("Accepts mental health history with co-pay");
      else                                 r.push("Mental health coverage available");
    } else if (pedKey === "rheumatoid") {
      r.push("Accepts rheumatoid arthritis subject to underwriting");
    } else if (pedKey === "hyperthyroid") {
      r.push("Accepts thyroid conditions subject to underwriting");
    } else if (pedKey === "liver") {
      if (name.includes("Aditya") || name.includes("AB")) r.push("Liver conditions covered under Chronic Care");
      else                                 r.push("Covers liver conditions after PED waiting period");
    }

    // BMI/Obesity reason
    const bmiVal = parseFloat(form.bmi) || 0;
    if (bmiVal >= 30) {
      if (name.includes("Reassure") || name.includes("Niva")) r.push("BMI accepted — obesity noted, covered subject to underwriting");
      else if (name.includes("SBI"))   r.push("BMI accepted — no restriction for entry");
      else                             r.push("BMI accepted — subject to underwriting");
    }

    // Maternity reason
    if (form.maternity === "yes") {
      if (name.includes("Aspire"))       r.push("Maternity cover from 9 months waiting");
      else if (name.includes("Star Assure")) r.push("Maternity add-on available");
      else if (name.includes("TATA"))    r.push("Maternity rider available");
      else if (name.includes("SBI"))     r.push("Maternity cover included");
    }

    // Age-specific reason
    const ageVal = parseInt(form.age) || 0;
    if (ageVal >= 55) {
      if (name.includes("Aditya") || name.includes("AB")) r.push("No entry age restriction, suitable for seniors");
      else if (name.includes("Care Supreme"))              r.push("No age bar, lifelong renewability");
      else if (name.includes("ICICI"))                     r.push("Covers up to age 65, unlimited restoration");
    }

    // PED waiting period as a reason — only add if not already mentioned above
    const alreadyMentionsDay1 = r.some(x => x.includes("Day 1"));
    const alreadyMentionsWait = r.some(x => x.includes("waiting") || x.includes("PED"));
    if (!alreadyMentionsDay1 && pd?.pedWaiting?.includes("Day 1"))
      r.push("Day 1 PED coverage — no waiting period");
    else if (!alreadyMentionsWait && pd?.pedWaiting?.includes("2 y"))
      r.push("Shorter PED waiting period of 2 years");

    // Row note if present
    if (row.note && r.length < 2) r.push(row.note);

    // Fallback
    if (r.length === 0) r.push("Covers pre-existing conditions after standard waiting period");

    return r.slice(0, 3);
  };
  return eligible.slice(0,3).map(name => ({ name, ...PLANS_DATA[name], reasons:buildReasons(name) }));
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const calcBMI = (h,w) => { const hm=parseFloat(h)/100,wk=parseFloat(w); if(!hm||!wk||hm<=0) return null; return parseFloat((wk/(hm*hm)).toFixed(1)); };
const bmiMeta = b => { if(!b) return null; if(b<18.5) return{label:"Underweight",color:"#3b82f6"}; if(b<25) return{label:"Normal",color:"#10b981"}; if(b<30) return{label:"Overweight",color:"#f59e0b"}; return{label:"Obese",color:"#ef4444"}; };
const premBadge = r => ({"Low":["#f0fdf4","#166534"],"Medium":["#fefce8","#92400e"],"High":["#fff7ed","#c2410c"]}[r]||["#f9fafb","#374151"]);

const PED_OPTIONS = [
  {value:"none",              label:"No PED",                  group:""},
  {value:"maternity",         label:"Maternity",                group:"Other"},
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
/* ═══════════════════════════════════════════════════════════════
   UI COMPONENTS
═══════════════════════════════════════════════════════════════ */
const Label = ({children}) => (
  <div style={{fontSize:"12px",fontWeight:600,color:C.muted,marginBottom:"8px",letterSpacing:"0.05em",textTransform:"uppercase"}}>
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

const baseInp = {width:"100%",padding:"12px 14px",borderRadius:C.radiusSm,border:`1.5px solid ${C.border}`,background:"#fff",fontFamily:C.font,fontSize:"14px",color:C.text,fontWeight:500,outline:"none",boxSizing:"border-box",WebkitAppearance:"none"};

const TInput = ({value,onChange,placeholder,type="text"}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} inputMode={type==="number"?"decimal":"text"} style={baseInp}/>
);

/* Segmented control — ID blue style */
const Seg = ({options,value,onChange}) => (
  <div style={{display:"flex",background:C.blueLight,borderRadius:"99px",padding:"3px",gap:"2px"}}>
    {options.map(o=>{
      const a=value===o.value;
      return <button key={o.value} onClick={()=>onChange(o.value)} style={{flex:1,padding:"8px 4px",borderRadius:"99px",border:"none",background:a?C.blue:"transparent",color:a?"#fff":C.blue,fontFamily:C.font,fontSize:"13px",fontWeight:a?600:500,cursor:"pointer",transition:"all 0.15s",WebkitTapHighlightColor:"transparent"}}>{o.label}</button>;
    })}
  </div>
);

/* Pill row */
const PillRow = ({options,value,onChange}) => (
  <div style={{display:"flex",flexWrap:"wrap",gap:"7px"}}>
    {options.map(o=>{
      const a=value===o.value;
      return <button key={o.value} onClick={()=>onChange(o.value)} style={{padding:"8px 15px",borderRadius:"99px",border:a?`1.5px solid ${C.blue}`:`1.5px solid ${C.border}`,background:a?C.blueLight:"#fff",color:a?C.blue:C.text,fontFamily:C.font,fontSize:"13px",fontWeight:a?600:400,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>{o.label}</button>;
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
          <button key={o.value} onClick={()=>toggle(o.value)} style={{width:"100%",padding:"11px 14px",borderRadius:C.radiusSm,border:a?`1.5px solid ${C.red}`:`1.5px solid ${C.border}`,background:a?C.redLight:"#FAFAFA",color:a?C.red:C.text,fontFamily:C.font,fontSize:"14px",fontWeight:a?600:400,cursor:"pointer",marginBottom:"12px",textAlign:"left",WebkitTapHighlightColor:"transparent"}}>
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
                <button key={o.value} onClick={()=>!disabled&&toggle(o.value)} style={{padding:"9px 11px",borderRadius:C.radiusSm,textAlign:"left",border:a?`1.5px solid ${C.red}`:`1.5px solid ${C.border}`,background:a?C.redLight:disabled?"#F8F8F8":"#FAFAFA",color:a?C.red:disabled?C.muted:C.text,fontFamily:C.font,fontSize:"12px",fontWeight:a?600:400,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,WebkitTapHighlightColor:"transparent"}}>
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
export default function HealthRecommender({ onBack }) {
  const [step,setStep]           = useState(0);
  const [form,setForm]           = useState({age:"",heightFt:"",heightIn:"",weight:"",peds:["none"],hba1c:"",familySize:"2a",maternity:"no",budget:"medium",isPort:"no",city:"tier1",sumInsured:"10"});
  const [results,setResults]     = useState(null);
  const [loading,setLoading]     = useState(false);
  const [expanded,setExpanded]   = useState(null);

  const set = k => v => setForm(f=>({...f,[k]:v}));
  const heightCm = form.heightFt ? (parseFloat(form.heightFt||0)*30.48 + parseFloat(form.heightIn||0)*2.54).toFixed(1) : "";
  const bmi = calcBMI(heightCm,form.weight);
  const bmiInfo = bmiMeta(bmi);
  const hasDiab = (form.ped||"").startsWith("diabetes");

  useEffect(()=>{ window.scrollTo({top:0,behavior:"smooth"}); },[step]);

  const handleGenerate = async () => {
    setLoading(true); setResults(null);  setExpanded(null);
    setStep(3);
    const recs = getRecommendations({...form,bmi});
    setResults(recs);

    // ── LOG TO GOOGLE SHEETS ──
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbzChn1PRSOBEBN8TZ8U03nsUK833NvOqfqCR93g4dyD7d4CUwCPh40jOFX5HLqNbsg/exec";
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
    <div style={{minHeight:"100vh",maxWidth:"480px",margin:"0 auto",background:C.bg,fontFamily:C.font}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* ── HEADER ── */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"14px 18px",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <img src="https://www.google.com/s2/favicons?domain=insurancedekho.com&sz=128" alt="InsuranceDekho" style={{height:"28px",width:"28px",borderRadius:"6px",objectFit:"cover",flexShrink:0}}/>
            <div>
              <div style={{fontWeight:700,fontSize:"14px",color:C.text}}>Plan Recommender</div>
              <div style={{fontSize:"10px",color:C.muted,marginTop:"1px"}}>
                {step < 3 ? `Step ${step + 1} of 3 — ${["Customer info","Health profile","Coverage needs","Results"][step]}` : "Recommendations ready"}
              </div>
            </div>
          </div>
          {step===3&&(
            <div style={{display:"flex",gap:"8px",flexShrink:0}}>
              <button onClick={()=>{setStep(2);setResults(null);}} style={{background:C.card,border:`1.5px solid ${C.border}`,color:C.text,borderRadius:"20px",padding:"7px 12px",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:C.font}}>Edit</button>
              <button onClick={()=>{setStep(0);setResults(null);}} style={{background:C.red,border:"none",color:"#fff",borderRadius:"20px",padding:"7px 14px",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:C.font}}>New</button>
            </div>
          )}
        </div>
        {/* Step indicator — clean dots */}
        {step < 3 && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"0",marginBottom:"6px"}}>
              {[0,1,2].map((i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",flex:i<2?1:"auto"}}>
                  <div style={{width:"22px",height:"22px",borderRadius:"50%",
                    background:i<step?C.green:i===step?C.red:"#E0E0E0",
                    color:i<=step?"#fff":C.muted,fontSize:"10px",fontWeight:700,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    transition:"all 0.2s",flexShrink:0}}>
                    {i<step?"✓":i+1}
                  </div>
                  {i<2&&<div style={{flex:1,height:"2px",background:i<step?C.green:C.border,margin:"0 4px",transition:"background 0.3s",minWidth:"8px"}}/>}
                </div>
              ))}
            </div>
            <div style={{fontSize:"11px",color:C.muted}}>
              {step===0 && "Step 1 of 3 — Basic info"}
              {step===1 && "Step 2 of 3 — Health profile"}
              {step===2 && "Step 3 of 3 — Budget & cover"}
            </div>
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div style={{padding:"22px 18px 160px"}}>

        {/* STEP 0 */}
        {step===0&&(
          <div>
            <div style={{fontWeight:700,fontSize:"19px",color:C.text,marginBottom:"4px",letterSpacing:"-0.3px"}}>Basic Info</div>
            <div style={{fontSize:"13px",color:C.muted,marginBottom:"22px"}}>Enter customer details</div>

            <Field label="Age of Eldest Member (years)">
              <TInput value={form.age} onChange={set("age")} placeholder="e.g. 35" type="number"/>
            </Field>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"11px",marginBottom:"20px"}}>
              <div>
                <Label>Height</Label>
                <div style={{display:"flex",gap:"6px"}}>
                  <TInput value={form.heightFt} onChange={set("heightFt")} placeholder="ft" type="number"/>
                  <TInput value={form.heightIn} onChange={set("heightIn")} placeholder="in" type="number"/>
                </div>
              </div>
              <div><Label>Weight (kg)</Label><TInput value={form.weight} onChange={set("weight")} placeholder="72" type="number"/></div>
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

            {/* Inline PED feedback */}
            {form.ped && form.ped !== "none" && (
              <div style={{padding:"8px 12px",background:C.blueLight,borderRadius:C.radiusXs,
                fontSize:"11px",color:C.blue,marginTop:"-14px",marginBottom:"16px",lineHeight:1.5}}>
                {form.ped.startsWith("diab") && "Diabetes selected — plans with Day 1 PED cover and diabetic-friendly underwriting shown first"}
                {(form.ped === "bp" || form.ped === "bp_diab") && "Hypertension selected — plans with standard 2-yr wait and no loading shown first"}
                {form.ped === "heart" && "Cardiac condition selected — specialised cardiac plans and Chronic Care Day 1 options prioritised"}
                {form.ped === "kidney" && "Kidney condition selected — plans with liberal underwriting shown first"}
                {(form.ped === "asthma" || form.ped === "copd") && "Respiratory condition — Chronic Care Day 1 and no-loading plans shown first"}
                {form.ped === "cancer" && "Cancer history — specialist plans and plans accepting cancer history shown first"}
                {form.ped === "maternity" && "Maternity selected — plans with shortest maternity wait period shown first"}
              </div>
            )}

            {hasDiab&&(
              <Field label="HbA1c Level" hint="Enter the customer's latest HbA1c reading">
                <TInput value={form.hba1c} onChange={set("hba1c")} placeholder="e.g. 7.2" type="number"/>
              </Field>
            )}

            <div style={{height:"1px",background:C.border,margin:"4px 0 20px"}}/>

            <Field label="Family Size">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"7px"}}>
                {[{value:"self",label:"Self",emoji:"🧍"},{value:"2a",label:"Self + Spouse",emoji:"👫"},{value:"2a1c",label:"Family 2A+1C",emoji:"👨‍👩‍👦"},{value:"family",label:"Family 2A+2C",emoji:"👨‍👩‍👧‍👦"},{value:"senior",label:"Senior (60+)",emoji:"🧓"}].map(o=>{
                  const a=form.familySize===o.value;
                  return <button key={o.value} onClick={()=>set("familySize")(o.value)} style={{padding:"10px 11px",borderRadius:C.radiusSm,textAlign:"left",border:a?`1.5px solid ${C.red}`:`1.5px solid ${C.border}`,background:a?C.redLight:"#FAFAFA",color:a?C.red:C.text,fontFamily:C.font,fontSize:"13px",fontWeight:a?600:400,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>{o.emoji} {o.label}</button>;
                })}
              </div>
            </Field>
            <Field label="Maternity Planning?">
              <Seg value={form.maternity} onChange={set("maternity")} options={[{value:"no",label:"Not needed"},{value:"yes",label:"Yes"}]}/>
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
                <div style={{width:"34px",height:"34px",border:`2px solid ${C.border}`,borderTop:`2px solid ${C.red}`,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
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

                {/* Plan Cards — horizontal scroll, no ranking */}
                {results.length === 0 ? (
                  <div style={{background:C.card,borderRadius:C.radius,padding:"28px 20px",
                    textAlign:"center",border:`1px solid ${C.border}`}}>
                    <div style={{fontWeight:700,fontSize:"16px",color:C.text,marginBottom:"8px"}}>No Plans Available</div>
                    <div style={{fontSize:"13px",color:C.muted,lineHeight:1.6}}>
                      Based on the customer's age, BMI, and health conditions, no plan currently meets eligibility criteria.
                      Consider reviewing the customer's BMI or exploring plans directly with the insurer.
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Swipe hint */}
                    <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"8px"}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M15 8L19 12L15 16" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{fontSize:"11px",color:C.muted}}>Swipe to see all matching plans</span>
                    </div>

                    {/* Scroll container — negative margin to bleed past padding */}
                    <div style={{
                      display:"flex", gap:"10px", overflowX:"auto",
                      scrollSnapType:"x mandatory", WebkitOverflowScrolling:"touch",
                      scrollbarWidth:"none", msOverflowStyle:"none",
                      marginLeft:"-18px", marginRight:"-18px",
                      paddingLeft:"18px", paddingRight:"18px",
                      paddingBottom:"4px",
                    }}
                      id="planScroll"
                      onScroll={e=>{
                        const idx = Math.round(e.target.scrollLeft / (e.target.offsetWidth * 0.82));
                        setExpanded(idx < results.length ? null : null);
                        const dots = document.querySelectorAll(".plan-dot");
                        dots.forEach((d,i)=>d.style.background = i===idx ? C.red : C.border);
                      }}
                    >
                      {results.map((plan,idx)=>{
                        const isExp = expanded===idx;
                        const [pb,pt] = premBadge(plan.premiumRange);
                        const payout = PAYOUT[plan.name] || {fresh:"–",port:"–"};
                        const payoutVal = form.isPort==="yes" ? payout.port : payout.fresh;
                        return (
                          <div key={plan.name} style={{
                            flexShrink:0, width:"82%", maxWidth:"300px",
                            background:C.card, borderRadius:C.radius,
                            border:`1px solid ${C.border}`, boxShadow:C.shadow,
                            scrollSnapAlign:"start", overflow:"hidden",
                            display:"flex", flexDirection:"column",
                          }}>
                            {/* Card header */}
                            <div style={{padding:"11px 13px 10px",borderBottom:`1px solid ${C.border}`,background:C.bg}}>
                              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"8px"}}>
                                <div>
                                  <div style={{fontSize:"10px",fontWeight:600,color:C.muted,
                                    letterSpacing:"0.07em",textTransform:"uppercase"}}>{plan.insurer}</div>
                                  <div style={{fontWeight:700,fontSize:"14px",color:C.text,
                                    lineHeight:1.3,marginTop:"3px"}}>{plan.name}</div>
                                </div>
                                <div style={{background:C.greenLight,border:"1px solid #86efac",
                                  borderRadius:C.radiusSm,padding:"5px 9px",textAlign:"center",flexShrink:0}}>
                                  <div style={{fontSize:"8px",color:C.green,fontWeight:600,textTransform:"uppercase"}}>Payout</div>
                                  <div style={{fontSize:"20px",fontWeight:700,color:C.green,lineHeight:1}}>{payoutVal}</div>
                                </div>
                              </div>
                            </div>

                            <div style={{padding:"10px 13px",display:"flex",flexDirection:"column",gap:"8px",flex:1}}>
                              {/* Why recommended */}
                              {plan.reasons?.length>0&&(
                                <div style={{background:"#FFF7ED",borderRadius:C.radiusSm,padding:"7px 9px"}}>
                                  <div style={{fontSize:"8px",fontWeight:700,color:"#92400e",
                                    textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"4px"}}>Why this plan</div>
                                  {plan.reasons.slice(0,2).map((r,i)=>(
                                    <div key={i} style={{display:"flex",gap:"5px",alignItems:"flex-start",
                                      fontSize:"11px",color:C.text,marginBottom:"2px",lineHeight:1.4}}>
                                      <span style={{color:C.green,fontWeight:700,flexShrink:0}}>✓</span>
                                      <span>{r}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* 4 stat grid */}
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
                                {[
                                  ["PED wait", plan.pedWaiting.split(" ").slice(0,3).join(" ")],
                                  ["Co-pay",   plan.copay],
                                  ["Room rent", plan.roomRent.length>14 ? plan.roomRent.split("(")[0].trim() : plan.roomRent],
                                  ["NCB",       plan.ncb.split(" ").slice(0,2).join(" ")],
                                ].map(([k,v])=>(
                                  <div key={k} style={{background:C.bg,borderRadius:C.radiusXs,padding:"5px 7px"}}>
                                    <div style={{fontSize:"8px",color:C.muted,fontWeight:600,
                                      textTransform:"uppercase",letterSpacing:"0.05em"}}>{k}</div>
                                    <div style={{fontSize:"11px",fontWeight:600,color:C.text,
                                      marginTop:"2px",lineHeight:1.3}}>{v}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Premium badge */}
                              <div style={{display:"flex",justifyContent:"flex-end"}}>
                                <span style={{fontSize:"10px",fontWeight:600,padding:"2px 8px",
                                  borderRadius:"99px",background:pb,color:pt}}>
                                  {plan.premiumRange} premium
                                </span>
                              </div>

                              {/* Expand toggle */}
                              <button onClick={()=>setExpanded(isExp?null:idx)}
                                style={{background:"none",border:`1px solid ${C.border}`,
                                  borderRadius:C.radiusSm,padding:"7px",fontSize:"11px",
                                  color:C.muted,cursor:"pointer",fontFamily:C.font,width:"100%"}}>
                                {isExp ? "Show less" : "See full details"}
                              </button>

                              {/* Expanded */}
                              {isExp&&(
                                <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
                                  {plan.specialFeatures?.map((f,i)=>(
                                    <div key={i} style={{display:"flex",gap:"7px",alignItems:"flex-start",
                                      fontSize:"11px",color:C.text,lineHeight:1.4}}>
                                      <span style={{color:C.red,fontWeight:700,flexShrink:0}}>→</span>
                                      <span>{f}</span>
                                    </div>
                                  ))}
                                  <div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>
                                    Medicals: {plan.medicals}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* POS button pinned to card bottom */}
                            <a href="https://pos.insurancedekho.com/core/sell/health"
                              target="_blank" rel="noopener noreferrer"
                              onClick={()=>logPosClick(plan.name)}
                              style={{display:"block",background:C.red,color:"#fff",
                                textAlign:"center",fontSize:"12px",fontWeight:700,
                                padding:"10px",textDecoration:"none",
                                borderTop:`1px solid ${C.border}`}}>
                              Sell on POS
                            </a>
                          </div>
                        );
                      })}
                    </div>

                    {/* Dot indicators */}
                    <div style={{display:"flex",justifyContent:"center",gap:"6px",marginTop:"10px"}}>
                      {results.map((_,i)=>(
                        <div key={i} className="plan-dot" style={{
                          width:"6px",height:"6px",borderRadius:"50%",
                          background: i===0 ? C.red : C.border,
                          transition:"background 0.2s",
                        }}/>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── FULL SCREEN DETAILS MODAL ── */}
                {expanded!==null && results[expanded] && (()=>{
                  const mp = results[expanded];
                  const mpPayout = PAYOUT[mp.name]||{fresh:"–",port:"–"};
                  const mpPayoutVal = form.isPort==="yes"?mpPayout.port:mpPayout.fresh;
                  return (
                    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.5)",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}
                      onClick={()=>setExpanded(null)}>
                      <div style={{background:C.card,borderRadius:"20px 20px 0 0",maxHeight:"85vh",overflowY:"auto",padding:"0 0 32px"}}
                        onClick={e=>e.stopPropagation()}>
                        {/* Modal header */}
                        <div style={{position:"sticky",top:0,background:C.card,borderBottom:`1px solid ${C.border}`,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:10}}>
                          <div>
                            <div style={{fontSize:"10px",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>{mp.insurer}</div>
                            <div style={{fontWeight:700,fontSize:"17px",color:C.text,marginTop:"2px"}}>{mp.name}</div>
                          </div>
                          <button onClick={()=>setExpanded(null)} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:"50%",width:"32px",height:"32px",fontSize:"16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
                        </div>

                        <div style={{padding:"20px 20px 0"}}>
                          {/* Why Recommended */}
                          {mp.reasons?.length>0&&(
                            <div style={{background:"#FFF7ED",borderRadius:"10px",padding:"14px",marginBottom:"16px"}}>
                              <div style={{fontSize:"10px",fontWeight:700,color:"#92400e",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px"}}>Why Recommended</div>
                              {mp.reasons.map((r,i)=>(
                                <div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start",fontSize:"13px",color:C.text,marginBottom:"6px",lineHeight:1.5}}>
                                  <span style={{color:C.green,fontWeight:700,flexShrink:0}}>✓</span><span>{r}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Plan details */}
                          <div style={{marginBottom:"16px"}}>
                            <div style={{fontSize:"10px",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"10px"}}>Plan Details</div>
                            <InfoRow label="PED Waiting Period" value={mp.pedWaiting}/>
                            <InfoRow label="Co-pay" value={mp.copay}/>
                            <InfoRow label="Room Rent" value={mp.roomRent}/>
                            <InfoRow label="No Claim Bonus" value={mp.ncb}/>
                            <InfoRow label="Medicals" value={mp.medicals}/>

                          </div>

                          {/* Payout */}
                          <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",padding:"14px",marginBottom:"16px",textAlign:"center"}}>
                            <div style={{fontSize:"10px",color:C.muted,fontWeight:600,textTransform:"uppercase",marginBottom:"4px"}}>💰 Agent Payout ({form.isPort==="yes"?"Port":"Fresh"})</div>
                            <div style={{fontSize:"32px",fontWeight:700,color:C.green,letterSpacing:"-1px"}}>{mpPayoutVal}</div>
                          </div>

                          {/* Key Features */}
                          <div style={{marginBottom:"16px"}}>
                            <div style={{fontSize:"10px",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"10px"}}>Key Features</div>
                            {mp.specialFeatures.map((f,i)=>(
                              <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",fontSize:"13px",color:C.text,marginBottom:"8px",lineHeight:1.5}}>
                                <span style={{color:C.red,flexShrink:0,fontWeight:700}}>→</span><span>{f}</span>
                              </div>
                            ))}
                          </div>

                          {/* Sell on POS */}
                          <a href="https://pos.insurancedekho.com/core/sell/health" target="_blank" rel="noopener noreferrer"
                            onClick={()=>logPosClick(mp.name)}
                            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",background:C.red,borderRadius:C.radiusSm,padding:"14px",fontSize:"14px",fontWeight:700,color:"#fff",textDecoration:"none"}}>
                            Sell on POS
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── POS CTA ── */}
                <div style={{marginTop:"18px",background:C.red,borderRadius:C.radius,padding:"18px 20px",textAlign:"center"}}>
                  <div style={{fontSize:"11px",fontWeight:600,color:"rgba(255,255,255,0.7)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"4px"}}>Ready to sell?</div>
                  <div style={{fontSize:"16px",fontWeight:700,color:"#fff",marginBottom:"14px"}}>Open POS Portal</div>
                  <a href="https://pos.insurancedekho.com/core/sell/health" target="_blank" rel="noopener noreferrer"
                    onClick={()=>logPosClick("CTA Banner")}
                    style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"#fff",color:C.red,borderRadius:C.radiusSm,padding:"11px 28px",fontSize:"14px",fontWeight:700,textDecoration:"none"}}>
                    Sell on POS
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
        <div style={{position:"fixed",bottom:"72px",left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"480px",background:C.card,borderTop:`1px solid ${C.border}`,padding:"12px 18px",display:"flex",gap:"9px",boxSizing:"border-box",zIndex:200,boxShadow:"0 -4px 16px rgba(0,0,0,0.05)"}}>
          {step>0&&(
            <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"13px",borderRadius:C.radiusSm,border:`1.5px solid ${C.border}`,background:C.card,color:C.text,fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:C.font,WebkitTapHighlightColor:"transparent"}}>Back</button>
          )}
          {step<2?(
            <button onClick={()=>canNext[step]&&setStep(s=>s+1)} disabled={!canNext[step]} style={{flex:3,padding:"13px",borderRadius:C.radiusSm,border:"none",background:canNext[step]?C.red:"#EBEBEB",color:canNext[step]?"#fff":C.muted,fontSize:"14px",fontWeight:600,cursor:canNext[step]?"pointer":"not-allowed",fontFamily:C.font,WebkitTapHighlightColor:"transparent"}}>Continue</button>
          ):(
            <button onClick={handleGenerate} style={{flex:3,padding:"13px",borderRadius:C.radiusSm,border:"none",background:C.red,color:"#fff",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:C.font,WebkitTapHighlightColor:"transparent",display:"flex",alignItems:"center",justifyContent:"center",gap:"7px"}}>
              See Recommendations
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        input{color:#111111!important;font-weight:600!important;-webkit-text-fill-color:#111111!important;opacity:1!important;}
        input::placeholder{color:#AAAAAA!important;font-weight:400!important;-webkit-text-fill-color:#AAAAAA!important;}
        input:focus{border-color:${C.red}!important;box-shadow:0 0 0 3px rgba(232,39,42,0.12);}
        *{-webkit-tap-highlight-color:transparent;}
        body{margin:0;background:${C.bg};}
        #planScroll::-webkit-scrollbar{display:none;}
      `}</style>
    </div>
  );
}
