from app.services import db_service
import uuid

def seed():
    from app.core.supabase import SUPABASE_URL
    print(f"🌱 Seeding test data to: {SUPABASE_URL}")
    
    # 1. Create a mock interview template
    interview_id = str(uuid.uuid4())
    jd_skills = ["React", "FastAPI", "Python", "Problem Solving"]
    
    mock_interview = {
        "id": interview_id,
        "role_title": "Full Stack Developer",
        "jd_text": "Looking for a React and FastAPI expert.",
        "jd_skills": jd_skills
    }
    
    try:
        db_service.create_interview(mock_interview)
        print(f"✅ Created Interview Template: {interview_id}")
    except Exception as e:
        print(f"❌ Failed to create interview: {e}")
        return

    # 2. Create the 'sample-session' mapping
    mock_session = {
        "id": "sample-session",
        "interview_id": interview_id,
        "candidate_name": "Test Candidate",
        "checklist_state": {skill: False for skill in jd_skills}
    }
    
    try:
        db_service.create_session(mock_session)
        print("✅ Created Session: sample-session")
        print("\n🚀 You can now test the interview page at http://localhost:3000/interview/sample-session")
    except Exception as e:
        print(f"❌ Failed to create session: {e}")

if __name__ == "__main__":
    seed()
