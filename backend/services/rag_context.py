def build_resume_context(skills, projects, experience):

    context = "Candidate Resume Information:\n\n"

    if skills:
        context += "Skills:\n"
        context += ", ".join(skills) + "\n\n"

    if projects:
        context += "Projects:\n"
        for p in projects:
            context += f"- {p}\n"
        context += "\n"

    if experience:
        context += "Experience:\n"
        for e in experience:
            context += f"- {e}\n"

    return context