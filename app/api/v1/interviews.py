from fastapi import APIRouter, HTTPException
from app.schemas.ai_interviewer import Interview, InterviewCreate
from app.services import ai_service, db_service
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=Interview)
async def create_interview(interview_in: InterviewCreate):
    # 1. Extract skills using AI
    skills = ai_service.extract_skills_from_jd(interview_in.jd_text)
    
    if not skills:
        raise HTTPException(status_code=400, detail="Could not extract skills from the provided JD.")
    
    # 2. Prepare interview object
    interview_id = str(uuid.uuid4())
    interview_data = {
        "id": interview_id,
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

@router.get("/{interview_id}", response_model=Interview)
async def get_interview(interview_id: str):
    try:
        response = db_service.get_interview(interview_id)
        return response.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Interview not found")
