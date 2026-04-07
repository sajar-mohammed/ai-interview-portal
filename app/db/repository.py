from app.db.session import get_supabase
from typing import List, Dict, Any

supabase = get_supabase()

# --- Interview Methods ---
def create_interview(data: Dict[str, Any]):
    return supabase.table("interviews").insert(data).execute()

def get_interview(interview_id: str):
    return supabase.table("interviews").select("*").eq("id", interview_id).single().execute()

def get_interviews_by_user(user_id: str):
    return supabase.table("interviews").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()

# --- Session Methods ---
def create_session(data: Dict[str, Any]):
    return supabase.table("sessions").insert(data).execute()

def get_session(session_id: str):
    return supabase.table("sessions").select("*").eq("id", session_id).single().execute()

def get_sessions_by_interview(interview_id: str):
    return supabase.table("sessions").select("*").eq("interview_id", interview_id).order("started_at", desc=True).execute()

def get_session_results(session_id: str):
    return supabase.table("evaluations").select("*").eq("session_id", session_id).single().execute()

def update_session_checklist(session_id: str, checklist_state: Dict[str, bool]):
    return supabase.table("sessions").update({"checklist_state": checklist_state}).eq("id", session_id).execute()

def mark_session_started(session_id: str):
    return supabase.table("sessions").update({"candidate_token_used": True}).eq("id", session_id).execute()


# --- Message Methods ---
def create_message(data: Dict[str, Any]):
    return supabase.table("messages").insert(data).execute()

def get_session_messages(session_id: str):
    return supabase.table("messages").select("*").eq("session_id", session_id).order("timestamp").execute()

# --- Evaluation Methods ---
def create_evaluation(data: Dict[str, Any]):
    return supabase.table("evaluations").insert(data).execute()

def existing_user(email: str):
    return supabase.table("users").select("id").eq("email", email).execute()

def create_user(email: str, hashed_password: str):
    return supabase.table("users").insert({"email": email, "hashed_password": hashed_password}).execute()