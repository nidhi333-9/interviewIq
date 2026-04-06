from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.parser import extract_text_from_pdf
from services.rag_context import build_resume_context
from services.rag_question_generator import generate_rag_questions
from services.question_engine import InterviewSession, call_gemini_with_retry

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global session (Note: In a real app, use a dict or database to handle multiple users)
session = None

# --- Helper Function to Clean and Parse AI JSON ---
def parse_ai_json(text):
    try:
        # Remove markdown code blocks if present
        clean_text = re.sub(r"```json|```", "", text).strip()
        return json.loads(clean_text)
    except Exception as e:
        print(f"JSON Parsing Error: {e}")
        return {"skills": [], "projects": [], "experience": "Not found"}

# --- New Optimized Single Extraction Call ---
def extract_resume_data(text):
    prompt = f"""
    Analyze this resume text carefully. 
    Extract:
    1. Skills (A list of technical skills)
    2. Significant Projects (A list of project titles/descriptions)
    3. Work Experience (A concise summary of roles)
    4. Achievements (A list of key highlights)

    Return ONLY a valid JSON object with these keys: 
    "skills", "projects", "experience", "achievements".
    
    Resume Text:
    {text}
    """
    response = call_gemini_with_retry(prompt)
    return parse_ai_json(response.text)

# --- Endpoints ---

@app.get("/")
def home():
    return {"message": "InterviewIQ Backend Running"}

@app.post("/upload")
async def upload_resume(resume: UploadFile = File(...)):
    await resume.seek(0)
    text = extract_text_from_pdf(resume.file)
    
    # ONE API call instead of four!
    data = extract_resume_data(text)
    return data

@app.post("/start_interview")
async def start_interview(
    file: UploadFile = File(...),
    role: str = Form(...),
    time: int = Form(...)
):
    global session

    await file.seek(0)
    text = extract_text_from_pdf(file.file)

    # 1. Extract data (1 API Call)
    data = extract_resume_data(text)
    
    # 2. Build context for RAG
    context = build_resume_context(data['skills'], data['projects'], data['experience'])

    # 3. Generate questions (1 API Call)
    question_bank = generate_rag_questions(context, role)

    # 4. Initialize Session
    session = InterviewSession(question_bank, time)
    first_question = session.next_question()

    return {
        "skills": data['skills'],
        "projects": data['projects'],
        "first_question": first_question
    }

@app.post("/submit_answer")
async def submit_answer(data: dict):
    if session is None:
        raise HTTPException(status_code=400, detail="Interview not started")

    # 1 API Call (Evaluation)
    score = session.submit_answer(
        data["question"],
        data["answer"]
    )

    next_q = session.next_question()

    if next_q is None:
        return {
            "score": score,
            "message": "Interview finished",
            "summary": session.interview_summary()
        }

    return {
        "score": score,
        "next_question": next_q
    }