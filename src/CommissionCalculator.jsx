import { useState, useMemo, useRef } from "react";
import { GRID_DATA } from "./gridData";

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

/* ── LABEL ── */
const Label = ({ children }) => (
  <div style={{ fontSize:"11px", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:C.muted, marginBottom:"8px" }}>
    {children}
  </div>
);

/* ── FIELD ── */
const Field = ({ label, children }) => (
  <div style={{ marginBottom:"18px" }}>
    <Label>{label}</Label>
    {children}
  </div>
);

/* ── SEG ── */
const Seg = ({ options, value, onChange }) => (
  <div style={{ display:"flex", background:"#EFEFEF", borderRadius:"9px", padding:"3px", gap:"2px" }}>
    {options.map(o => {
      const a = value === o.value;
      return (
        <button key={o.value} onClick={() => onChange(o.value)}
          style={{ flex:1, padding:"9px 4px", borderRadius:"7px", border:"none",
            background: a ? "#fff" : "transparent",
            color: a ? C.text : C.muted,
            fontFamily:"'Inter',sans-serif", fontSize:"13px", fontWeight: a ? 600 : 400,
            cursor:"pointer", transition:"all 0.12s",
            boxShadow: a ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            WebkitTapHighlightColor:"transparent",
          }}>
          {o.label}
        </button>
      );
    })}
  </div>
);

/* ── CITY AUTOCOMPLETE ── */
function CityInput({ value, onChange }) {
  const [query, setQuery] = useState(value || "");
  const [open,  setOpen]  = useState(false);

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return GRID_DATA.cities.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  return (
    <div style={{ position:"relative" }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(""); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="e.g. Ludhiana"
        style={baseInp}
      />
      {open && suggestions.length > 0 && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, zIndex:100, maxHeight:"200px", overflowY:"auto", marginTop:"4px", boxShadow:"0 4px 12px rgba(0,0,0,0.08)" }}>
          {suggestions.map(c => (
            <div key={c}
              onMouseDown={() => { setQuery(c); onChange(c); setOpen(false); }}
              style={{ padding:"10px 14px", fontSize:"13px", color:C.text, cursor:"pointer", borderBottom:`1px solid ${C.border}` }}
              onMouseEnter={e => e.currentTarget.style.background = C.accentLight}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── MAIN ────────────────────────────────────────────────────── */
export default function CommissionCalculator({ onBack }) {
  const [form, setForm] = useState({
    insurer:  "",
    plan:     "",
    planType: "health",
    si:       "",
    age:      "",
    city:     "",
    policy:   "new",
    coverage: "family floater",
    premium:  "",
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  async function calculate() {
    const { insurer, si, city, age, premium } = form;
    if (!insurer || !si || !city || !age || !premium) {
      setError("Please fill all required fields."); return;
    }
    setError(""); setResult(null); setLoading(true);

    try {
      const params = new URLSearchParams({
        insurer:  form.insurer,
        plan:     form.plan,
        planType: form.planType,
        si:       form.si,
        age:      form.age,
        city:     form.city,
        policy:   form.policy,
        coverage: form.coverage,
        premium:  form.premium,
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
    setForm({ insurer:"", plan:"", planType:"health", si:"", age:"", city:"", policy:"new", coverage:"family floater", premium:"" });
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
          Commission <span style={{ color:"#FFE082" }}>Calculator</span>
        </div>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.75)", marginTop:"6px" }}>
          Estimate your payout before selling
        </div>
      </div>

      <div style={{ maxWidth:"480px", margin:"0 auto", padding:"16px 16px" }}>

        {/* FORM */}
        <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"18px", marginBottom:"10px" }}>

          <Field label="Insurer">
            <select value={form.insurer} onChange={e => set("insurer")(e.target.value)} style={{ ...baseInp, cursor:"pointer" }}>
              <option value="">Select insurer…</option>
              {GRID_DATA.insurers.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>

          <Field label="Plan Name">
            <input value={form.plan} onChange={e => set("plan")(e.target.value)} placeholder="e.g. Reassure 3.0, Optima Secure" style={baseInp}/>
          </Field>

          <Field label="Plan Type">
            <Seg value={form.planType} onChange={set("planType")} options={[
              { value:"health",            label:"Health"   },
              { value:"personal accident", label:"PA"       },
              { value:"top up",            label:"Top Up"   },
            ]}/>
          </Field>

          <Field label="Policy Type">
            <Seg value={form.policy} onChange={set("policy")} options={[
              { value:"new",   label:"New"   },
              { value:"port",  label:"Port"  },
              { value:"renew", label:"Renew" },
            ]}/>
          </Field>

          <Field label="Member Coverage">
            <Seg value={form.coverage} onChange={set("coverage")} options={[
              { value:"individual",     label:"Individual" },
              { value:"family floater", label:"Family"     },
            ]}/>
          </Field>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <Field label="Sum Insured (₹)">
              <input value={form.si} onChange={e => set("si")(e.target.value)} placeholder="e.g. 1000000" type="number" style={baseInp}/>
            </Field>
            <Field label="Eldest Member Age">
              <input value={form.age} onChange={e => set("age")(e.target.value)} placeholder="e.g. 40" type="number" style={baseInp}/>
            </Field>
          </div>

          <Field label="City">
            <CityInput value={form.city} onChange={set("city")}/>
          </Field>

          <Field label="Net Premium (₹)">
            <input value={form.premium} onChange={e => set("premium")(e.target.value)} placeholder="e.g. 33290" type="number" style={baseInp}/>
          </Field>

          {error && (
            <div style={{ padding:"10px 12px", background:C.accentLight, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, fontSize:"12px", color:C.accentText, marginBottom:"14px" }}>
              ❌ {error}
            </div>
          )}

          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={calculate} style={{ flex:3, padding:"13px", borderRadius:C.radiusSm, border:"none", background:C.accent, color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"14px", fontWeight:700, cursor:"pointer" }}>
              {loading ? "Calculating…" : "Calculate Payout →"}
            </button>
            <button onClick={reset} style={{ flex:1, padding:"13px", borderRadius:C.radiusSm, border:`1.5px solid ${C.border}`, background:C.card, color:C.muted, fontFamily:"'Inter',sans-serif", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
              Reset
            </button>
          </div>
        </div>

        {/* RESULT */}
        {result && (
          <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:C.radius, padding:"18px", marginBottom:"10px", animation:"fadeUp 0.3s ease" }}>
            <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:C.muted, marginBottom:"16px" }}>
              Payout Estimate
            </div>

            {/* Big numbers */}
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

            {/* Summary row */}
            <div style={{ background:C.accentLight, border:`1.5px solid ${C.border}`, borderRadius:C.radiusSm, padding:"12px 14px" }}>
              {[
                { label:"Insurer",     value: form.insurer },
                { label:"Plan",        value: form.plan || "—" },
                { label:"Net Premium", value: "₹" + Number(form.premium).toLocaleString("en-IN") },
                { label:"Payout %",    value: result.outRate + "%" },
                { label:"Payout ₹",   value: "₹" + result.payoutAmt.toLocaleString("en-IN") },
              ].map((r, i, arr) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize:"12px", color:C.muted }}>{r.label}</span>
                  <span style={{ fontSize:"12px", fontWeight:600, color:C.text, textAlign:"right", maxWidth:"60%" }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop:"10px", padding:"10px 12px", background:C.bg, borderRadius:C.radiusSm, border:`1px solid ${C.border}` }}>
              <p style={{ color:C.muted, fontSize:"11px", margin:0, lineHeight:1.6 }}>
                ⚠️ Payout is calculated on Net Premium. Final payout subject to insurer guidelines and policy issuance.
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
