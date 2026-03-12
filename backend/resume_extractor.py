import spacy

# Load the NLP model once
nlp = spacy.load("en_core_web_sm")

# Universal list of headers to detect section boundaries
ALL_HEADINGS = [
    "experience", "work experience", "internship", "employment",
    "education", "academic background", "qualification",
    "skills", "technical skills", "technologies", "tools",
    "projects", "personal projects", "academic projects",
    "achievements", "awards", "honors", "certifications", 
    "summary", "objective", "languages", "publications"
]

def extract_section(text, section_keywords):
    lines = text.split("\n")
    capturing = False
    section_lines = []

   
    all_headers = [
        "education", "technical skills", "skills", "projects", 
        "experience", "work experience", "achievements", 
        "extracurricular", "summary", "objective"
    ]

    for line in lines:
        clean_line = line.strip().lower()
        if not clean_line:
            continue

        
        if any(kw in clean_line for kw in section_keywords):
            capturing = True
            continue

       
        if capturing:
            
            if any(h == clean_line for h in all_headers):
               
                if not any(kw in clean_line for kw in section_keywords):
                    break
            
            section_lines.append(line.strip())

    return section_lines
# --- Wrapper Functions for your FastAPI routes ---

def extract_skills(text):
    return extract_section(text, ["skills", "technical skills", "technologies"])

def extract_experience(text):
    return extract_section(text, ["experience", "work experience", "internship"])

def extract_projects(text):
    return extract_section(text, ["projects", "personal projects", "academic projects"])

def extract_achievements(text):
    
    return extract_section(text, ["achievements", "awards", "honors"])

def refine_skills(skills_list):
    """Filters the extracted skills text to pull out only relevant keywords."""
    text = " ".join(skills_list)
    doc = nlp(text)
    # Pull out Nouns and Proper Nouns (standard for tech stack names)
    keywords = [token.text for token in doc if token.pos_ in ["NOUN", "PROPN"]]
    return sorted(list(set(keywords)))