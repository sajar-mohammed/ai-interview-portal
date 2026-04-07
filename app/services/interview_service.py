from app.models.ai_interviewer import MessageCreate, Session
from groq import Groq
import os
import json
from typing import Dict, List

# Groq Client
api_key = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

def generate_next_question(jd_skills: List[str], checklist: Dict[str, bool], history: List[Dict[str, str]]) -> str:
    """
    Looks at the checklist and conversation history to generate the next interview question.
    """
    uncovered_skills = [s for s, covered in checklist.items() if not covered]
    covered_skills = [s for s, covered in checklist.items() if covered]
    
    system_prompt = f"""
    You are a rigorous technical interviewer. 
    Your goal is to evaluate the candidate's proficiency in the following JD skills: {', '.join(jd_skills)}
    
    CRITICAL INSTRUCTIONS:
    1. Do NOT provide answers, explanations, or educational feedback to the candidate.
    2. If the candidate gives a shallow or incorrect answer, do NOT correct them or explain the concept. 
    3. Instead, ask a follow-up question to probe deeper OR move to the next topic if you've seen enough.
    4. Stay in character: you are evaluating their knowledge, not teaching them.
    5. Acknowledge their answer briefly (e.g., "Understood", "I see", "Got it") and move to your next question immediately.
    6. Keep your responses concise and focused only on the next question.
    """
    
    messages = [{"role": "system", "content": system_prompt}] + history
    
    if not client:
        return "System Error: Groq AI not configured."

    completion = client.chat.completions.create(
        messages=messages,
        model="llama-3.3-70b-versatile",
        temperature=0.7,
    )
    
    return completion.choices[0].message.content.strip()

def update_checklist(last_answer: str, checklist: Dict[str, bool]) -> Dict[str, bool]:
    """
    Analyzes the candidate's last answer to see if any checklist items were addressed.
    """
    uncovered_skills = [s for s, covered in checklist.items() if not covered]
    if not uncovered_skills:
        return checklist

    prompt = f"""
    Analyze the following candidate answer and determine which of these skills were sufficiently addressed: {uncovered_skills}
    Return ONLY a JSON object where keys are the skill names and values are booleans (true if covered, false otherwise).
    
    Candidate Answer: "{last_answer}"
    """
    
    if not client:
        return checklist

    completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        temperature=0.1,
    )
    
    try:
        response_text = completion.choices[0].message.content.strip()
        if "```" in response_text:
            response_text = response_text.split("```")[1].replace("json", "").strip()
        
        updates = json.loads(response_text)
        if not isinstance(updates, dict):
            return checklist
            
        new_checklist = checklist.copy()
        for skill, covered in updates.items():
            if isinstance(skill, str) and skill in new_checklist and isinstance(covered, bool):
                if covered:
                    new_checklist[skill] = True
        return new_checklist
    except Exception:
        return checklist
