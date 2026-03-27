import os
import json
from groq import Groq
import google.generativeai as genai
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

# Groq Client
# Groq Client (using env with fallback to avoid crash during import)
api_key = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=api_key) if api_key else None

# Gemini Client
google_key = os.environ.get("GOOGLE_API_KEY")
gemini_model = None
if google_key:
    genai.configure(api_key=google_key)
    # Try multiple common model IDs in case one is not available
    for model_name in ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.0-pro']:
        try:
            gemini_model = genai.GenerativeModel(model_name)
            # Basic check to see if model exists (optional, but we'll try to use it in evaluate_interview)
            break
        except Exception:
            continue

def extract_skills_from_jd(jd_text: str) -> List[str]:
    """
    Uses Groq (Llama 3) to extract a structured list of technical and soft skills from a JD.
    """
    prompt = f"""
    You are an expert HR assistant. Extract a flat list of key required skills, technologies, and competencies from the following Job Description (JD).
    Return ONLY a JSON array of strings. No extra text, no markdown block.
    
    JD Example Input: "Looking for a React developer with 3 years of experience in Node.js and REST APIs. Experience with team collaboration is a plus."
    Expected Output: ["React", "Node.js", "REST APIs", "Team collaboration"]

    JD to process:
    {jd_text}
    """
    
    if not groq_client:
        print("❌ Groq client not initialized. Check GROQ_API_KEY.")
        return []

    chat_completion = groq_client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        stream=False,
    )
    
    response_text = chat_completion.choices[0].message.content.strip()
    
    # Try to parse JSON array
    try:
        # Sometimes models wrap in ```json ... ```
        if "```" in response_text:
            response_text = response_text.split("```")[1].replace("json", "").strip()
        
        skills = json.loads(response_text)
        if isinstance(skills, list):
            return skills
    except Exception as e:
        print(f"Error parsing skills: {e}")
        # Fallback: very basic regex or split if needed, but JSON should work with Llama 3
        return []

    return []

def evaluate_interview(jd_text: str, history: List[Dict[str, str]]) -> Dict:
    """
    Uses Gemini 1.5 Flash (or fallback) to evaluate the whole interview and return a structured JSON report.
    """
    history_text = "\n".join([f"{m['role']}: {m['content']}" for m in history])
    
    prompt = f"""
    You are an expert technical recruiter. Evaluate the following interview based on the Job Description (JD).
    JD: {jd_text}
    
    Interview History:
    {history_text}
    
    RETURN ONLY A JSON OBJECT with this structure:
    {{
        "scores": {{"SkillName": 8, "AnotherSkill": 5}},
        "strengths": ["list of strengths"],
        "weaknesses": ["list of weaknesses"],
        "overall_recommendation": "Hire" | "Maybe" | "No",
        "feedback_text": "Detailed summary of candidate performance."
    }}
    Do not include markdown or extra text.
    """
    
    # Try multiple models directly in the call
    response_text = None
    for model_name in ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-001', 'gemini-pro']:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            if response_text:
                break
        except Exception as e:
            print(f"Skipping model {model_name} due to: {e}")
            continue

    if not response_text:
        return {
            "scores": {},
            "strengths": ["Evaluation failed (AI unavailable)"],
            "weaknesses": [],
            "overall_recommendation": "Maybe",
            "feedback_text": "We encountered an issue connecting to the evaluation engine."
        }
    
    try:
        # Find the first { and last } to extract JSON if Gemini adds conversational filler
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            response_text = response_text[start_idx:end_idx+1]
        
        return json.loads(response_text)
    except Exception as e:
        print(f"Error parsing evaluation: {e}")
        return {
            "scores": {},
            "strengths": ["Evaluation failed to parse"],
            "weaknesses": [],
            "overall_recommendation": "Maybe",
            "feedback_text": f"Technical error during evaluation generation: {e}"
        }
