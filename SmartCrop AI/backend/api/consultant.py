import os


def get_farmer_advice(disease_name: str, language: str) -> str:
    supported_languages = {
        "hindi": "Hindi",
        "marathi": "Marathi",
        "telugu": "Telugu",
    }

    requested_language = supported_languages.get((language or "").strip().lower())
    if requested_language is None:
        return "Please choose Hindi, Marathi, or Telugu for farmer advice."

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return f"Gemini API key is missing. Unable to generate farmer advice in {requested_language}."

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction="You are an elite Indian agronomist helper.",
        )

        prompt = (
            f"A farmer has a crop disease called '{disease_name}'. "
            f"Write the full response only in {requested_language}. Use clear, simple terms that a farmer can understand. "
            "Include these sections in the answer: organic remedies, chemical treatments, and preventive measures. "
            "Give practical advice for Indian farming conditions. Keep the answer concise, useful, and easy to follow."
        )

        response = model.generate_content(prompt)
        text = getattr(response, "text", None)
        if text:
            return text.strip()

        return f"No advice was returned by Gemini for {requested_language}."
    except Exception:
        return f"Sorry, farmer advice is temporarily unavailable in {requested_language}. Please try again later."