from google import genai
import os
import random
import re
import time
from dotenv import load_dotenv
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

import time

# Track daily usage
_daily_request_count = 0
_MAX_DAILY_REQUESTS = 1400  # Stay under the free tier limit

def call_gemini_with_retry(prompt, retries=3):
    global _daily_request_count
    
    if _daily_request_count >= _MAX_DAILY_REQUESTS:
        raise Exception("Daily quota limit reached. Try again tomorrow.")
    
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt
            )
            _daily_request_count += 1
            return response
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                if "per_day" in str(e).lower() or "GenerateRequestsPerDay" in str(e):
                    raise Exception("Daily quota exhausted. Wait 24hrs or upgrade plan.")
                sleep_time = 30 * (attempt + 1)
                print(f"Rate limit hit. Waiting {sleep_time}s...")
                time.sleep(sleep_time)
            else:
                raise e
    raise Exception("Retries exhausted.")

def question_count(time_minutes):
    if time_minutes <= 10: return 3
    if time_minutes <= 20: return 5
    if time_minutes <= 30: return 7
    return 10

def evaluate_answer(question, answer):
    """Evaluates the answer and returns a numeric score."""
    prompt = f"""
    Evaluate the following technical interview answer.
    Question: {question}
    Answer: {answer}
    
    Provide a score between 0 and 100 based on accuracy and depth.
    Return ONLY the number. No explanation.
    """
    response = call_gemini_with_retry(prompt)
    if not response: return 50

    # Extract digits specifically to avoid issues with extra text
    numbers = re.findall(r"\d+", response.text.strip())
    return int(numbers[0]) if numbers else 50

def next_difficulty(score):
    if score >= 75: return "hard"
    if score >= 50: return "medium"
    return "easy"

class InterviewSession:
    def __init__(self, question_bank, time_minutes):
        self.question_bank = question_bank
        self.total_questions = question_count(time_minutes)
        self.current_difficulty = "medium"
        self.asked_questions = []
        self.scores = []

    def next_question(self):
        if len(self.asked_questions) >= self.total_questions:
            return None

        questions = self.question_bank.get(self.current_difficulty, [])
        available = [q for q in questions if q not in self.asked_questions]

        # Fallback to any difficulty if current one is exhausted
        if not available:
            for level in ["easy", "medium", "hard"]:
                available += [q for q in self.question_bank.get(level, []) if q not in self.asked_questions]

        if not available: return None

        question = random.choice(available)
        self.asked_questions.append(question)
        return question

    def submit_answer(self, question, answer):
        score = evaluate_answer(question, answer)
        self.scores.append(score)
        self.current_difficulty = next_difficulty(score)
        return score

    def interview_summary(self):
        if not self.scores: return {}
        return {
            "questions_answered": len(self.scores),
            "average_score": round(sum(self.scores) / len(self.scores), 2),
            "scores": self.scores
        }