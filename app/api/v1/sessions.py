from fastapi import APIRouter, HTTPException
from app.models.ai_interviewer import Session, SessionCreate, Message, MessageCreate, Evaluation, SessionLinks
from app.services import interview_service, ai_service, auth_service
from app.db import repository as db_service
import uuid
import os
from datetime import datetime, timedelta
from typing import List

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

@router.post("/", response_model=SessionLinks)
async def start_session(session_in: SessionCreate):

    # 1. Fetch interview from Supabase
    try:
        interview_res = db_service.get_interview(session_in.interview_id)
        interview = interview_res.data
        jd_skills = interview["jd_skills"]
    except Exception:
        raise HTTPException(status_code=404, detail="Interview template not found")
    
    # 2. Initialize session
    session_id = str(uuid.uuid4())
    checklist = {skill: False for skill in jd_skills}
    
    new_session = {
        "id": session_id,
        "interview_id": session_in.interview_id,
        "candidate_name": session_in.candidate_name,
        "started_at": datetime.utcnow().isoformat(),
        "checklist_state": checklist
    }
    
    db_service.create_session(new_session)
    
    # 3. Generate tokens
    candidate_token = auth_service.generate_interview_token(session_id, role="candidate")
    observer_token = auth_service.generate_interview_token(session_id, role="observer")
    
    return SessionLinks(
        session_id=session_id,
        candidate_link=f"{FRONTEND_URL}/interview/{session_id}?token={candidate_token}",
        observer_link=f"{FRONTEND_URL}/interview/{session_id}?token={observer_token}"
    )

@router.get("/validate-token")
async def validate_token(token: str):
    payload = auth_service.verify_interview_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    session_id = payload.get("sub")
    role = payload.get("role")
    
    session_res = db_service.get_session(session_id)
    session = session_res.data
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # If candidate, check if token was already used (optional strictness)
    # For now, we'll allow re-entry if the session is still active
    
    return {
        "session_id": session_id,
        "role": role,
        "candidate_name": session["candidate_name"]
    }


from app.models.ai_interviewer import ChatResponse 

@router.post("/chat", response_model=ChatResponse)
async def handle_chat(message_in: MessageCreate):
    # 1. Fetch current session matching
    try:
        session_res = db_service.get_session(message_in.session_id)
        session = session_res.data
    except Exception as e:
        print(f"❌ SESSION NOT FOUND in handle_chat: {message_in.session_id} - Error: {e}")
        raise HTTPException(status_code=404, detail=f"Session '{message_in.session_id}' not found in database.")
    
    # 2. Store candidate message
    candidate_msg = {
        "session_id": message_in.session_id,
        "role": "user",
        "content": message_in.content
    }
    db_service.create_message(candidate_msg)
    
    # 3. Update checklist based on answer
    updated_checklist = interview_service.update_checklist(
        message_in.content, 
        session["checklist_state"]
    )
    db_service.update_session_checklist(message_in.session_id, updated_checklist)
    
    # 4. Generate next question using history
    history_res = db_service.get_session_messages(message_in.session_id)
    history = [{"role": m["role"], "content": m["content"]} for m in history_res.data]
    
    next_question = interview_service.generate_next_question(
        list(updated_checklist.keys()),
        updated_checklist,
        history
    )
    
    # 5. Store AI message
    ai_msg = {
        "session_id": message_in.session_id,
        "role": "assistant",
        "content": next_question
    }
    db_service.create_message(ai_msg)
    
    # 6. Calculate coverage for the progress bar
    total_skills = len(updated_checklist)
    covered_skills = sum(1 for covered in updated_checklist.values() if covered)
    coverage = int((covered_skills / total_skills) * 100) if total_skills > 0 else 0
    
    return ChatResponse(
        next_question=next_question,
        checklist_state=updated_checklist,
        coverage_percentage=coverage
    )

@router.post("/{session_id}/evaluate", response_model=Evaluation)
async def trigger_evaluation(session_id: str):
    # 1. Check if evaluation already exists
    try:
        existing_eval = db_service.get_session_results(session_id)
        if existing_eval.data:
            return existing_eval.data
    except Exception:
        pass # Proceed to generate if retrieval fails or doesn't exist
        
    # 2. Fetch session and interview
    try:
        session_res = db_service.get_session(session_id)
        session = session_res.data
        interview_res = db_service.get_interview(session["interview_id"])
        interview = interview_res.data
    except Exception:
        raise HTTPException(status_code=404, detail="Session or Interview not found")
    
    # 3. Fetch History
    history_res = db_service.get_session_messages(session_id)
    history = [{"role": m["role"], "content": m["content"]} for m in history_res.data]
    
    # 4. Call Gemini Evaluation
    evaluation_data = ai_service.evaluate_interview(interview["jd_text"], history, skills=interview.get("jd_skills", []))
    
    if not evaluation_data:
        raise HTTPException(status_code=500, detail="Failed to generate evaluation")
    
    evaluation_data["session_id"] = session_id
    
    # 5. Store in Supabase
    db_service.create_evaluation(evaluation_data)
    
    return evaluation_data

from app.core.security import get_current_user
from fastapi import Depends

@router.get("/interview/{interview_id}")
async def list_sessions_by_interview(
    interview_id: str,
    current_user: dict = Depends(get_current_user)
):
    # 1. Verify interview belongs to recruiter
    interview_res = db_service.get_interview(interview_id)
    interview = interview_res.data
    if not interview or interview["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this interview's sessions")
    
    # 2. Fetch sessions
    sessions_res = db_service.get_sessions_by_interview(interview_id)
    sessions = sessions_res.data
    
    # 3. Enrich with evaluation results if available
    enriched_sessions = []
    for s in sessions:
        eval_res = db_service.get_session_results(s["id"])
        s["evaluation"] = eval_res.data if eval_res.data else None
        enriched_sessions.append(s)
        
    return enriched_sessions

@router.get("/{session_id}")
async def get_session_details(session_id: str):
    res = db_service.get_session(session_id)
    if not res.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return res.data

@router.get("/{session_id}/messages")
async def get_session_messages(session_id: str):
    res = db_service.get_session_messages(session_id)
    return res.data
