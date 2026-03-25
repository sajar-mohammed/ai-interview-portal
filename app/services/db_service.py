from app.core.supabase import get_supabase
from typing import List, Dict, Any

supabase = get_supabase()

# --- Interview Methods ---
def create_interview(data: Dict[str, Any]):
    return supabase.table("interviews").insert(data).execute()

def get_interview(interview_id: str):
    return supabase.table("interviews").select("*").eq("id", interview_id).single().execute()

# --- Session Methods ---
def create_session(data: Dict[str, Any]):
    return supabase.table("sessions").insert(data).execute()

def get_session(session_id: str):
    return supabase.table("sessions").select("*").eq("id", session_id).single().execute()

def update_session_checklist(session_id: str, checklist_state: Dict[str, bool]):
    return supabase.table("sessions").update({"checklist_state": checklist_state}).eq("id", session_id).execute()

# --- Message Methods ---
def create_message(data: Dict[str, Any]):
    return supabase.table("messages").insert(data).execute()

def get_session_messages(session_id: str):
    return supabase.table("messages").select("*").eq("session_id", session_id).order("timestamp").execute()

# --- Evaluation Methods ---
def create_evaluation(data: Dict[str, Any]):
    return supabase.table("evaluations").insert(data).execute()
