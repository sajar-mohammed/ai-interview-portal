from fastapi import APIRouter, HTTPException, Depends
from app.models.ai_interviewer import Interview, InterviewCreate, SkillExtractionRequest, SkillExtractionResponse
from app.services import ai_service
from app.db import repository as db_service
from app.core.security import get_current_user
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/extract-skills", response_model=SkillExtractionResponse)
async def extract_skills(
    request: SkillExtractionRequest,
    current_user: dict = Depends(get_current_user)
):
    skills = ai_service.extract_skills_from_jd(request.jd_text)
    if not skills:
        raise HTTPException(status_code=400, detail="Could not extract skills from JD")
    return SkillExtractionResponse(skills=skills)

@router.post("/", response_model=Interview)
async def create_interview(
    interview_in: InterviewCreate,
    current_user: dict = Depends(get_current_user)
):
    # 1. Use provided skills or extract them
    skills = interview_in.jd_skills
    if not skills:
        skills = ai_service.extract_skills_from_jd(interview_in.jd_text)
    
    if not skills:
        raise HTTPException(status_code=400, detail="Could not extract skills from the provided JD.")
    
    # 2. Prepare interview object
    interview_id = str(uuid.uuid4())
    interview_data = {
        "id": interview_id,
        "role_title": interview_in.role_title,
        "user_id": current_user["user_id"],
        "jd_text": interview_in.jd_text,
        "jd_skills": skills,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    }
    
    # 3. Save to Supabase
    try:
        response = db_service.create_interview(interview_data)
        if not response.data:
            raise HTTPException(status_code=500, detail="Database error: No data returned from Supabase.")
        return response.data[0]
    except Exception as e:
        print(f"❌ DATABASE ERROR in create_interview: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/", response_model=list[Interview])
async def list_interviews(current_user: dict = Depends(get_current_user)):
    try:
        response = db_service.get_interviews_by_user(current_user["user_id"])
        return response.data
    except Exception as e:
        print(f"❌ DATABASE ERROR in list_interviews: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{interview_id}", response_model=Interview)
async def get_interview(interview_id: str, current_user: dict = Depends(get_current_user)):
    try:
        response = db_service.get_interview(interview_id)
        interview = response.data
        if interview["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Not authorized to view this interview")
        return interview
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=404, detail="Interview not found")
