def generate_questions(skills, role):
  questions = []
  for skill in skills:
    questions.append(f"What is {skill}?")
    questions.append(f"Explain a project where you need {skill} for a {role} role.")
  
  if not questions:
    questions.append("Tell me about yourself.")
  
  return questions


def questions_by_time(minutes):
  mapping = {
    5: 3,
    10:5,
    15:8
  }

  return mapping.get(minutes, 5)