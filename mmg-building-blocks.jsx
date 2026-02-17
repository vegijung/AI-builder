import { useState, useMemo } from "react";

const CATS = {
  "Understanding & Summarization": { color: "#FBB740", abbr: "U&S" },
  "Extraction & Structuring": { color: "#F47B20", abbr: "E&S" },
  "Generation & Creativity": { color: "#50D8A8", abbr: "G&C" },
  "Prediction & Optimization": { color: "#5BC8D4", abbr: "P&O" },
  "Interaction & Assistance": { color: "#D94070", abbr: "I&A" },
  "Automation & Execution": { color: "#5B8AC4", abbr: "A&E" },
  "Coding & Development": { color: "#7B68C4", abbr: "C&D" },
};
const CO = Object.keys(CATS);
const ML = ["", "Experimental", "Emerging", "Established", "Mature", "Commodity"];
const MLC = ["", "#D94070", "#F47B20", "#FBB740", "#5BC8D4", "#50D8A8"];

const BB = [
  ["Text Summarization", "Understanding & Summarization", 5],
  ["Multi-document synthesis", "Understanding & Summarization", 4],
  ["Context Understanding", "Understanding & Summarization", 4],
  ["Translation", "Understanding & Summarization", 5],
  ["Semantic Search", "Understanding & Summarization", 4],
  ["Reasoning & Logic", "Understanding & Summarization", 3],
  ["Entity Extraction", "Extraction & Structuring", 4],
  ["Classification", "Extraction & Structuring", 4],
  ["Information Mapping", "Extraction & Structuring", 3],
  ["Document Parsing", "Extraction & Structuring", 3],
  ["Knowledge Graph Generation", "Extraction & Structuring", 2],
  ["Data Quality & Enrichment", "Extraction & Structuring", 3],
  ["Text Generation", "Generation & Creativity", 4],
  ["Visual Generation", "Generation & Creativity", 4],
  ["Design Ideation", "Generation & Creativity", 3],
  ["Scenario Simulation", "Generation & Creativity", 2],
  ["Storytelling Generation", "Generation & Creativity", 3],
  ["Predictive Analytics", "Prediction & Optimization", 4],
  ["Anomaly Detection", "Prediction & Optimization", 4],
  ["Optimization Modelling", "Prediction & Optimization", 3],
  ["Scoring & Ranking", "Prediction & Optimization", 4],
  ["Decision Support", "Prediction & Optimization", 3],
  ["Conversational AI", "Interaction & Assistance", 5],
  ["Copilots", "Interaction & Assistance", 3],
  ["Knowledge Q&A", "Interaction & Assistance", 4],
  ["Contextual Recall", "Interaction & Assistance", 2],
  ["Multimodal Interaction", "Interaction & Assistance", 3],
  ["Document Automation", "Automation & Execution", 3],
  ["Workflow Automation", "Automation & Execution", 3],
  ["RPA & AI Integration", "Automation & Execution", 3],
  ["API Execution", "Automation & Execution", 3],
  ["Agentic Systems", "Automation & Execution", 1],
  ["Code Generation", "Coding & Development", 5],
  ["Code Completion", "Coding & Development", 5],
  ["Code Explanation", "Coding & Development", 4],
  ["Refactoring & Optimization", "Coding & Development", 3],
  ["Testing & Debugging", "Coding & Development", 3],
  ["Security Code Analysis", "Coding & Development", 3],
];

const UC = [
  ["Query generation", "Support", "Technology", ["Code Generation", "Context Understanding", "Reasoning & Logic", "Code Completion"]],
  ["Multi-lingual translation", "Primary", "Service", ["Translation", "Context Understanding", "Text Generation", "Classification"]],
  ["Content repurposing", "Primary", "Marketing / Sales", ["Text Generation", "Text Summarization", "Translation", "Context Understanding", "Design Ideation"]],
  ["Summarize support tickets", "Primary", "Service", ["Text Summarization", "Classification", "Entity Extraction", "Scoring & Ranking", "Anomaly Detection"]],
  ["Summarizing feedback", "Support", "Human Ressource Management", ["Text Summarization", "Classification", "Entity Extraction", "Scoring & Ranking", "Multi-document synthesis", "Anomaly Detection"]],
  ["Summarize customer insights", "Primary", "Product Management", ["Text Summarization", "Multi-document synthesis", "Classification", "Entity Extraction", "Scoring & Ranking", "Semantic Search"]],
  ["Analyze feedback", "Primary", "Product Management", ["Classification", "Scoring & Ranking", "Entity Extraction", "Text Summarization", "Semantic Search", "Anomaly Detection"]],
  ["Competitive intelligence", "Primary", "Product Management", ["Semantic Search", "Multi-document synthesis", "Entity Extraction", "Classification", "Scoring & Ranking", "Text Summarization"]],
  ["Voice-of-customer analysis", "Primary", "Service", ["Classification", "Text Summarization", "Multi-document synthesis", "Entity Extraction", "Scoring & Ranking", "Anomaly Detection"]],
  ["Summarize strategic report", "Support", "Business Direction / Management", ["Text Summarization", "Multi-document synthesis", "Entity Extraction", "Reasoning & Logic", "Context Understanding"]],
  ["Code generation", "Support", "Technology", ["Code Generation", "Code Completion", "Context Understanding", "Reasoning & Logic", "Testing & Debugging", "Code Explanation"]],
  ["Supplier risk scoring", "Support", "Procurement", ["Scoring & Ranking", "Anomaly Detection", "Predictive Analytics", "Multi-document synthesis", "Entity Extraction", "Semantic Search"]],
  ["Regulatory change monitoring", "Support", "Legal / Compliance", ["Semantic Search", "Classification", "Entity Extraction", "Multi-document synthesis", "Scoring & Ranking", "Context Understanding"]],
  ["Shipment tracking summaries", "Primary", "Logistics", ["Entity Extraction", "Text Summarization", "Anomaly Detection", "Classification", "API Execution"]],
  ["Sentiment detection", "Primary", "Service", ["Classification", "Context Understanding", "Scoring & Ranking", "Entity Extraction", "Multi-document synthesis"]],
  ["Assisted software development", "Support", "Technology", ["Code Completion", "Code Generation", "Context Understanding", "Code Explanation", "Testing & Debugging", "Refactoring & Optimization"]],
  ["Employee Q&A bots", "Support", "Human Ressource Management", ["Conversational AI", "Knowledge Q&A", "Semantic Search", "Context Understanding", "Contextual Recall", "Classification"]],
  ["Track KPIs", "Support", "Firm Infrastructure", ["Anomaly Detection", "Predictive Analytics", "Scoring & Ranking", "API Execution", "Text Summarization", "Information Mapping"]],
  ["Chatbots", "Primary", "Service", ["Conversational AI", "Knowledge Q&A", "Context Understanding", "Contextual Recall", "Classification", "Semantic Search"]],
  ["Risk assessment", "Support", "Business Direction / Management", ["Anomaly Detection", "Predictive Analytics", "Scoring & Ranking", "Multi-document synthesis", "Decision Support", "Semantic Search"]],
  ["Board reporting automation", "Support", "Business Direction / Management", ["Multi-document synthesis", "Text Generation", "Text Summarization", "Document Automation", "Visual Generation", "Information Mapping"]],
  ["Candidate screening", "Support", "Human Ressource Management", ["Scoring & Ranking", "Classification", "Entity Extraction", "Document Parsing", "Semantic Search", "Context Understanding"]],
  ["Lead scoring & prioritization", "Primary", "Marketing / Sales", ["Scoring & Ranking", "Predictive Analytics", "Classification", "Entity Extraction", "Data Quality & Enrichment", "Semantic Search"]],
  ["RFP generation / evaluation", "Support", "Procurement", ["Text Generation", "Document Parsing", "Scoring & Ranking", "Classification", "Context Understanding", "Semantic Search"]],
  ["Knowledge base auto-updating", "Primary", "Service", ["Semantic Search", "Text Generation", "Classification", "Multi-document synthesis", "Document Automation", "Knowledge Q&A"]],
  ["Compliance report drafting", "Support", "Legal / Compliance", ["Text Generation", "Multi-document synthesis", "Semantic Search", "Entity Extraction", "Document Automation", "Context Understanding"]],
  ["Policy comparison", "Support", "Legal / Compliance", ["Multi-document synthesis", "Reasoning & Logic", "Entity Extraction", "Classification", "Scoring & Ranking", "Context Understanding"]],
  ["Spend analysis", "Support", "Procurement", ["Classification", "Anomaly Detection", "Data Quality & Enrichment", "Predictive Analytics", "Scoring & Ranking", "Entity Extraction"]],
  ["Infrastructure anomaly detection", "Support", "Technology", ["Anomaly Detection", "Predictive Analytics", "Scoring & Ranking", "API Execution", "Classification"]],
  ["Vendor classification", "Support", "Procurement", ["Classification", "Scoring & Ranking", "Entity Extraction", "Data Quality & Enrichment", "Semantic Search"]],
  ["Forecast sales", "Primary", "Marketing / Sales", ["Predictive Analytics", "Scoring & Ranking", "Optimization Modelling", "Multi-document synthesis", "Anomaly Detection"]],
  ["Automate routing", "Primary", "Service", ["Classification", "Context Understanding", "Scoring & Ranking", "Entity Extraction", "Workflow Automation"]],
  ["Automated test generation", "Support", "Technology", ["Testing & Debugging", "Code Generation", "Context Understanding", "Reasoning & Logic", "Code Explanation"]],
  ["Detect anomalies", "Support", "Firm Infrastructure", ["Anomaly Detection", "Predictive Analytics", "Scoring & Ranking", "Data Quality & Enrichment", "API Execution", "Classification"]],
  ["System monitoring", "Support", "Technology", ["Anomaly Detection", "Predictive Analytics", "Scoring & Ranking", "API Execution", "Decision Support", "Classification"]],
  ["Process monitoring", "Primary", "Operations", ["Anomaly Detection", "Predictive Analytics", "Scoring & Ranking", "API Execution", "Decision Support", "Classification"]],
  ["Personalize messaging", "Primary", "Marketing / Sales", ["Text Generation", "Classification", "Scoring & Ranking", "Context Understanding", "Entity Extraction", "Contextual Recall"]],
  ["Compliance document generation", "Support", "Firm Infrastructure", ["Text Generation", "Document Automation", "Context Understanding", "Semantic Search", "Classification", "Document Parsing"]],
  ["Contract clause extraction", "Support", "Procurement", ["Document Parsing", "Entity Extraction", "Classification", "Reasoning & Logic", "Scoring & Ranking", "Context Understanding"]],
  ["Security vulnerability detection", "Support", "Technology", ["Security Code Analysis", "Scoring & Ranking", "Classification", "Semantic Search", "Testing & Debugging", "Code Explanation"]],
  ["Contract review", "Support", "Legal / Compliance", ["Document Parsing", "Reasoning & Logic", "Classification", "Scoring & Ranking", "Entity Extraction", "Context Understanding"]],
  ["Generate campaigns", "Primary", "Marketing / Sales", ["Text Generation", "Visual Generation", "Storytelling Generation", "Design Ideation", "Context Understanding", "Scoring & Ranking"]],
  ["Generate product specs", "Primary", "Product Management", ["Text Generation", "Reasoning & Logic", "Multi-document synthesis", "Scoring & Ranking", "Context Understanding", "Document Automation"]],
  ["Legacy code modernization", "Support", "Technology", ["Refactoring & Optimization", "Code Explanation", "Code Generation", "Testing & Debugging", "Security Code Analysis", "Context Understanding"]],
  ["Voice-based customer service", "Primary", "Service", ["Multimodal Interaction", "Conversational AI", "Knowledge Q&A", "Context Understanding", "Contextual Recall", "Classification"]],
  ["Visual document verification", "Support", "Firm Infrastructure", ["Multimodal Interaction", "Document Parsing", "Entity Extraction", "Anomaly Detection", "Classification", "Scoring & Ranking"]],
  ["Personalized client advisory", "Primary", "Service", ["Contextual Recall", "Conversational AI", "Knowledge Q&A", "Scoring & Ranking", "Decision Support", "Context Understanding"]],
  ["Demand prediction", "Support", "Procurement", ["Predictive Analytics", "Optimization Modelling", "Scoring & Ranking", "API Execution", "Anomaly Detection"]],
  ["Demand forecasting", "Primary", "Logistics", ["Predictive Analytics", "Optimization Modelling", "Anomaly Detection", "API Execution", "Scoring & Ranking"]],
  ["Extract data from reports", "Support", "Firm Infrastructure", ["Document Parsing", "Entity Extraction", "Classification", "Data Quality & Enrichment", "Context Understanding"]],
  ["Resume parsing", "Support", "Human Ressource Management", ["Document Parsing", "Entity Extraction", "Classification", "Data Quality & Enrichment", "Scoring & Ranking"]],
  ["Data extraction", "Support", "Technology", ["Document Parsing", "Entity Extraction", "Data Quality & Enrichment", "Classification", "Context Understanding"]],
  ["Data extraction from sensors", "Primary", "Operations", ["Entity Extraction", "Data Quality & Enrichment", "Anomaly Detection", "Classification", "API Execution"]],
  ["Personalized learning path", "Support", "Human Ressource Management", ["Scoring & Ranking", "Classification", "Knowledge Q&A", "Semantic Search", "Contextual Recall", "Reasoning & Logic"]],
  ["AI assistants for CRM", "Primary", "Marketing / Sales", ["Conversational AI", "Copilots", "Knowledge Q&A", "API Execution", "Contextual Recall", "Entity Extraction"]],
  ["Predictive maintenance", "Primary", "Operations", ["Predictive Analytics", "Anomaly Detection", "Scoring & Ranking", "Optimization Modelling", "API Execution", "Data Quality & Enrichment"]],
  ["SOP generation", "Primary", "Operations", ["Text Generation", "Document Parsing", "Context Understanding", "Classification", "Document Automation", "Information Mapping"]],
  ["Use copilots for decision prep", "Support", "Business Direction / Management", ["Copilots", "Decision Support", "Multi-document synthesis", "Reasoning & Logic", "Semantic Search", "Scoring & Ranking"]],
  ["Automate approvals", "Support", "Firm Infrastructure", ["Classification", "Scoring & Ranking", "Reasoning & Logic", "Entity Extraction", "Workflow Automation", "Document Automation"]],
  ["Onboarding automation", "Support", "Human Ressource Management", ["Workflow Automation", "Document Automation", "Text Generation", "Knowledge Q&A", "Conversational AI", "Contextual Recall"]],
  ["Financial recon automation", "Support", "Firm Infrastructure", ["Anomaly Detection", "Classification", "Entity Extraction", "Data Quality & Enrichment", "Information Mapping", "RPA & AI Integration"]],
  ["Code review automation", "Support", "Technology", ["Testing & Debugging", "Refactoring & Optimization", "Security Code Analysis", "Scoring & Ranking", "Code Explanation", "Context Understanding"]],
  ["Regulatory relationship mapping", "Support", "Legal / Compliance", ["Knowledge Graph Generation", "Entity Extraction", "Reasoning & Logic", "Semantic Search", "Classification", "Context Understanding"]],
  ["Client network analysis", "Primary", "Marketing / Sales", ["Knowledge Graph Generation", "Entity Extraction", "Scoring & Ranking", "Classification", "Data Quality & Enrichment", "Semantic Search"]],
  ["Route optimization", "Primary", "Logistics", ["Optimization Modelling", "Predictive Analytics", "API Execution", "Scoring & Ranking", "Decision Support"]],
  ["Generate strategic plans", "Support", "Business Direction / Management", ["Text Generation", "Reasoning & Logic", "Multi-document synthesis", "Context Understanding", "Scenario Simulation", "Decision Support"]],
  ["Inventory automation", "Primary", "Logistics", ["Predictive Analytics", "Optimization Modelling", "Anomaly Detection", "Workflow Automation", "API Execution", "Decision Support"]],
  ["Long-running case management", "Primary", "Service", ["Contextual Recall", "Text Summarization", "Multi-document synthesis", "Decision Support", "Workflow Automation", "Copilots"]],
  ["Automated ordering", "Support", "Procurement", ["Workflow Automation", "Predictive Analytics", "Optimization Modelling", "API Execution", "RPA & AI Integration", "Decision Support"]],
  ["Forecast scenarios", "Support", "Business Direction / Management", ["Scenario Simulation", "Predictive Analytics", "Reasoning & Logic", "Decision Support", "Optimization Modelling", "Multi-document synthesis"]],
  ["Simulate scenarios", "Primary", "Product Management", ["Scenario Simulation", "Predictive Analytics", "Reasoning & Logic", "Decision Support", "Optimization Modelling", "Multi-document synthesis"]],
  ["Autonomous research & reporting", "Support", "Business Direction / Management", ["Agentic Systems", "Semantic Search", "Multi-document synthesis", "Text Generation", "Reasoning & Logic", "Document Automation"]],
  ["Workflow automation (Tech)", "Support", "Technology", ["Workflow Automation", "RPA & AI Integration", "API Execution", "Agentic Systems", "Decision Support", "Document Automation"]],
  ["Workflow automation (Ops)", "Primary", "Operations", ["Workflow Automation", "RPA & AI Integration", "API Execution", "Agentic Systems", "Decision Support", "Document Automation"]],
  ["End-to-end process orchestration", "Primary", "Operations", ["Agentic Systems", "Workflow Automation", "API Execution", "Decision Support", "RPA & AI Integration", "Reasoning & Logic"]],
];

const ACTS = [...new Set(UC.map((u) => u[2]))].sort();
const AS = { "Business Direction / Management": "Management", "Firm Infrastructure": "Infrastruktur", "Human Ressource Management": "HR", Technology: "Technologie", Procurement: "Einkauf", "Legal / Compliance": "Legal / Compliance", "Marketing / Sales": "Marketing & Vertrieb", Service: "Service", "Product Management": "Produktmanagement", Logistics: "Logistik", Operations: "Operations" };

const bbMap = {};
BB.forEach((b) => { bbMap[b[0]] = { cat: b[1], score: b[2] }; });

function gbc(n) { return bbMap[n] ? CATS[bbMap[n].cat]?.color || "#888" : "#888"; }
function gbCat(n) { return bbMap[n]?.cat || ""; }
function gbs(n) { return bbMap[n]?.score || 0; }
function ucAvg(uc) { const bl = uc[3]; return bl.length ? bl.reduce((a, b) => a + gbs(b), 0) / bl.length : 0; }
function mLab(avg) {
  if (avg >= 4.5) return { l: "Commodity", c: "#50D8A8" };
  if (avg >= 3.8) return { l: "Mature", c: "#5BC8D4" };
  if (avg >= 3.0) return { l: "Established", c: "#FBB740" };
  if (avg >= 2.0) return { l: "Emerging", c: "#F47B20" };
  return { l: "Experimental", c: "#D94070" };
}

function SL({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a0a0a0", marginBottom: 8 }}>{children}</div>;
}

function Dots({ s, sz = 7 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ display: "inline-block", width: sz, height: sz, borderRadius: "50%", background: i <= s ? (MLC[s] || "#FBB740") : "#e8e4e0" }} />
      ))}
    </span>
  );
}

function MBadge({ avg }) {
  const m = mLab(avg);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 4, background: m.c + "18", border: "1px solid " + m.c + "30" }}>
      <Dots s={Math.round(avg)} sz={5} />
      <span style={{ fontSize: 10, fontWeight: 700, color: m.c }}>{avg.toFixed(1)}</span>
      <span style={{ fontSize: 9, color: m.c, fontWeight: 500 }}>{m.l}</span>
    </span>
  );
}

function Explorer() {
  const [fA, setFA] = useState(null);
  const [fB, setFB] = useState(null);
  const [fC, setFC] = useState(null);
  const [exp, setExp] = useState(null);
  const [sort, setSort] = useState("name");

  const bbByCat = useMemo(() => {
    const m = {};
    BB.forEach((b) => {
      if (!m[b[1]]) m[b[1]] = [];
      m[b[1]].push(b);
    });
    return m;
  }, []);

  const list = useMemo(() => {
    let u = [...UC];
    if (fA) u = u.filter((x) => x[2] === fA);
    if (fB) u = u.filter((x) => x[3].includes(fB));
    if (fC) u = u.filter((x) => x[3].some((b) => gbCat(b) === fC));
    if (sort === "md") u.sort((a, b) => ucAvg(b) - ucAvg(a));
    if (sort === "ma") u.sort((a, b) => ucAvg(a) - ucAvg(b));
    return u;
  }, [fA, fB, fC, sort]);

  const hasF = fA || fB || fC;
  const avgAll = list.length > 0 ? list.reduce((a, u) => a + ucAvg(u), 0) / list.length : 0;

  return (
    <div style={{ display: "flex", gap: 28 }}>
      <div style={{ width: 300, flexShrink: 0 }}>
        {hasF && (
          <button onClick={() => { setFA(null); setFB(null); setFC(null); }} style={{ marginBottom: 12, padding: "6px 14px", borderRadius: 6, border: "1px solid #d0ccc8", background: "#fff", color: "#5a5550", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Filter zurücksetzen
          </button>
        )}
        <div style={{ marginBottom: 20 }}>
          <SL>Wertschöpfungskette</SL>
          {ACTS.map((a) => {
            const cnt = UC.filter((u) => u[2] === a).length;
            const fCnt = list.filter((u) => u[2] === a).length;
            const sel = fA === a;
            return (
              <button key={a} onClick={() => setFA(sel ? null : a)} style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", border: "none", borderRadius: 5, background: sel ? "#2a2520" : "transparent", color: sel ? "#FBB740" : "#5a5550", fontSize: 12, fontWeight: sel ? 700 : 500, cursor: "pointer", fontFamily: "inherit", textAlign: "left", marginBottom: 1 }}>
                <span>{AS[a] || a}</span>
                <span style={{ fontSize: 10, fontWeight: 700, background: sel ? "#FBB74030" : "#f0ece8", borderRadius: 10, padding: "1px 6px", color: sel ? "#FBB740" : "#8a8580" }}>
                  {hasF ? fCnt : cnt}
                </span>
              </button>
            );
          })}
        </div>
        <SL>Building Blocks</SL>
        {CO.map((cat) => {
          const bbs = bbByCat[cat] || [];
          const cs = fC === cat;
          return (
            <div key={cat} style={{ marginBottom: 8 }}>
              <button onClick={() => setFC(cs ? null : cat)} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, background: "none", border: "none", cursor: "pointer", padding: "2px 0", fontFamily: "inherit" }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: CATS[cat].color, opacity: cs ? 1 : 0.5 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: cs ? CATS[cat].color : "#8a8580", textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat}</span>
              </button>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, paddingLeft: 14 }}>
                {bbs.map((bb) => {
                  const bs = fB === bb[0];
                  return (
                    <button key={bb[0]} onClick={() => setFB(bs ? null : bb[0])} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 4, border: "none", background: bs ? CATS[cat].color : CATS[cat].color + "18", color: bs ? "#fff" : CATS[cat].color, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: fB && !bs ? 0.4 : 1 }}>
                      {bb[0]}
                      <span style={{ fontSize: 8, fontWeight: 800, opacity: 0.7 }}>{bb[2]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SL>{list.length} Use Cases</SL>
            {list.length > 0 && <MBadge avg={avgAll} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: "#aaa" }}>Sort:</span>
            {[["name", "Name"], ["md", "Maturity \u2193"], ["ma", "Maturity \u2191"]].map(([id, label]) => (
              <button key={id} onClick={() => setSort(id)} style={{ padding: "3px 8px", borderRadius: 4, border: "none", fontSize: 10, fontWeight: 600, background: sort === id ? "#2a2520" : "#f0ece8", color: sort === id ? "#FBB740" : "#8a8580", cursor: "pointer", fontFamily: "inherit" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 580, overflowY: "auto", paddingRight: 4 }}>
          {list.map((uc, i) => {
            const key = uc[0] + "-" + i;
            const isE = exp === key;
            const avg = ucAvg(uc);
            const ml = mLab(avg);
            return (
              <div key={key} onClick={() => setExp(isE ? null : key)} style={{ background: "#fff", border: "1px solid #eae7e3", borderRadius: 8, padding: isE ? "14px 16px" : "10px 16px", cursor: "pointer", borderLeft: "3px solid " + (uc[1] === "Primary" ? "#50D8A8" : "#5BC8D4") }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#2a2520" }}>{uc[0]}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 3, background: uc[1] === "Primary" ? "#50D8A810" : "#5BC8D410", color: uc[1] === "Primary" ? "#3aaa88" : "#4aa8b4" }}>{uc[1]}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Dots s={Math.round(avg)} sz={5} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: ml.c }}>{avg.toFixed(1)}</span>
                    <span style={{ fontSize: 10, color: "#aaa8a5" }}>{AS[uc[2]]}</span>
                    <div style={{ display: "flex", gap: 2 }}>
                      {uc[3].map((b) => (
                        <span key={b} style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: gbc(b), opacity: fB === b ? 1 : 0.6 }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 10, color: "#bbb", transform: isE ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>{"\u25BC"}</span>
                  </div>
                </div>
                {isE && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f0ece8" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {uc[3].map((b) => {
                        const col = gbc(b);
                        const sc = gbs(b);
                        return (
                          <span key={b} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 5, background: col + "12", border: "1px solid " + col + "30" }}>
                            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 2, background: col }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#3a3530" }}>{b}</span>
                            <Dots s={sc} sz={5} />
                          </span>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        {Object.entries(uc[3].reduce((acc, b) => { const c = gbCat(b); if (c) acc[c] = (acc[c] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                          <span key={cat} style={{ fontSize: 10, color: CATS[cat]?.color, fontWeight: 600 }}>{CATS[cat]?.abbr}: {count}</span>
                        ))}
                      </div>
                      <MBadge avg={avg} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Finder() {
  const [sA, setSA] = useState([]);
  const [sC, setSC] = useState([]);
  const [mM, setMM] = useState(0);
  const [show, setShow] = useState(false);

  const res = useMemo(() => {
    if (!show) return [];
    let u = [...UC];
    if (sA.length) u = u.filter((x) => sA.includes(x[2]));
    if (sC.length) u = u.filter((x) => x[3].some((b) => sC.includes(gbCat(b))));
    if (mM > 0) u = u.filter((x) => ucAvg(x) >= mM);
    return u.map((uc) => {
      const rel = sC.length ? uc[3].filter((b) => sC.includes(gbCat(b))).length / uc[3].length : 1;
      return { d: uc, rel, avg: ucAvg(uc) };
    }).sort((a, b) => b.rel - a.rel || b.avg - a.avg);
  }, [show, sA, sC, mM]);

  const topB = useMemo(() => {
    const f = {};
    res.forEach((r) => r.d[3].forEach((b) => (f[b] = (f[b] || 0) + 1)));
    return Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, 15);
  }, [res]);

  const mDist = useMemo(() => {
    const d = { Experimental: 0, Emerging: 0, Established: 0, Mature: 0, Commodity: 0 };
    res.forEach((r) => { d[mLab(r.avg).l]++; });
    return d;
  }, [res]);

  const reset = () => { setSA([]); setSC([]); setMM(0); setShow(false); };
  const canGo = sA.length > 0 || sC.length > 0 || mM > 0;

  if (show && res.length > 0) {
    const oA = res.reduce((a, r) => a + r.avg, 0) / res.length;
    return (
      <div>
        <button onClick={reset} style={{ marginBottom: 16, padding: "8px 16px", borderRadius: 6, border: "1px solid #d0ccc8", background: "#fff", color: "#5a5550", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {"\u2190"} Neue Analyse
        </button>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <SL>{res.length} relevante Use Cases</SL>
              <MBadge avg={oA} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 520, overflowY: "auto" }}>
              {res.map((r, i) => {
                const uc = r.d;
                const ml = mLab(r.avg);
                return (
                  <div key={uc[0] + i} style={{ background: "#fff", border: "1px solid #eae7e3", borderRadius: 8, padding: "12px 16px", borderLeft: "3px solid " + ml.c }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#2a2520" }}>{uc[0]}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 3, background: uc[1] === "Primary" ? "#50D8A810" : "#5BC8D410", color: uc[1] === "Primary" ? "#3aaa88" : "#4aa8b4" }}>{uc[1]}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: "#aaa8a5" }}>{AS[uc[2]]}</span>
                        <MBadge avg={r.avg} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                      {uc[3].map((b) => {
                        const hl = !sC.length || sC.includes(gbCat(b));
                        return (
                          <span key={b} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 3, fontSize: 10, fontWeight: 600, background: hl ? gbc(b) + "18" : "#f5f3f0", color: hl ? gbc(b) : "#bbb", border: "1px solid " + (hl ? gbc(b) + "30" : "#eee") }}>
                            {b} <span style={{ fontSize: 8, fontWeight: 800, opacity: 0.6 }}>{gbs(b)}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ width: 280, flexShrink: 0 }}>
            <SL>Profil</SL>
            <div style={{ background: "#faf8f5", borderRadius: 8, padding: 14, marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><div style={{ fontSize: 22, fontWeight: 800, color: "#2a2520" }}>{res.length}</div><div style={{ fontSize: 10, color: "#8a8580" }}>Use Cases</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 800, color: mLab(oA).c }}>{oA.toFixed(1)}</div><div style={{ fontSize: 10, color: "#8a8580" }}>Avg Maturity</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 800, color: "#50D8A8" }}>{res.filter((r) => r.d[1] === "Primary").length}</div><div style={{ fontSize: 10, color: "#8a8580" }}>Primary</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 800, color: "#5BC8D4" }}>{res.filter((r) => r.d[1] === "Support").length}</div><div style={{ fontSize: 10, color: "#8a8580" }}>Support</div></div>
            </div>
            <SL>Maturity-Verteilung</SL>
            <div style={{ background: "#faf8f5", borderRadius: 8, padding: 14, marginBottom: 20 }}>
              {["Commodity", "Mature", "Established", "Emerging", "Experimental"].map((label) => {
                const cnt = mDist[label] || 0;
                const idx = ML.indexOf(label);
                return (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 80, fontSize: 10, fontWeight: 600, color: MLC[idx], textAlign: "right" }}>{label}</span>
                    <div style={{ flex: 1, height: 8, background: "#eae7e3", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: res.length > 0 ? (cnt / res.length) * 100 + "%" : "0%", height: "100%", background: MLC[idx], borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#5a5550", width: 18, textAlign: "right" }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
            <SL>Top Building Blocks</SL>
            {topB.map(([name, cnt]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: 1, background: gbc(name), flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: "#3a3530", flex: 1 }}>{name}</span>
                <Dots s={gbs(name)} sz={4} />
                <span style={{ fontSize: 10, color: "#aaa", width: 28, textAlign: "right" }}>{Math.round((cnt / res.length) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <p style={{ fontSize: 14, color: "#5a5550", lineHeight: 1.6, marginBottom: 24, marginTop: 0 }}>
        Identifizieren Sie die relevantesten KI-Anwendungsfälle für Ihre Organisation.
      </p>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ display: "inline-flex", width: 24, height: 24, borderRadius: "50%", background: "#2a2520", color: "#FBB740", fontSize: 12, fontWeight: 800, alignItems: "center", justifyContent: "center" }}>1</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#3a3530" }}>Bereiche der Wertschöpfungskette</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ACTS.map((a) => {
            const sel = sA.includes(a);
            return (
              <button key={a} onClick={() => setSA((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a])} style={{ padding: "8px 14px", borderRadius: 6, border: sel ? "2px solid #2a2520" : "1px solid #e0dbd3", background: sel ? "#2a2520" : "#fff", color: sel ? "#FBB740" : "#5a5550", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {AS[a]} ({UC.filter((u) => u[2] === a).length})
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ display: "inline-flex", width: 24, height: 24, borderRadius: "50%", background: "#2a2520", color: "#FBB740", fontSize: 12, fontWeight: 800, alignItems: "center", justifyContent: "center" }}>2</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#3a3530" }}>KI-Fähigkeiten</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CO.map((cat) => {
            const sel = sC.includes(cat);
            const col = CATS[cat].color;
            return (
              <button key={cat} onClick={() => setSC((p) => p.includes(cat) ? p.filter((x) => x !== cat) : [...p, cat])} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, border: sel ? "2px solid " + col : "1px solid #e0dbd3", background: sel ? col + "18" : "#fff", color: sel ? col : "#5a5550", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {cat}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ display: "inline-flex", width: 24, height: 24, borderRadius: "50%", background: "#2a2520", color: "#FBB740", fontSize: 12, fontWeight: 800, alignItems: "center", justifyContent: "center" }}>3</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#3a3530" }}>Mindest-Reifegrad</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[[0, "Alle"], [2, "Emerging+"], [3, "Established+"], [4, "Mature+"]].map(([v, l]) => (
            <button key={v} onClick={() => setMM(v)} style={{ padding: "8px 16px", borderRadius: 6, border: mM === v ? "2px solid #2a2520" : "1px solid #e0dbd3", background: mM === v ? "#2a2520" : "#fff", color: mM === v ? "#FBB740" : "#5a5550", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => setShow(true)} disabled={!canGo} style={{ padding: "12px 32px", borderRadius: 8, border: "none", background: canGo ? "#2a2520" : "#e0dbd3", color: canGo ? "#FBB740" : "#aaa", fontSize: 14, fontWeight: 700, cursor: canGo ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
        Use Cases identifizieren {"\u2192"}
      </button>
    </div>
  );
}

function Dashboard() {
  const bFreq = useMemo(() => {
    const f = {};
    UC.forEach((uc) => uc[3].forEach((b) => (f[b] = (f[b] || 0) + 1)));
    return Object.entries(f).sort((a, b) => b[1] - a[1]);
  }, []);

  const catD = useMemo(() => {
    const d = {};
    CO.forEach((c) => (d[c] = { count: 0, scores: [] }));
    UC.forEach((uc) => uc[3].forEach((b) => {
      const c = gbCat(b);
      if (c && d[c]) { d[c].count++; d[c].scores.push(gbs(b)); }
    }));
    return d;
  }, []);

  const actD = useMemo(() => {
    const d = {};
    UC.forEach((uc) => {
      if (!d[uc[2]]) d[uc[2]] = { count: 0, ts: 0 };
      d[uc[2]].count++;
      d[uc[2]].ts += ucAvg(uc);
    });
    return Object.entries(d).map(([a, v]) => ({ a, count: v.count, avg: v.ts / v.count })).sort((a, b) => b.count - a.count);
  }, []);

  const mB = useMemo(() => {
    const b = { Experimental: 0, Emerging: 0, Established: 0, Mature: 0, Commodity: 0 };
    UC.forEach((uc) => { b[mLab(ucAvg(uc)).l]++; });
    return b;
  }, []);

  const tc = UC.reduce((a, u) => a + u[3].length, 0);
  const oA = UC.reduce((a, u) => a + ucAvg(u), 0) / UC.length;
  const mxC = Math.max(...Object.values(catD).map((d) => d.count));
  const mxF = bFreq[0]?.[1] || 1;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 28 }}>
        {[["Use Cases", UC.length, "#2a2520"], ["Building Blocks", BB.length, "#FBB740"], ["Kategorien", 7, "#F47B20"], ["Zuordnungen", tc, "#50D8A8"], ["Avg Blocks/UC", (tc / UC.length).toFixed(1), "#5BC8D4"], ["Avg Maturity", oA.toFixed(1), mLab(oA).c]].map(([l, v, c]) => (
          <div key={l} style={{ background: "#fff", border: "1px solid #eae7e3", borderRadius: 8, padding: "14px 12px" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 10, color: "#8a8580" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #eae7e3", borderRadius: 8, padding: "16px 20px", marginBottom: 28 }}>
        <SL>Use Case Maturity-Verteilung</SL>
        <div style={{ display: "flex", height: 28, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
          {["Commodity", "Mature", "Established", "Emerging", "Experimental"].map((label) => {
            const cnt = mB[label];
            if (!cnt) return null;
            const idx = ML.indexOf(label);
            return (
              <div key={label} style={{ flex: cnt, background: MLC[idx], display: "flex", alignItems: "center", justifyContent: "center", minWidth: 30 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{cnt}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {["Commodity", "Mature", "Established", "Emerging", "Experimental"].map((label) => {
            const idx = ML.indexOf(label);
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: MLC[idx] }} />
                <span style={{ fontSize: 10, color: "#5a5550" }}>{label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#2a2520" }}>{mB[label]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        <div style={{ flex: 1 }}>
          <SL>Reifegrad nach Kategorie</SL>
          {CO.map((cat) => {
            const d = catD[cat];
            const avgC = d.scores.length ? d.scores.reduce((a, b) => a + b, 0) / d.scores.length : 0;
            return (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: CATS[cat].color }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#3a3530" }}>{cat}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Dots s={Math.round(avgC)} sz={5} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#8a8580" }}>{avgC.toFixed(1)}</span>
                  </div>
                </div>
                <div style={{ height: 18, background: "#f5f3f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: (d.count / mxC) * 100 + "%", height: "100%", borderRadius: 4, background: CATS[cat].color, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{d.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 28 }}>
            <SL>Wertschöpfungsaktivitäten</SL>
            {actD.map(({ a: activity, count, avg }) => {
              const ml = mLab(avg);
              return (
                <div key={activity} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0ece8", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#5a5550", width: 140, flexShrink: 0 }}>{AS[activity]}</span>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#f0ece8", overflow: "hidden" }}>
                    <div style={{ width: (count / actD[0].count) * 100 + "%", height: "100%", background: "#FBB740", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#2a2520", width: 22, textAlign: "right" }}>{count}</span>
                  <Dots s={Math.round(avg)} sz={4} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: ml.c }}>{avg.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ width: 400, flexShrink: 0 }}>
          <SL>Block Frequenz + Maturity</SL>
          {bFreq.map(([name, cnt]) => {
            const sc = gbs(name);
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: 1, background: gbc(name), flexShrink: 0 }} />
                <span style={{ width: 150, fontSize: 10, fontWeight: 600, color: "#5a5550", flexShrink: 0, textAlign: "right" }}>{name}</span>
                <div style={{ flex: 1, height: 11, background: "#f5f3f0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: (cnt / mxF) * 100 + "%", height: "100%", borderRadius: 3, background: gbc(name), display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4 }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>{cnt}</span>
                  </div>
                </div>
                <Dots s={sc} sz={4} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("explorer");

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fdfcfa", minHeight: "100vh", padding: "28px 36px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap" rel="stylesheet" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(135deg, #FBB740, #F47B20)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800 }}>AI</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#2a2520" }}>AI Building Blocks Framework</h1>
            <p style={{ margin: 0, fontSize: 11, color: "#a0a0a0" }}>{BB.length} Bausteine · {UC.length} Use Cases · 5-Stufen Maturity Model</p>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#a0a0a0", letterSpacing: "0.05em" }}>MMG Management Consulting</span>
      </div>

      <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid #e8e4e0" }}>
        {[["explorer", "Framework Explorer"], ["finder", "Use Case Finder"], ["dashboard", "Maturity Dashboard"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "10px 20px", border: "none", borderBottom: tab === id ? "2px solid #FBB740" : "2px solid transparent", background: "transparent", color: tab === id ? "#2a2520" : "#a0a0a0", fontSize: 13, fontWeight: tab === id ? 700 : 500, cursor: "pointer", fontFamily: "inherit", marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "explorer" && <Explorer />}
      {tab === "finder" && <Finder />}
      {tab === "dashboard" && <Dashboard />}

      <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #eae7e3", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {CO.map((cat) => (
            <span key={cat} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: CATS[cat].color }} />
              <span style={{ fontSize: 10, color: "#a0a0a0" }}>{cat}</span>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {ML.slice(1).map((label, idx) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: MLC[idx + 1] }} />
              <span style={{ fontSize: 9, color: "#a0a0a0" }}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
