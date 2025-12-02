# HealthScanner Flask App

A production-ready Flask application for scanning food labels, performing OCR, and analyzing health implications using OpenAI, tailored to user profiles.

## Setup Instructions

### Prerequisites
* Python 3.10+
* Tesseract OCR Engine installed on your system.
    * **Windows**: Download installer from [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki). Add installation path to system PATH.
    * **Mac**: `brew install tesseract`
    * **Ubuntu**: `sudo apt-get install tesseract-ocr`

### Installation

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```
   SECRET_KEY=your-super-secret-key
   DATABASE_URL=sqlite:///app.db
   OPENAI_API_KEY=sk-your-openai-api-key
   OPENAI_SYSTEM_PROMPT="You are a helpful nutritionist assistant. Analyze the food label text provided. Return a JSON object with keys: ingredients (list), allergens (list), additives (list), nutritional_concerns (list), recommendation (string), score (integer 0-100), and explanation (string). Consider the user's allergies and conditions if provided."
   ```

4. **Initialize Database**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

### Running the App

```bash
flask run
```
Access the app at `http://127.0.0.1:5000`.

### Usage Flow
1. Register a new account.
2. Complete the Onboarding flow (health profile).
3. Go to Dashboard -> Scan Now.
4. Allow camera permissions.
5. Capture an image of a food label.
6. Click "Analyze Image".
7. View the breakdown and health score.

### Testing

```bash
pytest
```

## Developer Notes

* **Copilot Usage**: You can use GitHub Copilot to extend this application. For example, ask it to "Add a history page that lists all previous scans from the database" or "Improve the OCR preprocessing in analysis.py".
* **System Prompt**: The system prompt can be edited in the `.env` file or dynamically via the Settings page in the app (which saves to the database).
