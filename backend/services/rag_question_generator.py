from google import genai
import os
import json
import time
from dotenv import load_dotenv
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
print(client)
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

def generate_rag_questions(context, role):
    prompt = f"""
You are an expert technical interviewer.

Candidate Resume:
{context}

Target Role:
{role}

Generate interview questions.

Return STRICT JSON:

{{
 "easy": [],
 "medium": [],
 "hard": []
}}
"""
    response = call_gemini_with_retry(prompt)
    text = response.text.strip()
    text = text.replace("```json", "").replace("```", "")
    start = text.find("{")
    end = text.rfind("}") + 1
    text = text[start:end]

    try:
        return json.loads(text)
    except:
        print("JSON error:", text)
        return {"easy": [], "medium": [], "hard": []}
    


if __name__ == "__main__":
    test_context = "Experience in Python and SQL"
    test_role = "Data Engineer"
    print("Running test generation...")
    print(generate_rag_questions(test_context, test_role))