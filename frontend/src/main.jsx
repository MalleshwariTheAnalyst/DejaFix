import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  Activity,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Database,
  Layers3,
  RotateCcw,
  Send,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

import "./styles.css";

const API_URL = "https://deja-fix.vercel.app";

const DEMO_INCIDENT =
  "Payment API is experiencing database connection timeouts during peak traffic.";

const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Encounter",
    subtitle: "New incident",
  },
  {
    number: "02",
    title: "Recall",
    subtitle: "Hindsight memory",
  },
  {
    number: "03",
    title: "Reason",
    subtitle: "AI analysis",
  },
  {
    number: "04",
    title: "Resolve",
    subtitle: "Actionable fix",
  },
  {
    number: "05",
    title: "Learn",
    subtitle: "Retain experience",
  },
];

function cleanMarkdown(text = "") {
  return text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

function getSections(text = "") {
  const cleaned = cleanMarkdown(text);

  const sectionNames = [
    "Likely Root Cause",
    "Relevant Previous Incident",
    "Previous Resolution",
    "Recommended Action",
    "Relevant Runbook",
    "Why This Memory Matters",
  ];

  const sections = [];
  let current = null;

  cleaned.split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) return;

    const heading = sectionNames.find(
      (name) => name.toLowerCase() === trimmed.toLowerCase()
    );

    if (heading) {
      current = {
        title: heading,
        content: [],
      };

      sections.push(current);
      return;
    }

    if (current) {
      current.content.push(trimmed);
    }
  });

  if (sections.length === 0 && cleaned) {
    return [
      {
        title: "AI Analysis",
        content: [cleaned],
      },
    ];
  }

  return sections;
}

function App() {
  const [incident, setIncident] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
    workflowStage:
    0 = idle
    1 = encounter
    2 = recall
    3 = reason
    4 = resolve
    5 = learn
    6 = completed
  */
  const [workflowStage, setWorkflowStage] = useState(0);

  useEffect(() => {
    if (!loading) return;

    setWorkflowStage(1);

    const timers = [
      setTimeout(() => setWorkflowStage(2), 900),
      setTimeout(() => setWorkflowStage(3), 1900),
      setTimeout(() => setWorkflowStage(4), 3000),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [loading]);

  const analyzeIncident = async () => {
    if (!incident.trim()) {
      setError("Describe an incident before starting the analysis.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");
    setWorkflowStage(1);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incident: incident.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Analysis failed.");
      }

      setWorkflowStage(5);

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      setResult(data);
      setWorkflowStage(6);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Could not connect to DejaFix. Make sure the backend is running."
      );

      setWorkflowStage(0);
    } finally {
      setLoading(false);
    }
  };

  const useDemo = () => {
    setIncident(DEMO_INCIDENT);
    setResult(null);
    setError("");
    setWorkflowStage(0);
  };

  const clearAll = () => {
    setIncident("");
    setResult(null);
    setError("");
    setWorkflowStage(0);
  };

  const memory = result?.memory_summary;
  const sections = result ? getSections(result.analysis) : [];

  const getWorkflowClass = (index) => {
    if (workflowStage === 6) {
      return "workflow-item completed";
    }

    if (workflowStage === index + 1) {
      return "workflow-item active";
    }

    if (workflowStage > index + 1) {
      return "workflow-item passed";
    }

    return "workflow-item";
  };

  return (
    <div className="app">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            <Brain size={21} strokeWidth={2.3} />
          </div>

          <div>
            <div className="brand-name">
              DejaFix
            </div>

            <div className="brand-subtitle">
              INCIDENT INTELLIGENCE
            </div>
          </div>

        </div>


        <div className="sidebar-status">

          <span className="status-indicator" />

          <span>
            System online
          </span>

        </div>


        <div className="sidebar-block">

          <div className="sidebar-heading">
            WORKFLOW
          </div>


          <div className="workflow">

            {WORKFLOW_STEPS.map((step, index) => (

              <React.Fragment key={step.number}>

                <div className={getWorkflowClass(index)}>

                  <div className="workflow-number">

                    {workflowStage === 6 ||
                    workflowStage > index + 1 ? (
                      <Check size={13} />
                    ) : (
                      step.number
                    )}

                  </div>


                  <div className="workflow-text">

                    <strong>
                      {step.title}
                    </strong>

                    <span>
                      {step.subtitle}
                    </span>

                  </div>

                </div>


                {index < WORKFLOW_STEPS.length - 1 && (

                  <div
                    className={
                      workflowStage > index + 1 ||
                      workflowStage === 6
                        ? "workflow-line filled"
                        : "workflow-line"
                    }
                  />

                )}

              </React.Fragment>

            ))}

          </div>

        </div>


        <div className="sidebar-spacer" />


        <div className="memory-status">

          <div className="memory-status-icon">
            <Database size={17} />
          </div>

          <div className="memory-status-text">

            <strong>
              Hindsight Memory
            </strong>

            <span>
              Connected & learning
            </span>

          </div>

          <CheckCircle2
            size={17}
            className="connected-icon"
          />

        </div>


        <div className="sidebar-footer">

          <span>
            DejaFix v1.0
          </span>

          <span>
            AI + Memory
          </span>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="main">


        {/* TOP BAR */}

        <header className="topbar">

          <div className="topbar-left">

            <span className="live-dot" />

            <span>
              LIVE INCIDENT INTELLIGENCE
            </span>

          </div>


          <div className="topbar-right">

            <div className="integration hindsight">

              <Database size={14} />

              Hindsight

              <span className="tiny-check">
                ✓
              </span>

            </div>


            <div className="integration gemini">

              <Sparkles size={14} />

              Gemini

              <span className="tiny-check">
                ✓
              </span>

            </div>

          </div>

        </header>


        {/* HERO */}

        <section className="hero">

          <div className="hero-copy">

            <div className="eyebrow">
              AI INCIDENT RESPONSE AGENT
            </div>

            <h1>
              Production incidents
              <br />

              <span>
                with memory.
              </span>
            </h1>

            <p>
              DejaFix remembers how your team solved incidents
              before, then uses that experience to reason about
              what is happening now.
            </p>

          </div>


          <div className="hero-visual">

            <div className="hero-orbit orbit-one" />

            <div className="hero-orbit orbit-two" />

            <div className="hero-core">
              <Brain size={30} />
            </div>

            <div className="hero-node node-one">
              <Database size={15} />
            </div>

            <div className="hero-node node-two">
              <Sparkles size={15} />
            </div>

            <div className="hero-node node-three">
              <Zap size={15} />
            </div>

          </div>

        </section>


        {/* INCIDENT CONSOLE */}

        <section className="incident-card">

          <div className="card-header">

            <div className="card-title-group">

              <div className="card-icon cyan">
                <Terminal size={18} />
              </div>

              <div>

                <div className="card-label">
                  INCIDENT CONSOLE
                </div>

                <h2>
                  Describe the problem
                </h2>

              </div>

            </div>


            <button
              className="demo-button"
              onClick={useDemo}
            >
              <Sparkles size={14} />

              Load demo
            </button>

          </div>


          <div className="input-wrapper">

            <textarea
              value={incident}
              onChange={(e) => {
                setIncident(e.target.value);
                setError("");
              }}
              placeholder="Example: Payment API is experiencing database connection timeouts during peak traffic..."
            />

            <div className="input-bottom">

              <span className="input-hint">
                DejaFix will recall relevant engineering
                experience before reasoning about this incident.
              </span>

              <span className="character-count">
                {incident.length} chars
              </span>

            </div>

          </div>


          <div className="action-row">

            <button
              className="analyze-button"
              onClick={analyzeIncident}
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner" />

                  Analyzing incident...
                </>
              ) : (
                <>
                  Analyze incident

                  <Send size={16} />
                </>
              )}

            </button>


            {incident && !loading && (

              <button
                className="clear-button"
                onClick={clearAll}
              >
                <RotateCcw size={14} />

                Clear
              </button>

            )}

          </div>


          {error && (

            <div className="error-message">

              <Activity size={16} />

              {error}

            </div>

          )}

        </section>


        {/* EMPTY */}

        {!result && !loading && (

          <section className="empty-panel">

            <div className="empty-icon">
              <Layers3 size={24} />
            </div>

            <div>

              <h3>
                Ready to investigate
              </h3>

              <p>
                Enter an incident above to activate
                Hindsight memory and AI reasoning.
              </p>

            </div>

            <ChevronRight size={19} />

          </section>

        )}


        {/* LOADING */}

        {loading && (

          <section className="loading-panel">

            <div className="loading-animation">

              <span />
              <span />
              <span />

            </div>


            <div>

              <strong>
                DejaFix is investigating...
              </strong>

              <p>
                Recalling Hindsight memory and generating
                a context-aware response.
              </p>

            </div>

          </section>

        )}


        {/* RESULTS */}

        {result && !loading && (

          <section className="results">

            <div className="results-header">

              <div>

                <div className="eyebrow">
                  ANALYSIS COMPLETE
                </div>

                <h2>
                  DejaFix found relevant experience.
                </h2>

              </div>


              <div className="saved-badge">

                <Check size={14} />

                Experience retained

              </div>

            </div>


            {/* RESULT GRID */}

            <div className="result-grid">


              {/* MEMORY */}

              <article className="panel memory-panel">

                <div className="panel-top">

                  <div className="panel-heading">

                    <div className="panel-icon memory">
                      <Database size={17} />
                    </div>

                    <div>

                      <span className="panel-label">
                        HINDSIGHT MEMORY
                      </span>

                      <h3>
                        What DejaFix remembered
                      </h3>

                    </div>

                  </div>


                  <div className="memory-count-badge">
                    {memory?.incident_count || 0}
                  </div>

                </div>


                {memory && (

                  <>

                    <div className="memory-banner">

                      <span className="memory-pulse" />

                      Relevant historical experience recalled

                    </div>


                    <div className="memory-list">

                      <div className="memory-row">

                        <div className="row-label">
                          Previous incidents
                        </div>

                        <div className="tags">

                          {(memory.incidents || [])
                            .slice(0, 6)
                            .map((item) => (

                              <span
                                className="tag"
                                key={item}
                              >
                                {item}
                              </span>

                            ))}

                          {(memory.incidents || []).length > 6 && (

                            <span className="tag muted">
                              +
                              {memory.incidents.length - 6}
                            </span>

                          )}

                        </div>

                      </div>


                      <div className="memory-row">

                        <div className="row-label">
                          Recurring root cause
                        </div>

                        <div className="row-value strong">

                          {memory.root_causes?.length
                            ? memory.root_causes[0]
                            : "No matching cause found"}

                        </div>

                      </div>


                      <div className="memory-row">

                        <div className="row-label">
                          Previous resolution
                        </div>

                        <div className="row-value">

                          {memory.resolutions?.[0] ||
                            "No previous resolution found"}

                        </div>

                      </div>


                      <div className="memory-row">

                        <div className="row-label">
                          Runbooks
                        </div>

                        <div className="tags">

                          {(memory.runbooks || []).map(
                            (item) => (

                              <span
                                className="tag runbook"
                                key={item}
                              >
                                {item}
                              </span>

                            )
                          )}

                        </div>

                      </div>

                    </div>

                  </>

                )}

              </article>


              {/* AI */}

              <article className="panel ai-panel">

                <div className="panel-top">

                  <div className="panel-heading">

                    <div className="panel-icon ai">
                      <Sparkles size={17} />
                    </div>

                    <div>

                      <span className="panel-label">
                        AI REASONING
                      </span>

                      <h3>
                        DejaFix analysis
                      </h3>

                    </div>

                  </div>


                  <div className="model-badge">
                    {result.model_used || "Gemini"}
                  </div>

                </div>


                <div className="analysis">

                  {sections.map(
                    (section, index) => (

                      <div
                        className="analysis-section"
                        key={`${section.title}-${index}`}
                      >

                        <div className="analysis-heading">

                          <span>
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <h4>
                            {section.title}
                          </h4>

                        </div>


                        <div className="analysis-body">

                          {section.content.map(
                            (line, lineIndex) => {

                              const isList =
                                /^\d+\.\s/.test(line) ||
                                /^[-•]/.test(line);

                              const content = line
                                .replace(
                                  /^\d+\.\s*/,
                                  ""
                                )
                                .replace(
                                  /^[-•]\s*/,
                                  ""
                                );

                              if (isList) {

                                return (
                                  <div
                                    className="recommendation"
                                    key={lineIndex}
                                  >

                                    <div className="recommendation-number">
                                      {lineIndex + 1}
                                    </div>

                                    <p>
                                      {content}
                                    </p>

                                  </div>
                                );

                              }

                              return (
                                <p key={lineIndex}>
                                  {content}
                                </p>
                              );
                            }
                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              </article>

            </div>


            {/* LEARNING */}

            <article className="learning-panel">

              <div className="learning-heading">

                <div className="panel-icon learning">
                  <Brain size={18} />
                </div>

                <div>

                  <span className="panel-label">
                    CONTINUOUS LEARNING
                  </span>

                  <h3>
                    This incident becomes experience.
                  </h3>

                </div>

              </div>


              <div className="learning-track">

                <div className="learning-step complete">

                  <div className="learning-step-icon">
                    <Check size={15} />
                  </div>

                  <div>
                    <strong>
                      Incident
                    </strong>

                    <span>
                      Encountered
                    </span>
                  </div>

                </div>


                <div className="learning-connector">
                  <ArrowRight size={16} />
                </div>


                <div className="learning-step complete">

                  <div className="learning-step-icon">
                    <Check size={15} />
                  </div>

                  <div>
                    <strong>
                      Recall
                    </strong>

                    <span>
                      Hindsight searched
                    </span>
                  </div>

                </div>


                <div className="learning-connector">
                  <ArrowRight size={16} />
                </div>


                <div className="learning-step complete">

                  <div className="learning-step-icon">
                    <Check size={15} />
                  </div>

                  <div>
                    <strong>
                      Reason
                    </strong>

                    <span>
                      Gemini analyzed
                    </span>
                  </div>

                </div>


                <div className="learning-connector">
                  <ArrowRight size={16} />
                </div>


                <div className="learning-step complete">

                  <div className="learning-step-icon">
                    <Check size={15} />
                  </div>

                  <div>
                    <strong>
                      Retain
                    </strong>

                    <span>
                      Experience saved
                    </span>
                  </div>

                </div>

              </div>


              <p className="learning-description">

                The next similar incident can retrieve this
                experience, allowing DejaFix to improve its
                response over time.

              </p>

            </article>

          </section>

        )}


        {/* FOOTER */}

        <footer className="footer">

          <div className="footer-brand">

            <Brain size={15} />

            DejaFix

          </div>

          <div>
            AI Incident Response · Hindsight Memory · Gemini
          </div>

          <div>
            Built for intelligent operations
          </div>

        </footer>

      </main>

    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);