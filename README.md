# Gemini Quiz Generator

A Django-based AI-powered quiz generator that uses Google's Gemini API to create interactive quizzes from user-provided text.

## Features

- 🤖 AI-powered quiz generation using Google Gemini
- 📝 Generate quizzes from any text input
- 🎯 Interactive quiz interface with real-time feedback
- ✅ Color-coded answers (green for correct, red for incorrect)
- 📊 Detailed results and scoring
- 🎨 Modern, responsive UI inspired by Google's design
- 🔄 Demo quiz functionality

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 3. Configure Environment Variables

Create a `.env` file in the project root and add your keys:

```
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_django_secret_key_here
```

### 4. Run Database Migrations

```bash
python manage.py migrate
```

### 5. Start the Development Server

```bash
python manage.py runserver
```

### 6. Access the Application

Open your browser and go to: `http://127.0.0.1:8000`

## How to Use

1. **Enter Text**: Type or paste the text you want to create a quiz from in the text area
2. **Generate Quiz**: Click "Quiz Oluştur" to generate questions using AI
3. **Take Quiz**: Answer the multiple-choice questions
4. **Get Feedback**: See immediate color feedback for each answer:
   - ✅ Green: Correct answer
   - ❌ Red: Your incorrect answer
5. **View Results**: See your final score and detailed statistics

## Project Structure

```
├── quiz_project/          # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── quiz_app/              # Main Django app
│   ├── views.py           # Quiz generation logic
│   └── urls.py
├── templates/             # HTML templates
│   └── index.html         # Main interface
├── static/                # Static files
│   ├── style.css          # Styling
│   └── main.js            # Frontend logic
├── requirements.txt       # Python dependencies
└── README.md
```

## API Endpoints

- `GET /` - Main quiz interface
- `POST /generate-quiz/` - Generate quiz from text (JSON API)

## Example Quiz Format

The AI generates quizzes in this format:

```json
[
  {
    "soru": "What is the main topic?",
    "şıklar": {
      "A": "Option A",
      "B": "Option B", 
      "C": "Option C",
      "D": "Option D"
    },
    "doğru_cevap": "A"
  }
]
```

## Technologies Used

- **Backend**: Django 5.0, Python
- **AI**: Google Gemini API
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with Google Design principles
- **Icons**: Font Awesome

## Notes

- Make sure to set up your Gemini API key correctly
- The quiz interface provides immediate feedback when answers are selected
- All content is displayed on a single page for better user experience
- The system supports Turkish language prompts and responses