# pyrefly: ignore[missing-import]
from google import genai

client = genai.Client()

uploaded_file = client.files.upload(file='sample.mp3')

prompt = 'Generate a transcript of the audio.'

response = client.models.generate_content(
  model="gemini-3.1-flash-lite",
  contents=[prompt, uploaded_file]
)

print(response.text)