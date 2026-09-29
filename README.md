
# DejaFix — AI Incident Response with Hindsight Memory

> **An AI-powered incident-response agent that recalls previous production incidents before reasoning about a new one, then retains the new investigation for future use.**

DejaFix helps engineers investigate recurring production incidents by combining **persistent incident memory** with **LLM-based reasoning**.

Instead of treating every incident as a completely new problem, DejaFix follows:

**Encounter → Recall → Reason → Resolve → Learn**

The system uses **Hindsight** as the persistent memory layer and **Gemini** as the reasoning model.

---

## 🚀 Why DejaFix?

Production incidents often repeat.

A database connection problem, deployment issue, overloaded dependency, or API failure may have already happened before. A stateless AI assistant can analyze the current error, but it does not automatically have access to the team's previous incident experience.

DejaFix addresses this by retrieving relevant historical experience **before** generating its analysis.

### Traditional approach

```text
New Incident
     ↓
LLM
     ↓
Analysis
```

### DejaFix approach

```text
New Incident
     ↓
Hindsight Recall
     ↓
Historical Incident Experience
     ↓
Gemini Reasoning
     ↓
Incident Analysis
     ↓
Hindsight Retain
     ↓
Future Incident Experience
```

The key idea is simple:

> **Recall relevant experience before reasoning, then retain the new experience afterward.**

---

# ✨ Key Features

### 🧠 Persistent Incident Memory

DejaFix uses Hindsight to retrieve relevant historical incident experience instead of relying only on the current prompt.

### 🔎 Historical Context

The system identifies useful information from recalled incidents, including:

* Previous incident IDs
* Recurring root causes
* Previous resolutions
* Relevant runbooks
* Historical patterns

### 🤖 AI-Powered Reasoning

Gemini receives both:

1. The current production incident
2. Relevant historical experience

This allows the model to reason using the current problem together with previous operational knowledge.

### 🔄 Continuous Learning Loop

After an investigation is completed, DejaFix retains the incident and its analysis in Hindsight.

```text
Incident
   ↓
Recall
   ↓
Reason
   ↓
Resolve
   ↓
Retain
   ↓
Future Recall
```

### 🖥️ Interactive Incident Console

The React frontend provides a visual workflow for:

* Entering incidents
* Viewing recalled memory
* Viewing AI reasoning
* Viewing recommended actions
* Viewing continuous learning information

### ☁️ Deployed Application

The application is deployed using Vercel so the project can be accessed through a public web interface.

---

# 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      Engineer        │
                    │  Incident Console    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    React + Vite      │
                    │     Frontend         │
                    └──────────┬───────────┘
                               │
                               │ POST /analyze
                               ▼
                    ┌──────────────────────┐
                    │       FastAPI        │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
                     ▼                   ▼
             ┌──────────────┐    ┌──────────────┐
             │   Hindsight  │    │    Gemini    │
             │    Recall    │    │   Reasoning  │
             └──────┬───────┘    └──────┬───────┘
                    │                   │
                    │ Historical        │
                    │ Experience        │
                    └─────────┬─────────┘
                              ▼
                    ┌──────────────────────┐
                    │ Incident Analysis    │
                    │ + Recommendations    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Hindsight Retain   │
                    │ Future Experience    │
                    └──────────────────────┘
```

---

# 🔄 How It Works

## 1. Encounter

An engineer enters a production incident.

Example:

```text
Payment API is experiencing database connection
timeouts during peak traffic.
```

---

## 2. Recall

Before asking Gemini to reason about the incident, DejaFix queries Hindsight:

```python
memories = hindsight.recall(
    bank_id=BANK_ID,
    query=incident,
)
```

This retrieves historical experience relevant to the current incident.

---

## 3. Reason

The recalled memory is combined with the current incident and provided to Gemini.

The model is instructed to analyze:

* Likely root cause
* Relevant previous incident
* Previous resolution
* Recommended action
* Relevant runbook
* Why the historical memory matters

This prevents the reasoning step from being isolated from previous operational experience.

---

## 4. Resolve

The generated response provides practical engineering guidance based on the current incident and retrieved historical context.

For example, a database connection timeout may lead to recommendations such as:

* Increasing the database connection pool
* Performing a rolling restart
* Monitoring database metrics
* Investigating long-running SQL queries

---

## 5. Learn

After the analysis is generated, DejaFix stores the current investigation in Hindsight:

```python
hindsight.retain(
    bank_id=BANK_ID,
    content=f"""
Production Incident:

{incident}

DejaFix Analysis:

{answer}
""",
    context="DejaFix incident analysis and resolution",
)
```

This means the current investigation can become historical experience for a future incident.

---

# 🧪 Real Test

DejaFix was tested with:

```text
Payment API is experiencing database connection
timeouts during peak traffic.
```

Hindsight recalled **5 relevant historical experiences**, including:

```text
INC-011
INC-001
INC-007
INC-017
INC-012
```

The retrieved experience identified a recurring pattern:

| Information            | Retrieved Result                                    |
| ---------------------- | --------------------------------------------------- |
| Root Cause             | Database connection pool exhaustion                 |
| Previous Resolution    | Increase database connection pool + rolling restart |
| Relevant Runbook       | `API-IDEM-01`                                     |
| Most Relevant Incident | `INC-011`                                         |
| AI Model               | Gemini 2.5 Flash                                    |

The analysis connected the current incident to the previous failure pattern and recommended increasing the database connection pool, performing a rolling restart, monitoring database metrics, and investigating long-running SQL queries.

This demonstrates the main purpose of DejaFix:

> The agent does not only analyze the current incident. It can bring relevant previous incident experience into the investigation.

---

# 🛠️ Tech Stack

| Layer      | Technology          |
| ---------- | ------------------- |
| Frontend   | React               |
| Build Tool | Vite                |
| Backend    | FastAPI             |
| Memory     | Hindsight           |
| Reasoning  | Gemini              |
| Language   | Python / JavaScript |
| Deployment | Vercel              |
| API        | REST                |

---

# 📁 Project Structure

```text
DejaFix_React/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── venv/
│
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── README.md
└── vercel.json
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have:

* Python 3.10+
* Node.js
* npm
* A Gemini API key
* A Hindsight API key

---

## 1. Clone the Repository

```bash
git clone https://github.com/MalleshwariTheAnalyst/DejaFix.git
```

```bash
cd DejaFix
```

---

# 2. Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

Activate it:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
HINDSIGHT_API_KEY=your_hindsight_api_key
```

**Never commit your API keys to GitHub.**

The project uses `.gitignore` to keep sensitive files such as `.env` and the Python virtual environment out of the repository.

---

# 4. Start the Backend

From the `backend` directory:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Health endpoint:

```text
http://127.0.0.1:8000/health
```

---

# 5. Start the Frontend

Open another terminal.

Move to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide a local URL similar to:

```text
http://localhost:5173
```

Open the URL in your browser.

---

# 🔐 Environment & Security

API keys should never be hard-coded into the source code.

Use environment variables:

```env
GEMINI_API_KEY=...
HINDSIGHT_API_KEY=...
```

Do not commit:

```text
.env
venv/
__pycache__/
node_modules/
```

to the repository.

---

# 📡 API

## `POST /analyze`

Analyzes a production incident using historical Hindsight memory and Gemini reasoning.

### Request

```json
{
  "incident": "Payment API is experiencing database connection timeouts during peak traffic."
}
```

### Processing

```text
Incident
   ↓
Hindsight Recall
   ↓
Memory Context
   ↓
Gemini
   ↓
Analysis
   ↓
Hindsight Retain
```

### Response

The endpoint returns information including:

* AI analysis
* Historical memory
* Memory summary
* Model used
* Whether the new experience was retained

---

# 🧠 Why Hindsight?

The central architectural decision in DejaFix is using a dedicated memory layer rather than putting all historical incidents directly into the model prompt.

Hindsight provides the mechanism for:

**Recall → Reason → Retain**

This separates the agent's responsibilities:

```text
Hindsight
    ↓
Experience / Memory

Gemini
    ↓
Reasoning

DejaFix
    ↓
Incident-response workflow
```

This separation makes it possible to build the incident workflow around persistent experience rather than treating every investigation as an isolated request.

---

# 📊 Lessons Learned

### 1. Memory needs to enter the reasoning loop

Storing historical incidents is not enough.

The useful part is retrieving relevant experience **before** generating the current response.

---

### 2. Memory quality matters

Irrelevant, duplicated, or outdated memories can provide poor context.

For an incident-response system, retrieval relevance is therefore an important part of the architecture.

---

### 3. Historical evidence and AI recommendations should be distinguishable

DejaFix explicitly instructs Gemini not to invent historical incident IDs or runbook identifiers.

This helps separate:

**What happened before**

from:

**What the model recommends now.**

---

### 4. Retention closes the learning loop

Without `retain()`, the system can retrieve existing incidents but cannot naturally add the completed investigation to its future experience.

Recall + Retain creates a continuous memory lifecycle.

---

# 🔮 Future Improvements

Possible future improvements include:

* Structured incident metadata
* Service and dependency relationships
* Severity classification
* Incident timestamps
* Better memory relevance evaluation
* Duplicate-memory detection
* Memory expiration and lifecycle policies
* Post-incident observations
* Larger evaluation datasets
* Automated runbook retrieval
* More sophisticated incident similarity analysis

The current implementation intentionally keeps the memory-summary layer simple and focused on the incident-response use case.

---

# 🌐 Project Links

### 🚀 Live Application

https://deja-fix-whr8.vercel.app/

### 💻 GitHub Repository

https://github.com/MalleshwariTheAnalyst/DejaFix

### 📝 Technical Article

https://medium.com/@kajanamalleshwari/how-i-built-an-incident-agent-with-hindsight-memory-3a5ee2b9895c

### 🧠 Hindsight

https://github.com/vectorize-io/hindsight

### 📚 Hindsight Documentation

https://hindsight.vectorize.io/

### 🤖 Agent Memory Concepts

https://vectorize.io/what-is-agent-memory

---

# 🎥 Demo

The project includes a complete demonstration of:

1. Incident submission
2. Hindsight memory recall
3. AI reasoning
4. Incident recommendations
5. Hindsight retention
6. Continuous learning workflow
7. System architecture

---

# 👩‍💻 Built With

**DejaFix** was built around one practical idea:

> **An incident-response agent should be able to learn from what the team has already experienced.**

The architecture combines:

**Hindsight for memory + Gemini for reasoning + FastAPI for orchestration + React for the incident console.**

---

## ⭐ Core Workflow

```text
┌───────────┐
│  ENCOUNTER│
└─────┬─────┘
      ↓
┌───────────┐
│   RECALL  │ ← Hindsight
└─────┬─────┘
      ↓
┌───────────┐
│   REASON  │ ← Gemini
└─────┬─────┘
      ↓
┌───────────┐
│  RESOLVE  │
└─────┬─────┘
      ↓
┌───────────┐
│   LEARN   │ ← Hindsight Retain
└───────────┘
      │
      └──────────→ Future Incidents
```

**DejaFix turns previous incident experience into context for the next investigation.**
