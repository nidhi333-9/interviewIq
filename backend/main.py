from dotenv import load_dotenv
import os
import json
import re
import base64
import numpy as np
import cv2
import mediapipe as mp

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.parser import extract_text_from_pdf
from services.resume_extractor import extract_skills, extract_experience, extract_projects, extract_achievements
from services.question_engine import generate_questions, InterviewSession
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh()
blink_count = 0
prev_blink = False

# Global session (for single user / college demo)
session = None

# --- Endpoints ---

@app.get("/")
def home():
    return {"message": "InterviewIQ Backend Running"}


@app.post("/upload")
async def upload_resume(resume: UploadFile = File(...)):
    await resume.seek(0)
    text = extract_text_from_pdf(resume.file)

    skills       = extract_skills(text)
    experience   = extract_experience(text)
    projects     = extract_projects(text)
    achievements = extract_achievements(text)

    return {
        "skills": skills,
        "experience": experience,
        "projects": projects,
        "achievements": achievements
    }

def decode_image(base64_str):
    encoded = base64_str.split(",")[1]
    nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
@app.post("/analyze")
async def analyze(data: dict):
    try:
        image = decode_image(data["image"])

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)

        if not results.multi_face_landmarks:
            print("No face ❌")
            return {"face": False}

        landmarks = results.multi_face_landmarks[0]

        # 👁️ Eye landmark positions
        nose_x = landmarks.landmark[1].x  
        left_eye_x = landmarks.landmark[33].x
        right_eye_x = landmarks.landmark[263].x
        eye_center = (left_eye_x + right_eye_x) / 2
        diff = abs(eye_center - nose_x)
        # 🎯 Eye contact logic
        if diff < 0.08:  # Threshold for looking forward
            eye_contact = "Good"
        elif diff < 0.15:  # Threshold for slight deviation
            eye_contact = "Slightly Away"    
        else:
            eye_contact = "Looking Away"

        print("Eye Contact:", eye_contact, "| Diff:", diff)
        top = landmarks.landmark[159].y
        bottom = landmarks.landmark[145].y

        eye_opening = abs(top - bottom)

# 🎯 Blink detection
        global blink_count, prev_blink

        if eye_opening < 0.015:
            blink = True
        else:
            blink = False

# Count only when blink starts
        if blink and not prev_blink:
             blink_count += 1

        prev_blink = blink

        print("Blink:", blink, "| Total Blinks:", blink_count)
        return {
            "face": True,
            "eye_contact": eye_contact,
            "blink": blink,
            "blink_count": blink_count
        }

    except Exception as e:
        print("Error:", e)
        return {"error": "failed"}

@app.post("/start_interview")
async def start_interview(
    file: UploadFile = File(...),
    role: str = Form(...),
    time: int = Form(...)
):
    global session,blink_count, prev_blink
    blink_count = 0
    prev_blink = False


    await file.seek(0)

    # generate_questions handles extraction + question gen internally
    result = generate_questions(
        pdf_file=file.file,
        job_role=role,
        interview_duration_minutes=time
    )

    question_bank   = result["questions"]
    resume_context  = result["resume_context"]

    # Initialize session
    session = InterviewSession(question_bank, time, resume_context)
    first_question = session.next_question()

    return {
        "first_question": first_question,
        "total_questions": result["total"],
        "resume_context": resume_context
    }


@app.post("/submit_answer")
async def submit_answer(data: dict):
    if session is None:
        raise HTTPException(status_code=400, detail="Interview not started")

    score  = session.submit_answer(data["question"], data["answer"])
    next_q = session.next_question()

    if next_q is None:
        return {
            "score": score,
            "message": "Interview finished",
            "summary": session.interview_summary()
        }

    return {
        "next_question": next_q,
        "score": score
    }