const quizData = {
  "JavaScript Basics": [
    {
      question: "What is the correct way to declare a variable in JavaScript?",
      options: ["var myVar;", "variable myVar;", "v myVar;", "declare myVar;"],
      correct: 0
    },
    {
      question: "Which of the following is NOT a JavaScript data type?",
      options: ["String", "Boolean", "Integer", "Number"],
      correct: 2
    },
    {
      question: "How do you create a function in JavaScript?",
      options: ["function myFunction() {}", "create myFunction() {}", "def myFunction() {}", "func myFunction() {}"],
      correct: 0
    },
    {
      question: "What does the '===' operator do in JavaScript?",
      options: ["Assignment", "Equality without type checking", "Strict equality with type checking", "Not equal"],
      correct: 2
    },
    {
      question: "How do you add an element to the end of an array?",
      options: ["array.add()", "array.push()", "array.append()", "array.insert()"],
      correct: 1
    }
  ],
  "Web Development": [
    {
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
      correct: 0
    },
    {
      question: "Which CSS property is used to change the text color?",
      options: ["color", "text-color", "font-color", "text-style"],
      correct: 0
    },
    {
      question: "What is the purpose of the <head> element in HTML?",
      options: ["Display content", "Contains metadata", "Create navigation", "Add images"],
      correct: 1
    },
    {
      question: "Which HTTP method is used to submit form data?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correct: 1
    },
    {
      question: "What is CSS used for?",
      options: ["Database management", "Server-side logic", "Styling web pages", "Creating animations only"],
      correct: 2
    }
  ],
  "Programming Concepts": [
    {
      question: "What is an algorithm?",
      options: ["A programming language", "A step-by-step procedure to solve a problem", "A type of variable", "A database query"],
      correct: 1
    },
    {
      question: "What does OOP stand for?",
      options: ["Object Oriented Programming", "Open Office Program", "Online Operating Platform", "Optimized Output Processing"],
      correct: 0
    },
    {
      question: "Which of these is a loop structure?",
      options: ["if-else", "switch", "for", "try-catch"],
      correct: 2
    },
    {
      question: "What is recursion?",
      options: ["A type of variable", "A function calling itself", "A loop structure", "An error handling method"],
      correct: 1
    },
    {
      question: "What is the purpose of version control?",
      options: ["Speed up programs", "Track changes in code", "Compress files", "Encrypt data"],
      correct: 1
    }
  ]
};

let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStarted = false;

const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const uploadBtn = document.getElementById('uploadBtn');
const uploadModal = document.getElementById('uploadModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const uploadArea = document.getElementById('uploadArea');
const selectFileBtn = document.getElementById('selectFileBtn');
const fileInput = document.getElementById('fileInput');
const addBtn = document.getElementById('addBtn');
const welcomeScreen = document.getElementById('welcomeScreen');
const chatArea = document.getElementById('chatArea');
const quizSection = document.getElementById('quizSection');
const closeQuizBtn = document.getElementById('closeQuizBtn');
const quizContent = document.getElementById('quizContent');
const quizResults = document.getElementById('quizResults');
const newChatBtn = document.getElementById('newChatBtn');

document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  console.log('Gemini Quiz UI initialized');
});

function setupEventListeners() {
  menuBtn.addEventListener('click', toggleSidebar);

  uploadBtn.addEventListener('click', openUploadModal);
  addBtn.addEventListener('click', openUploadModal);
  closeModalBtn.addEventListener('click', closeUploadModal);
  selectFileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);

  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('dragleave', handleDragLeave);
  uploadArea.addEventListener('drop', handleFileDrop);
  uploadArea.addEventListener('click', () => fileInput.click());

  closeQuizBtn.addEventListener('click', closeQuiz);
  newChatBtn.addEventListener('click', returnToWelcome);

  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'demoQuizBtn') {
      startDemoQuiz();
    }
  });

  uploadModal.addEventListener('click', function(e) {
    if (e.target === uploadModal) {
      closeUploadModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (uploadModal.style.display === 'flex') {
        closeUploadModal();
      } else if (quizSection.style.display !== 'none') {
        closeQuiz();
      }
    }
  });
}

function toggleSidebar() {
  sidebar.classList.toggle('open');
}

function openUploadModal() {
  uploadModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeUploadModal() {
  uploadModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  uploadArea.classList.remove('dragover');
}

function handleDragOver(e) {
  e.preventDefault();
  uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
}

function handleFileDrop(e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    processFile(file);
  }
}

function processFile(file) {
  console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a PDF or image file (JPG, PNG)');
    console.log('File type not allowed:', file.type);
    return;
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('File size must be less than 10MB');
    console.log('File too large:', file.size);
    return;
  }

  console.log('Processing file:', file.name);
  closeUploadModal();

  showProcessingMessage(file.name);

  setTimeout(() => {
    generateQuiz(file);
  }, 2000);
}

function showProcessingMessage(fileName) {
  const mainContent = document.getElementById('mainContent');
  mainContent.innerHTML = `
    <div class="processing-screen" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
      <div class="processing-animation" style="width: 60px; height: 60px; border: 4px solid #2d2e30; border-top: 4px solid #4285f4; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 24px;"></div>
      <h2 style="color: #e8eaed; font-size: 24px; font-weight: 500; margin-bottom: 12px;">Generating Quiz...</h2>
      <p style="color: #9aa0a6; font-size: 16px; text-align: center;">Analyzing "${fileName}" to create your personalized quiz</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}

function startDemoQuiz() {
  console.log('Starting demo quiz...');

  const demoFile = { name: 'Demo Quiz' };

  showProcessingMessage('Demo Quiz');

  setTimeout(() => {
    generateQuiz(demoFile);
  }, 1500);
}

function generateQuiz(file) {
  console.log('Generating quiz for file:', file.name);

  const topics = Object.keys(quizData);
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];

  currentQuiz = {
    title: `Quiz Generated from: ${file.name}`,
    topic: randomTopic,
    questions: quizData[randomTopic]
  };

  currentQuestionIndex = 0;
  userAnswers = [];
  quizStarted = true;

  console.log('Quiz generated:', currentQuiz);

  showQuizSection();
  renderQuizQuestion();
}

function showQuizSection() {
  console.log('Showing quiz section');

  const mainContent = document.getElementById('mainContent');
  if (mainContent && !mainContent.querySelector('#welcomeScreen')) {
    console.log('Restoring main content structure...');
    mainContent.innerHTML = `
      <!-- Welcome Screen -->
      <div class="welcome-screen" id="welcomeScreen">
        <div class="greeting">
          <h2>Merhaba, Umut</h2>
          <button class="demo-quiz-btn" id="demoQuizBtn" style="margin-top: 30px; background-color: #4285f4; border: none; color: white; padding: 12px 24px; border-radius: 24px; font-size: 14px; cursor: pointer; transition: background-color 0.2s;">
            🎯 Try Demo Quiz
          </button>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-area" id="chatArea" style="display: none;">
        <div class="messages" id="messages"></div>
      </div>

      <!-- Quiz Section -->
      <div class="quiz-section" id="quizSection" style="display: none;">
        <div class="quiz-header">
          <h2>Quiz Generated from Uploaded File</h2>
          <button class="close-quiz-btn" id="closeQuizBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="quiz-content" id="quizContent">
          <!-- Quiz will be dynamically generated here -->
        </div>
        <div class="quiz-results" id="quizResults" style="display: none;">
          <!-- Results will be shown here -->
        </div>
      </div>
    `;

    const newCloseQuizBtn = document.getElementById('closeQuizBtn');
    if (newCloseQuizBtn) {
      newCloseQuizBtn.addEventListener('click', closeQuiz);
    }
  }

  const welcomeScreen = document.getElementById('welcomeScreen');
  const chatArea = document.getElementById('chatArea');
  const quizSection = document.getElementById('quizSection');
  const quizResults = document.getElementById('quizResults');

  console.log('Elements found:', {
    welcomeScreen: !!welcomeScreen,
    chatArea: !!chatArea,
    quizSection: !!quizSection,
    quizResults: !!quizResults
  });

  if (welcomeScreen) welcomeScreen.style.display = 'none';
  if (chatArea) chatArea.style.display = 'none';
  if (quizSection) quizSection.style.display = 'block';
  if (quizResults) quizResults.style.display = 'none';
}

function renderQuizQuestion() {
  console.log('Rendering quiz question, currentQuiz:', currentQuiz);
  console.log('Current question index:', currentQuestionIndex);

  const quizContent = document.getElementById('quizContent');
  console.log('Quiz content element found:', !!quizContent);

  if (!currentQuiz || currentQuestionIndex >= currentQuiz.questions.length) {
    showQuizResults();
    return;
  }

  const question = currentQuiz.questions[currentQuestionIndex];
  const totalQuestions = currentQuiz.questions.length;

  if (quizContent) {
    quizContent.innerHTML = `
      <div class="quiz-question">
        <div class="question-number">Question ${currentQuestionIndex + 1} of ${totalQuestions}</div>
        <div class="question-text">${question.question}</div>
        <div class="quiz-options">
          ${question.options.map((option, index) => `
            <div class="quiz-option" data-index="${index}">
              ${option}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="quiz-navigation">
        <button class="quiz-btn" id="prevBtn" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
          Previous
        </button>
        <div class="quiz-progress">
          ${currentQuestionIndex + 1} / ${totalQuestions}
        </div>
        <button class="quiz-btn" id="nextBtn" disabled>
          ${currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next'}
        </button>
      </div>
    `;

    console.log('Quiz content set successfully');
  } else {
    console.error('quizContent element not found!');
  }

  const options = quizContent.querySelectorAll('.quiz-option');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  options.forEach(option => {
    option.addEventListener('click', function() {
      options.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');

      userAnswers[currentQuestionIndex] = parseInt(this.dataset.index);

      nextBtn.disabled = false;
    });
  });

  if (userAnswers[currentQuestionIndex] !== undefined) {
    options[userAnswers[currentQuestionIndex]].classList.add('selected');
    nextBtn.disabled = false;
  }

  nextBtn.addEventListener('click', nextQuestion);
  prevBtn.addEventListener('click', previousQuestion);
}

function nextQuestion() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    currentQuestionIndex++;
    renderQuizQuestion();
  } else {
    showQuizResults();
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuizQuestion();
  }
}

function showQuizResults() {
  const totalQuestions = currentQuiz.questions.length;
  let correctAnswers = 0;

  currentQuiz.questions.forEach((question, index) => {
    if (userAnswers[index] === question.correct) {
      correctAnswers++;
    }
  });

  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  let scoreClass = 'needs-improvement';
  let message = 'Keep practicing to improve your score!';

  if (scorePercentage >= 80) {
    scoreClass = 'excellent';
    message = 'Excellent work! You have a strong understanding of the topic.';
  } else if (scorePercentage >= 60) {
    scoreClass = 'good';
    message = 'Good job! You have a solid grasp of most concepts.';
  }

  const quizContent = document.getElementById('quizContent');
  const quizResults = document.getElementById('quizResults');

  if (quizContent) quizContent.style.display = 'none';
  if (quizResults) quizResults.style.display = 'block';

  if (quizResults) {
    quizResults.innerHTML = `
      <div class="results-score ${scoreClass}">${scorePercentage}%</div>
      <div class="results-message">${message}</div>
      <div class="results-details">
        <div class="result-stat">
          <span class="result-stat-number">${correctAnswers}</span>
          <span class="result-stat-label">Correct</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-number">${totalQuestions - correctAnswers}</span>
          <span class="result-stat-label">Incorrect</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-number">${totalQuestions}</span>
          <span class="result-stat-label">Total</span>
        </div>
      </div>
      <div class="quiz-navigation">
        <button class="quiz-btn" id="reviewBtn">Review Answers</button>
        <button class="quiz-btn" id="newQuizBtn">Take New Quiz</button>
      </div>
    `;
  }

  document.getElementById('reviewBtn').addEventListener('click', reviewAnswers);
  document.getElementById('newQuizBtn').addEventListener('click', returnToWelcome);
}

function reviewAnswers() {
  quizResults.style.display = 'none';
  quizContent.style.display = 'block';

  const question = currentQuiz.questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestionIndex];
  const correctAnswer = question.correct;

  quizContent.innerHTML = `
    <div class="quiz-question">
      <div class="question-number">Review - Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}</div>
      <div class="question-text">${question.question}</div>
      <div class="quiz-options">
        ${question.options.map((option, index) => {
          let className = 'quiz-option';
          if (index === correctAnswer) {
            className += ' correct';
          } else if (index === userAnswer && userAnswer !== correctAnswer) {
            className += ' incorrect';
          }
          return `<div class="${className}" data-index="${index}">${option}</div>`;
        }).join('')}
      </div>
      <div style="margin-top: 20px; padding: 16px; background-color: #2d2e30; border-radius: 8px; font-size: 14px; color: #9aa0a6;">
        ${userAnswer === correctAnswer ?
          '<span style="color: #34a853;">✓ Correct!</span>' :
          `<span style="color: #ea4335;">✗ Incorrect.</span> The correct answer is: <strong style="color: #34a853;">${question.options[correctAnswer]}</strong>`
        }
      </div>
    </div>
    <div class="quiz-navigation">
      <button class="quiz-btn" id="prevReviewBtn" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
        Previous
      </button>
      <div class="quiz-progress">
        ${currentQuestionIndex + 1} / ${currentQuiz.questions.length}
      </div>
      <button class="quiz-btn" id="nextReviewBtn" ${currentQuestionIndex === currentQuiz.questions.length - 1 ? 'disabled' : ''}>
        Next
      </button>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <button class="quiz-btn" id="backToResultsBtn">Back to Results</button>
    </div>
  `;

  const prevReviewBtn = document.getElementById('prevReviewBtn');
  const nextReviewBtn = document.getElementById('nextReviewBtn');
  const backToResultsBtn = document.getElementById('backToResultsBtn');

  if (prevReviewBtn && !prevReviewBtn.disabled) {
    prevReviewBtn.addEventListener('click', () => {
      currentQuestionIndex--;
      reviewAnswers();
    });
  }

  if (nextReviewBtn && !nextReviewBtn.disabled) {
    nextReviewBtn.addEventListener('click', () => {
      currentQuestionIndex++;
      reviewAnswers();
    });
  }

  backToResultsBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    showQuizResults();
  });
}

function closeQuiz() {
  quizSection.style.display = 'none';
  returnToWelcome();

  currentQuiz = null;
  currentQuestionIndex = 0;
  userAnswers = [];
  quizStarted = false;
}

function returnToWelcome() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const chatArea = document.getElementById('chatArea');
  const quizSection = document.getElementById('quizSection');

  if (welcomeScreen) welcomeScreen.style.display = 'flex';
  if (chatArea) chatArea.style.display = 'none';
  if (quizSection) quizSection.style.display = 'none';

  currentQuiz = null;
  currentQuestionIndex = 0;
  userAnswers = [];
  quizStarted = false;
}

document.addEventListener('click', function(e) {
  if (e.target.matches('button')) {
    e.target.style.transform = 'scale(0.98)';
    setTimeout(() => {
      e.target.style.transform = 'scale(1)';
    }, 100);
  }
});

console.log('%c🚀 Gemini Quiz UI Loaded Successfully! 🚀', 'color: #4285f4; font-size: 16px; font-weight: bold;');
console.log('%cUpload a file to generate an interactive quiz!', 'color: #9aa0a6; font-size: 14px;');
