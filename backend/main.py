from fastapi import FastAPI, UploadFile, File, Form 
from fastapi.middleware.cors import CORSMiddleware

from parser import extract_text_from_pdf
from resume_extractor import (extract_skills, extract_experience, extract_projects,extract_achievements, refine_skills)
from question_engine import generate_questions, questions_by_time

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials= True,
  allow_methods=["*"],
  allow_headers=["*"],
)

@app.get("/")
def home():
  return {"message": "Resume Analyzer Backend Running"}

@app.post("/debug")
async def debug_resume(resume: UploadFile = File(...)):
    await resume.seek(0)
    text = extract_text_from_pdf(resume.file)
    return {"raw_text": text}
@app.post("/upload")
async def upload_resume(resume: UploadFile = File(...)):
    await resume.seek(0)
    text = extract_text_from_pdf(resume.file)
    raw_skills = extract_skills(text)
    cleaned_skills = refine_skills(raw_skills)
    return {
        "skills": cleaned_skills,
        "experience": extract_experience(text),
        "projects": extract_projects(text),
        "achievements": extract_achievements(text),
    }