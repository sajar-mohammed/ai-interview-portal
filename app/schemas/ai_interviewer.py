from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime

# --- Interview (JD) ---
class InterviewBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    jd_text: str
    jd_skills: List[str] = []

class InterviewCreate(BaseModel):
    jd_text: str

class Interview(InterviewBase):
    id: str
    created_at: datetime
    status: str = "active"

# --- Session (Candidate Session) ---
class SessionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    interview_id: str
    candidate_name: str

class SessionCreate(SessionBase):
    pass

class Session(SessionBase):
    id: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    checklist_state: Dict[str, bool] = {} # skill -> covered
    recruiter_id: Optional[str] = None
    candidate_token_used: bool = False

class SessionLinks(BaseModel):
    session_id: str
    candidate_link: str
    observer_link: str


# --- Message (Interview Chat) ---
class MessageCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    session_id: str
    role: str # ai or candidate
    content: str

class Message(MessageCreate):
    id: str

# --- Chat Response ---
class ChatResponse(BaseModel):
    next_question: str
    checklist_state: Dict[str, bool]
    coverage_percentage: int

# --- Evaluation (Final Report) ---
class Evaluation(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    session_id: str
    scores: Dict[str, int] # skill -> score (1-10)
    strengths: List[str]
    weaknesses: List[str]
    overall_recommendation: str # "Hire", "Maybe", "No"
    feedback_text: str
