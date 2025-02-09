"""
models/choice_request.py

Purpose:
    Defines the ChoiceRequest data model for validating incoming POST requests to /api/choose.

Inputs:
    JSON payload with:
        - choice_type (str): Expected to be either "positive" or "negative".

Outputs:
    An instance of ChoiceRequest with a validated choice_type attribute.

Guardrails:
    - Pydantic ensures that the input payload matches the required format.
"""

from pydantic import BaseModel


class ChoiceRequest(BaseModel):
    choice_type: str  # Expected values: "positive" or "negative"