SKILL_DB = [
  "python", "java", "react", "node", "machine learning", "sql", "html", "css", "javascript"
]

def extract_skills(text):
  text_lower = text.lower()
  found = []

  for skill in SKILL_DB:
    if skill in text_lower:
      found.append(skill.capitalize())
  return list(set(found))

def filter_skills_by_role(skills, role):
  role_map = {
    "data scientist": ["Python", "Machine learning", "SQL"],
        "frontend developer": ["React", "Javascript", "HTML", "CSS"],
        "backend developer": ["Node", "Java", "SQL", "Python"],
  }

  role = role.lower()
  priority = role_map.get(role, [])
  filtered = [s for s in skills if s in priority]
  return filtered if filtered else skills