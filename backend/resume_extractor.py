def extract_section(text, section_keywords):
    lines = text.split("\n")
    capturing = False
    section_lines = []

    all_headings = [
        "experience", "education", "skills", "projects",
        "achievements", "certifications", "summary", "objective",
        "awards", "publications", "languages"
    ]

    for line in lines:
        line_lower = line.strip().lower()

        if any(kw in line_lower for kw in section_keywords):
            capturing = True
            continue

        if capturing and any(h in line_lower for h in all_headings):
            if not any(kw in line_lower for kw in section_keywords):
                break

        if capturing and line.strip():
            section_lines.append(line.strip())

    return section_lines

def extract_section(text, section_keywords, stop_keywords):
    lines = text.split("\n")
    capturing = False
    section_lines = []

    for line in lines:
        line_stripped = line.strip()
        line_lower = line_stripped.lower()

        # Start capturing
        if any(kw == line_lower for kw in section_keywords):
            capturing = True
            continue

        # Stop at next section
        if capturing and any(kw == line_lower for kw in stop_keywords):
            break

        if capturing and line_stripped:
            section_lines.append(line_stripped)

    return section_lines


def extract_skills(text):
    return extract_section(
        text,
        section_keywords=["skills"],
        stop_keywords=["projects", "experience", "education", "achievements", "languages", "objective"]
    )

def extract_experience(text):
    return extract_section(
        text,
        section_keywords=["experience", "work experience", "internship"],
        stop_keywords=["skills", "projects", "education", "achievements", "languages", "objective"]
    )

def extract_projects(text):
    return extract_section(
        text,
        section_keywords=["projects"],
        stop_keywords=["skills", "experience", "education", "achievements", "languages", "objective"]
    )

def extract_achievements(text):
    return extract_section(
        text,
        section_keywords=["achievements"],
        stop_keywords=["skills", "projects", "experience", "education", "languages", "objective"]
    )