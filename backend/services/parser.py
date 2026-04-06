import pdfplumber

def extract_text_from_pdf(file):
  text = ""
  with pdfplumber.open(file) as pdf:
    for page in pdf.pages:
      content = page.extract_text(layout=True)
      if content:
        text += content + "\n"
  return text