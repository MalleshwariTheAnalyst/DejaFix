
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google import genai
from hindsight_client import Hindsight


# ============================================================
# 1. ENVIRONMENT
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# ============================================================
# 2. FASTAPI APP
# ============================================================

app = FastAPI(
    title="DejaFix API",
    description="AI Incident Response Agent powered by Hindsight",
    version="1.0.0",
)


# ============================================================
# 3. CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 4. AI CLIENTS
# ============================================================

hindsight = None
gemini_client = None

BANK_ID = "dejafix"


if HINDSIGHT_API_KEY:
    hindsight = Hindsight(
        base_url="https://api.hindsight.vectorize.io",
        api_key=HINDSIGHT_API_KEY,
    )


if GEMINI_API_KEY:
    gemini_client = genai.Client(
        api_key=GEMINI_API_KEY
    )


# ============================================================
# 5. REQUEST MODEL
# ============================================================

class IncidentRequest(BaseModel):
    incident: str


# ============================================================
# 6. HOME
# ============================================================

@app.get("/")
def home():
    return {
        "status": "online",
        "message": "DejaFix backend is running",
        "hindsight": hindsight is not None,
        "gemini": gemini_client is not None,
    }


# ============================================================
# 7. HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "hindsight_connected": hindsight is not None,
        "gemini_connected": gemini_client is not None,
    }


# ============================================================
# 8. GEMINI
# ============================================================

def generate_with_fallback(prompt: str):

    models = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-2.5-flash",
        "gemini-flash-lite-latest",
    ]

    errors = []

    for model_name in models:

        for attempt in range(2):

            try:
                print(
                    f"Trying Gemini: {model_name} "
                    f"(attempt {attempt + 1})"
                )

                response = gemini_client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )

                if response and response.text:
                    print(
                        f"SUCCESS: Gemini responded using "
                        f"{model_name}"
                    )
                    return response.text, model_name

            except Exception as e:

                error_message = str(e)

                print(
                    f"FAILED: {model_name} "
                    f"(attempt {attempt + 1})"
                )
                print(error_message)

                errors.append(
                    f"{model_name} attempt "
                    f"{attempt + 1}: {error_message}"
                )

                time.sleep(1)

    return None, errors


# ============================================================
# 9. ANALYZE INCIDENT
# ============================================================

@app.post("/analyze")
def analyze_incident(request: IncidentRequest):

    incident = request.incident.strip()

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if not incident:
        return {
            "success": False,
            "error": "Incident description is empty.",
        }

    if hindsight is None:
        return {
            "success": False,
            "stage": "configuration",
            "error": "Hindsight API key is missing.",
        }

    if gemini_client is None:
        return {
            "success": False,
            "stage": "configuration",
            "error": "Gemini API key is missing.",
        }


    # ========================================================
    # HINDSIGHT RECALL
    # ========================================================

    print("\n========================================")
    print("STEP 1: HINDSIGHT RECALL")
    print("========================================")

    try:

        memories = hindsight.recall(
            bank_id=BANK_ID,
            query=incident,
        )

        memory_text = str(memories)

        print("Hindsight recall successful.")

    except Exception as e:

        print("Hindsight recall failed:")
        print(e)

        return {
            "success": False,
            "stage": "hindsight_recall",
            "error": str(e),
        }


    # ========================================================
    # MEMORY SUMMARY
    # ========================================================

    memory_summary = {
        "incident_count": 0,
        "incidents": [],
        "root_causes": [],
        "resolutions": [],
        "runbooks": [],
    }

    memory_results = getattr(
        memories,
        "results",
        []
    )

    for item in memory_results:

        text = getattr(
            item,
            "text",
            ""
        ) or ""

        if not text:
            continue

        # Incident IDs
        for incident_number in range(1, 21):

            incident_id = f"INC-{incident_number:03d}"

            if (
                incident_id in text
                and incident_id
                not in memory_summary["incidents"]
            ):
                memory_summary["incidents"].append(
                    incident_id
                )

        lower_text = text.lower()

        # Root causes
        if (
            "connection pool" in lower_text
            or "pool reached max" in lower_text
        ):

            if (
                "Connection pool exhaustion"
                not in memory_summary["root_causes"]
            ):
                memory_summary["root_causes"].append(
                    "Connection pool exhaustion"
                )

        if "too many connections" in lower_text:

            if (
                "Too many database connections"
                not in memory_summary["root_causes"]
            ):
                memory_summary["root_causes"].append(
                    "Too many database connections"
                )

        # Resolutions
        if (
            "increase" in lower_text
            and "pool" in lower_text
        ):

            resolution = (
                "Increase database connection pool size "
                "and restart service"
            )

            if resolution not in memory_summary["resolutions"]:
                memory_summary["resolutions"].append(
                    resolution
                )

        if (
            "restart" in lower_text
            and "connection" in lower_text
        ):

            resolution = (
                "Restart the affected service after "
                "correcting database connections"
            )

            if resolution not in memory_summary["resolutions"]:
                memory_summary["resolutions"].append(
                    resolution
                )

        # Runbooks
        known_runbooks = [
            "DB-CONNECTION-04",
            "DB-CONNECTION-05",
            "DB-001",
            "API-IDEM-01",
        ]

        for runbook in known_runbooks:

            if (
                runbook in text
                and runbook
                not in memory_summary["runbooks"]
            ):
                memory_summary["runbooks"].append(
                    runbook
                )

    memory_summary["incident_count"] = len(
        memory_summary["incidents"]
    )

    print("\nMemory summary:")
    print(memory_summary)


    # ========================================================
    # GEMINI REASONING
    # ========================================================

    print("\n========================================")
    print("STEP 2: GEMINI REASONING")
    print("========================================")

    prompt = f"""
You are DejaFix, an AI Incident Response Agent
for an engineering and DevOps team.

Analyze the new production incident using
historical experience retrieved from Hindsight.

NEW INCIDENT:

{incident}

HISTORICAL MEMORY:

{memory_text}

IMPORTANT RULES:

1. Use historical memory whenever relevant.
2. Do not invent historical incidents.
3. Do not invent runbook IDs.
4. Clearly distinguish historical information
   from your own recommendation.
5. Give practical engineering actions.
6. Be concise and useful during a production incident.
7. Explain how historical memory helped your reasoning.

Return exactly these sections:

### Likely Root Cause

Explain the most likely cause based on the evidence.

### Relevant Previous Incident

Identify the most relevant historical incident.

### Previous Resolution

Explain how the previous incident was resolved.

### Recommended Action

Give practical steps the engineering team should take now.

### Relevant Runbook

Mention a runbook ID only if it exists in the historical memory.

### Why This Memory Matters

Explain how remembering the previous incident helps DejaFix.
"""

    answer, model_used = generate_with_fallback(prompt)

    if answer is None:

        return {
            "success": False,
            "stage": "gemini_reasoning",
            "error": "Gemini is temporarily unavailable.",
            "details": model_used,
        }


    # ========================================================
    # HINDSIGHT RETAIN
    # ========================================================

    print("\n========================================")
    print("STEP 3: HINDSIGHT RETAIN")
    print("========================================")

    memory_saved = False

    try:

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

        memory_saved = True

        print("New experience successfully saved to Hindsight.")

    except Exception as e:

        print("Hindsight retain failed:")
        print(e)


    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    print("\n========================================")
    print("DEJAFIX ANALYSIS COMPLETE")
    print("========================================")

    return {
        "success": True,
        "incident": incident,
        "historical_memory": memory_text,
        "memory_summary": memory_summary,
        "analysis": answer,
        "memory_saved": memory_saved,
        "model_used": model_used,
    }

