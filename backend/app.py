from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Union, Literal, Optional, List
from services.narrative_service import generate_narrative

app = FastAPI(title="Unified Narrative API", version="1.0")

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend's origin as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# REQUEST MODELS
# ============================

class BaseNarrativeRequest(BaseModel):
    stage: str
    language: str  # Now required

class InitialNarrativeRequest(BaseNarrativeRequest):
    stage: Literal['initial'] = 'initial'
    # No additional parameters required for the initial stage.

class RoundNarrativeRequest(BaseNarrativeRequest):
    stage: Literal['round'] = 'round'
    narrative_context: Optional[str] = ""
    action: Optional[str] = ""
    outcome_value: int = 0
    action_confirming_sentence: Optional[str] = ""

class FinalNarrativeRequest(BaseNarrativeRequest):
    stage: Literal['final'] = 'final'
    narrative_context: str
    win_or_loss: str = Field(..., pattern="^(?i)(win|loss)$")  # Accepts "win" or "loss"

# Unified request model as a discriminated union:
NarrativeRequest = Union[InitialNarrativeRequest, RoundNarrativeRequest, FinalNarrativeRequest]

# ============================
# RESPONSE MODELS
# ============================

class Choice(BaseModel):
    id: int
    choice_description: str
    confirming_sentence: str
    outcome: str

class InitialNarrativeResponse(BaseModel):
    stage: Literal['initial'] = 'initial'
    situation: str
    choices: List[Choice]

class RoundNarrativeResponse(BaseModel):
    stage: Literal['round'] = 'round'
    confirming_sentence: str
    situation: str
    choices: List[Choice]

class FinalNarrativeResponse(BaseModel):
    stage: Literal['final'] = 'final'
    confirming_sentence: str
    situation: str

# Unified response type:
NarrativeResponse = Union[InitialNarrativeResponse, RoundNarrativeResponse, FinalNarrativeResponse]

# ============================
# UNIFIED ENDPOINT
# ============================

@app.post("/api/narrative", response_model=NarrativeResponse)
def unified_narrative_endpoint(request: NarrativeRequest):
    """
    Unified Narrative Endpoint

    This endpoint generates narrative content for three stages:
      - "initial": No additional parameters besides language.
      - "round": Requires narrative_context, action, outcome_value, and action_confirming_sentence.
      - "final": Requires narrative_context and win_or_loss.

    **Every** request must include the "language" parameter.
    """
    try:
        if request.stage == "initial":
            req: InitialNarrativeRequest = request
            print(req)
            result = generate_narrative(
                stage="initial",
                language=req.language
            )
            result["stage"] = "initial"
            return result

        elif request.stage == "round":
            req: RoundNarrativeRequest = request
            print(req)
            result = generate_narrative(
                stage="round",
                narrative_context=req.narrative_context,
                action=req.action,
                outcome_value=req.outcome_value,
                action_confirming_sentence=req.action_confirming_sentence,
                language=req.language
            )
            result["stage"] = "round"
            return result

        elif request.stage == "final":
            req: FinalNarrativeRequest = request
            print(req)
            result = generate_narrative(
                stage="final",
                narrative_context=req.narrative_context,
                win_or_loss=req.win_or_loss,
                language=req.language
            )
            result["stage"] = "final"
            return result

        else:
            raise HTTPException(status_code=400, detail="Invalid stage provided.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))