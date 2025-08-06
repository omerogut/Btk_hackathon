let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStarted = false;
let originalQuizText = '';
let originalQuizData = [];

// Global elements that are used in multiple functions
let sidebar, welcomeScreen, chatArea, quizSection, quizContent, quizResults;

document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  console.log('Gemini Quiz UI initialized');
});

function setupEventListeners() {
  // Initialize global elements
  sidebar = document.getElementById('sidebar');
  welcomeScreen = document.getElementById('welcomeScreen');
  chatArea = document.getElementById('chatArea');
  quizSection = document.getElementById('quizSection');
  quizContent = document.getElementById('quizContent');
  quizResults = document.getElementById('quizResults');

  // Local elements for event listeners
  const menuBtn = document.getElementById('menuBtn');
  const closeQuizBtn = document.getElementById('closeQuizBtn');
  const newChatBtn = document.getElementById('newChatBtn');
  const generateBtn = document.getElementById('generateBtn');
  const messageInput = document.getElementById('messageInput');

  if (menuBtn) {
    menuBtn.addEventListener('click', toggleSidebar);
  }
  
  if (closeQuizBtn) {
    closeQuizBtn.addEventListener('click', closeQuiz);
  }
  
  if (newChatBtn) {
    newChatBtn.addEventListener('click', returnToWelcome);
  }

  // Demo quiz button
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'demoQuizBtn') {
      startDemoQuiz();
    }
  });

  // Handle generate button click
  if (generateBtn) {
    generateBtn.addEventListener('click', function(e) {
      e.preventDefault();
      generateQuizFromText();
    });
  }

  // Handle Enter key in message input (bonus functionality)
  if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        generateQuizFromText();
      }
    });
  }

  // Handle Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const quizSection = document.getElementById('quizSection');
      if (quizSection && quizSection.style.display !== 'none') {
        closeQuiz();
      }
    }
  });
}

function toggleSidebar() {
  if (sidebar) sidebar.classList.toggle('open');
}

function startDemoQuiz() {
  console.log('Starting demo quiz...');
  showProcessingMessage('Generating demo quiz...');
  
  const demoText = `
  Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines.
  Machine learning is a subset of AI that enables computers to learn without being explicitly programmed.
  Deep learning uses neural networks with multiple layers to process data.
  Natural Language Processing (NLP) helps computers understand and interpret human language.
  Computer vision allows machines to interpret and understand visual information from the world.
  `;
  
  setTimeout(() => {
    generateQuizFromTextContent(demoText);
  }, 1500);
}

function generateQuizFromText() {
  const messageInput = document.getElementById('messageInput');
  const text = messageInput ? messageInput.value.trim() : '';
  
  if (!text) {
    alert('Lütfen quiz oluşturmak için bir metin girin.');
    return;
  }
  
  originalQuizText = text; // Store original text for coaching
  showProcessingMessage('Quiz oluşturuluyor...');
  
  // Call Django backend to generate quiz
  fetch('/generate-quiz/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: text })
  })
  .then(response => response.json())
  .then(data => {
    hideLoadingIndicator();
    if (data.success) {
      displayGeneratedQuiz(data.quiz);
    } else {
      alert('Quiz oluşturulurken bir hata oluştu: ' + data.error);
      returnToWelcome();
    }
  })
  .catch(error => {
    hideLoadingIndicator();
    console.error('Error:', error);
    alert('Quiz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    returnToWelcome();
  });
}

function generateQuizFromTextContent(text) {
  originalQuizText = text; // Store original text for coaching
  showProcessingMessage('Quiz oluşturuluyor...');
  
  // Call Django backend to generate quiz
  fetch('/generate-quiz/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: text })
  })
  .then(response => response.json())
  .then(data => {
    hideLoadingIndicator();
    if (data.success) {
      displayGeneratedQuiz(data.quiz);
    } else {
      alert('Quiz oluşturulurken bir hata oluştu: ' + data.error);
      returnToWelcome();
    }
  })
  .catch(error => {
    hideLoadingIndicator();
    console.error('Error:', error);
    alert('Quiz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    returnToWelcome();
  });
}

function displayGeneratedQuiz(quizData) {
  console.log('Displaying generated quiz:', quizData);
  
  originalQuizData = quizData; // Store original quiz data for coaching
  
  // Convert Turkish format to our internal format
  const questions = quizData.map((item, index) => {
    const options = [item.şıklar.A, item.şıklar.B, item.şıklar.C, item.şıklar.D];
    const correctIndex = ['A', 'B', 'C', 'D'].indexOf(item.doğru_cevap);
    
    return {
      question: item.soru,
      options: options,
      correct: correctIndex
    };
  });
  
  currentQuiz = {
    title: 'Generated Quiz',
    questions: questions
  };
  
  currentQuestionIndex = 0;
  userAnswers = [];
  quizStarted = true;
  
  showQuizSection();
  renderQuizQuestion();
}

function showProcessingMessage(message) {
  showLoadingIndicator();
  welcomeScreen.style.display = 'none';
  chatArea.style.display = 'none';
  quizSection.style.display = 'none';
}

function showLoadingIndicator() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'block';
  }
}

function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}

function showQuizSection() {
  console.log('Showing quiz section');
  
  welcomeScreen.style.display = 'none';
  chatArea.style.display = 'none';
  quizSection.style.display = 'block';
  quizResults.style.display = 'none';
}

function renderQuizQuestion() {
  console.log('Rendering quiz question, currentQuiz:', currentQuiz);
  console.log('Current question index:', currentQuestionIndex);

  if (!currentQuiz || currentQuestionIndex >= currentQuiz.questions.length) {
    showQuizResults();
    return;
  }

  const question = currentQuiz.questions[currentQuestionIndex];
  const totalQuestions = currentQuiz.questions.length;

  if (quizContent) {
    quizContent.innerHTML = `
      <div class="quiz-question">
        <div class="question-number">Soru ${currentQuestionIndex + 1} / ${totalQuestions}</div>
        <div class="question-text">${question.question}</div>
        <div class="quiz-options">
          ${question.options.map((option, index) => `
            <div class="quiz-option" data-index="${index}">
              ${String.fromCharCode(65 + index)}. ${option}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="quiz-navigation">
        <button class="quiz-btn" id="prevBtn" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
          Önceki
        </button>
        <div class="quiz-progress">
          ${currentQuestionIndex + 1} / ${totalQuestions}
        </div>
        <button class="quiz-btn" id="nextBtn" disabled>
          ${currentQuestionIndex === totalQuestions - 1 ? 'Quiz\'i Bitir' : 'Sonraki'}
        </button>
      </div>
    `;
  }

  const options = quizContent.querySelectorAll('.quiz-option');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  options.forEach(option => {
    option.addEventListener('click', function() {
      // Check if this question is already answered
      if (this.classList.contains('answered')) {
        return;
      }
      
      const selectedIndex = parseInt(this.dataset.index);
      const correctIndex = question.correct;
      
      // Remove any previous selections
      options.forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
      });
      
      // Mark all options as answered to prevent further clicks
      options.forEach(opt => opt.classList.add('answered'));
      
      // Show correct answer in green
      options[correctIndex].classList.add('correct');
      
      // If selected answer is wrong, show it in red
      if (selectedIndex !== correctIndex) {
        this.classList.add('incorrect');
      }
      
      userAnswers[currentQuestionIndex] = selectedIndex;
      nextBtn.disabled = false;
    });
  });

  if (userAnswers[currentQuestionIndex] !== undefined) {
    const selectedIndex = userAnswers[currentQuestionIndex];
    const correctIndex = question.correct;
    
    // Mark all options as answered
    options.forEach(opt => opt.classList.add('answered'));
    
    // Show correct answer
    options[correctIndex].classList.add('correct');
    
    // Show wrong answer if applicable
    if (selectedIndex !== correctIndex) {
      options[selectedIndex].classList.add('incorrect');
    }
    
    nextBtn.disabled = false;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', nextQuestion);
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', previousQuestion);
  }
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
  let message = 'Pratik yaparak puanınızı artırabilirsiniz!';

  if (scorePercentage >= 80) {
    scoreClass = 'excellent';
    message = 'Mükemmel! Konuyu çok iyi kavramışsınız.';
  } else if (scorePercentage >= 60) {
    scoreClass = 'good';
    message = 'İyi iş! Çoğu konuyu doğru anlamışsınız.';
  }

  quizContent.style.display = 'none';
  quizResults.style.display = 'block';

  // Show initial results
  quizResults.innerHTML = `
    <h3>Quiz Tamamlandı!</h3>
    <div class="results-score ${scoreClass}">${scorePercentage}%</div>
    <div class="results-message">${message}</div>
    <div class="results-details">
      <div class="result-stat">
        <span class="result-stat-number">${correctAnswers}</span>
        <span class="result-stat-label">Doğru</span>
      </div>
      <div class="result-stat">
        <span class="result-stat-number">${totalQuestions - correctAnswers}</span>
        <span class="result-stat-label">Yanlış</span>
      </div>
      <div class="result-stat">
        <span class="result-stat-number">${totalQuestions}</span>
        <span class="result-stat-label">Toplam</span>
      </div>
    </div>
    <div id="coaching-section" style="margin-top: 30px;">
      <div style="text-align: center; color: #9aa0a6;">
        <i class="fas fa-spinner fa-spin" style="font-size: 20px; margin-bottom: 10px;"></i>
        <p>AI Eğitim Koçu raporunuz hazırlanıyor...</p>
      </div>
    </div>
    <button id="restartQuizBtn" style="margin-top: 15px; background-color: #1a73e8; border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
      Yeniden Başla
    </button>
  `;

  document.getElementById('restartQuizBtn').addEventListener('click', returnToWelcome);
  
  // Generate coaching report
  generateCoachingReport();
}

function generateCoachingReport() {
  if (!originalQuizData.length || !originalQuizText) {
    document.getElementById('coaching-section').innerHTML = '<p style="color: #ea4335;">Koçluk raporu oluşturulamadı.</p>';
    return;
  }

  fetch('/generate-coaching-report/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quiz_data: originalQuizData,
      user_answers: userAnswers,
      original_text: originalQuizText
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      displayCoachingReport(data.coaching_report);
    } else {
      document.getElementById('coaching-section').innerHTML = '<p style="color: #ea4335;">Koçluk raporu oluşturulamadı.</p>';
    }
  })
  .catch(error => {
    console.error('Error generating coaching report:', error);
    document.getElementById('coaching-section').innerHTML = '<p style="color: #ea4335;">Koçluk raporu oluşturulamadı.</p>';
  });
}

function displayCoachingReport(report) {
  const coachingSection = document.getElementById('coaching-section');
  
  coachingSection.innerHTML = `
    <div style="background-color: #1e1f20; border-radius: 12px; padding: 24px; border: 1px solid #2d2e30; text-align: left;">
      <h3 style="color: #4285f4; margin-bottom: 20px; display: flex; align-items: center;">
        <i class="fas fa-graduation-cap" style="margin-right: 10px;"></i>
        AI Eğitim Koçu Raporu
      </h3>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #e8eaed; margin-bottom: 8px;">📊 Genel Değerlendirme</h4>
        <p style="color: #9aa0a6; line-height: 1.5;">${report.genel_degerlendirme}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #34a853; margin-bottom: 8px;">💪 Güçlü Yanlarınız</h4>
        <ul style="color: #9aa0a6; margin-left: 20px;">
          ${report.guclu_yanlar.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #fbbc04; margin-bottom: 8px;">🎯 Gelişim Alanları</h4>
        <ul style="color: #9aa0a6; margin-left: 20px;">
          ${report.gelisim_alanlari.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #1a73e8; margin-bottom: 8px;">💡 Öneriler</h4>
        <ul style="color: #9aa0a6; margin-left: 20px;">
          ${report.oneriler.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #9c27b0; margin-bottom: 8px;">🚀 Sonraki Adımlar</h4>
        <ul style="color: #9aa0a6; margin-left: 20px;">
          ${report.sonraki_adimlar.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
        </ul>
      </div>

      <div style="background-color: #2d2e30; padding: 16px; border-radius: 8px; border-left: 4px solid #4285f4;">
        <h4 style="color: #4285f4; margin-bottom: 8px;">🌟 Motivasyon Mesajı</h4>
        <p style="color: #e8eaed; font-style: italic;">${report.motivasyon_mesaji}</p>
      </div>
    </div>
  `;
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
  welcomeScreen.style.display = 'flex';
  chatArea.style.display = 'none';
  quizSection.style.display = 'none';
  hideLoadingIndicator();

  currentQuiz = null;
  currentQuestionIndex = 0;
  userAnswers = [];
  quizStarted = false;
  
  // Clear the message input
  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.value = '';
  }
}

// Button click animation
document.addEventListener('click', function(e) {
  if (e.target.matches('button')) {
    e.target.style.transform = 'scale(0.98)';
    setTimeout(() => {
      e.target.style.transform = 'scale(1)';
    }, 100);
  }
});

console.log('%c🚀 Gemini Quiz UI Loaded Successfully! 🚀', 'color: #4285f4; font-size: 16px; font-weight: bold;');
console.log('%cEnter text to generate an interactive quiz!', 'color: #9aa0a6; font-size: 14px;');