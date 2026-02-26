from fastapi import FastAPI, UploadFile, File, Form 
from fastapi.middleware.cors import CORSMiddleware

from parser import extract_text_from_pdf
from skill_extractor import extract_skills, filter_skills_by_role
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

@app.post("/upload")
async def upload_resume(
  resume: UploadFile = File(...),
  role: str = Form(...),
  time: int = Form(...)
):
  
  # Extract text
  text = extract_text_from_pdf(resume.file)

  #Extract skills
  skills = extract_skills(text)

  # Filter by role
  filtered_skills = filter_skills_by_role(skills, role)

  #Generate questions
  questions = generate_questions(filtered_skills, role)

  # Time based selection
  final_questions = questions[:questions_by_time(time)]

  return {
    "role": role,
    "skills": filtered_skills,
    "questions": final_questions
  }