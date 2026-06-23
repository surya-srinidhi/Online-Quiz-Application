const API_URL = '';
const savedUsername = localStorage.getItem('quiz_username') || '';

const isDashboard = document.getElementById('quizzes-container') !== null;
const isQuizView = document.getElementById('quiz-panel') !== null;

if (isDashboard) {
  const usernameInput = document.getElementById('username');
  const quizzesContainer = document.getElementById('quizzes-container');
  const leaderboardBody = document.getElementById('leaderboard-body');
  const errorContainer = document.getElementById('error-container');
  const errorMessage = document.getElementById('error-message');

  usernameInput.value = savedUsername;

  usernameInput.addEventListener('input', (e) => {
    localStorage.setItem('quiz_username', e.target.value.trim());
  });

  async function loadQuizzes() {
    try {
      const response = await fetch(`${API_URL}/api/quizzes`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quizzes.');
      }
      
      const quizzes = await response.json();
      quizzesContainer.innerHTML = '';

      if (quizzes.length === 0) {
        quizzesContainer.innerHTML = '<p style="color: var(--text-secondary);">No quizzes available at the moment.</p>';
        return;
      }

      quizzes.forEach(quiz => {
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';
        quizCard.innerHTML = `
          <div>
            <h3>${escapeHTML(quiz.title)}</h3>
            <p>${escapeHTML(quiz.description || 'No description provided.')}</p>
          </div>
          <div class="card-footer">
            <button class="quiz-btn" onclick="startQuiz(${quiz.id})">Start Quiz</button>
          </div>
        `;
        quizzesContainer.appendChild(quizCard);
      });
    } catch (error) {
      console.error('Quiz loading error:', error);
      showDatabaseError(error.message);
    }
  }

  async function loadLeaderboard() {
    try {
      const response = await fetch(`${API_URL}/api/leaderboard`);
      if (!response.ok) return;
      
      const leaderboard = await response.json();
      leaderboardBody.innerHTML = '';

      if (leaderboard.length === 0) {
        leaderboardBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">
              No scores recorded yet. Be the first to play!
            </td>
          </tr>
        `;
        return;
      }

      leaderboard.forEach((entry, index) => {
        const rank = index + 1;
        let rankClass = 'rank-other';
        if (rank === 1) rankClass = 'rank-1';
        else if (rank === 2) rankClass = 'rank-2';
        else if (rank === 3) rankClass = 'rank-3';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="rank-badge ${rankClass}">${rank}</span></td>
          <td style="font-weight: 500;">${escapeHTML(entry.username)}</td>
          <td style="color: var(--text-secondary);">${escapeHTML(entry.quiz_title)}</td>
          <td style="font-weight: 600; color: var(--accent);">${entry.score} / ${entry.total_questions}</td>
        `;
        leaderboardBody.appendChild(tr);
      });
    } catch (error) {
      console.error('Leaderboard error:', error);
    }
  }

  window.startQuiz = function(quizId) {
    const username = usernameInput.value.trim();
    if (!username) {
      alert('Please enter your name before starting the quiz!');
      usernameInput.focus();
      usernameInput.style.borderColor = 'var(--error)';
      setTimeout(() => usernameInput.style.borderColor = 'rgba(255,255,255,0.1)', 1500);
      return;
    }

    localStorage.setItem('quiz_username', username);
    window.location.href = `quiz.html?id=${quizId}`;
  };

  function showDatabaseError(message) {
    errorMessage.textContent = message;
    errorContainer.style.display = 'block';
    quizzesContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
        Please start your MySQL server and run <strong>schema.sql</strong>.
      </div>
    `;
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--text-muted);">
          Database connection error.
        </td>
      </tr>
    `;
  }

  loadQuizzes();
  loadLeaderboard();
}

if (isQuizView) {
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id');

  if (!quizId) {
    window.location.href = 'index.html';
  }

  let questions = [];
  let currentIdx = 0;
  let selectedAnswers = {};

  const quizTitleEl = document.getElementById('quiz-title');
  const questionCounterEl = document.getElementById('question-counter');
  const quizProgressEl = document.getElementById('quiz-progress');
  const questionTextEl = document.getElementById('question-text');
  const optionsContainerEl = document.getElementById('options-container');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');

  async function loadQuizQuestions() {
    try {
      const quizzesResponse = await fetch(`${API_URL}/api/quizzes`);
      if (quizzesResponse.ok) {
        const quizzes = await quizzesResponse.json();
        const currentQuiz = quizzes.find(q => q.id === parseInt(quizId));
        if (currentQuiz) {
          quizTitleEl.textContent = currentQuiz.title;
        }
      }

      const response = await fetch(`${API_URL}/api/quizzes/${quizId}/questions`);
      if (!response.ok) {
        throw new Error('Could not load quiz questions.');
      }
      
      questions = await response.json();
      if (questions.length === 0) {
        throw new Error('This quiz has no questions.');
      }

      renderQuestion();
    } catch (error) {
      console.error(error);
      questionTextEl.textContent = 'Error: ' + error.message;
      questionTextEl.style.color = 'var(--error)';
    }
  }

  function renderQuestion() {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'none';

    const currentQuestion = questions[currentIdx];
    const progressPercent = (currentIdx / questions.length) * 100;
    quizProgressEl.style.width = `${progressPercent}%`;
    questionCounterEl.textContent = `Question ${currentIdx + 1} of ${questions.length}`;

    questionTextEl.textContent = currentQuestion.question_text;
    optionsContainerEl.innerHTML = '';

    const options = [
      { key: 'A', value: currentQuestion.option_a },
      { key: 'B', value: currentQuestion.option_b },
      { key: 'C', value: currentQuestion.option_c },
      { key: 'D', value: currentQuestion.option_d }
    ];

    options.forEach(opt => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      
      if (selectedAnswers[currentQuestion.id] === opt.key) {
        button.classList.add('selected');
      }

      button.innerHTML = `
        <span class="option-prefix">${opt.key}</span>
        <span>${escapeHTML(opt.value)}</span>
      `;

      button.addEventListener('click', () => selectOption(currentQuestion.id, opt.key, button));
      optionsContainerEl.appendChild(button);
    });
  }

  function selectOption(questionId, optionCode, clickedButton) {
    const optionBtns = optionsContainerEl.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => btn.classList.remove('selected'));

    clickedButton.classList.add('selected');
    selectedAnswers[questionId] = optionCode;

    if (currentIdx < questions.length - 1) {
      nextBtn.style.display = 'inline-block';
    } else {
      submitBtn.style.display = 'inline-block';
    }
  }

  nextBtn.addEventListener('click', () => {
    if (currentIdx < questions.length - 1) {
      currentIdx++;
      renderQuestion();
    }
  });

  submitBtn.addEventListener('click', async () => {
    const username = localStorage.getItem('quiz_username') || 'Anonymous';
    quizProgressEl.style.width = '100%';

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const response = await fetch(`${API_URL}/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          answers: selectedAnswers
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit score.');
      }

      const results = await response.json();
      displayResults(results, username);
    } catch (error) {
      alert('Error submitting quiz: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Quiz';
    }
  });

  function displayResults(results, username) {
    document.getElementById('active-quiz-view').style.display = 'none';
    
    const resultsView = document.getElementById('results-view');
    resultsView.style.display = 'block';

    document.getElementById('results-username-tag').textContent = `Great work, ${escapeHTML(username)}! Here is your performance overview:`;
    document.getElementById('score-text').textContent = results.score;
    document.getElementById('total-text').textContent = `out of ${results.totalQuestions}`;

    const scorePercentage = (results.score / results.totalQuestions) * 100;
    const feedbackEl = document.getElementById('performance-message');
    if (scorePercentage === 100) {
      feedbackEl.textContent = 'Perfect Score! 🌟 You are a master in this topic!';
      feedbackEl.style.color = 'var(--success)';
    } else if (scorePercentage >= 80) {
      feedbackEl.textContent = 'Awesome job! 🎉 Outstanding knowledge!';
      feedbackEl.style.color = 'var(--success)';
    } else if (scorePercentage >= 50) {
      feedbackEl.textContent = 'Good effort! 👍 Keep practicing to improve!';
      feedbackEl.style.color = 'var(--accent)';
    } else {
      feedbackEl.textContent = 'Keep reading and try again! 📚 Learning is a journey.';
      feedbackEl.style.color = 'var(--error)';
    }

    const correctionsContainer = document.getElementById('corrections-container');
    correctionsContainer.innerHTML = '<h3 style="margin-top: 1rem; font-size: 1.2rem; color: var(--text-secondary);">Review Your Answers:</h3>';

    questions.forEach((q, idx) => {
      const correctionCard = document.createElement('div');
      correctionCard.style.background = 'rgba(255, 255, 255, 0.02)';
      correctionCard.style.border = '1px solid rgba(255, 255, 255, 0.05)';
      correctionCard.style.borderRadius = 'var(--radius-md)';
      correctionCard.style.padding = '1.25rem';
      correctionCard.style.marginTop = '0.5rem';

      const userChoice = selectedAnswers[q.id];
      const correctChoice = results.correctAnswers[q.id];
      const isCorrect = userChoice === correctChoice;

      correctionCard.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem;">
          <h4 style="font-size: 1.05rem; font-weight: 600; line-height: 1.4;">
            ${idx + 1}. ${escapeHTML(q.question_text)}
          </h4>
          <span style="font-weight: 700; font-size: 1.1rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: ${isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${isCorrect ? 'var(--success)' : 'var(--error)'}">
            ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </span>
        </div>
      `;

      const choices = [
        { label: 'A', text: q.option_a },
        { label: 'B', text: q.option_b },
        { label: 'C', text: q.option_c },
        { label: 'D', text: q.option_d }
      ];

      const choicesList = document.createElement('div');
      choicesList.style.display = 'flex';
      choicesList.style.flexDirection = 'column';
      choicesList.style.gap = '0.5rem';

      choices.forEach(ch => {
        const optionDiv = document.createElement('div');
        optionDiv.style.padding = '0.75rem 1rem';
        optionDiv.style.borderRadius = 'var(--radius-sm)';
        optionDiv.style.border = '1px solid rgba(255,255,255,0.04)';
        optionDiv.style.fontSize = '0.95rem';
        optionDiv.style.display = 'flex';
        optionDiv.style.alignItems = 'center';
        optionDiv.style.gap = '0.75rem';

        if (ch.label === correctChoice) {
          optionDiv.style.background = 'rgba(16, 185, 129, 0.12)';
          optionDiv.style.borderColor = 'var(--success)';
          optionDiv.style.color = 'white';
        } else if (ch.label === userChoice && !isCorrect) {
          optionDiv.style.background = 'rgba(239, 68, 68, 0.12)';
          optionDiv.style.borderColor = 'var(--error)';
          optionDiv.style.color = 'white';
        } else {
          optionDiv.style.background = 'rgba(0,0,0,0.15)';
          optionDiv.style.color = 'var(--text-secondary)';
        }

        let suffix = '';
        if (ch.label === correctChoice) {
          suffix = ' <strong style="color: var(--success); margin-left: auto;">(Correct Answer)</strong>';
        } else if (ch.label === userChoice) {
          suffix = ' <strong style="color: var(--error); margin-left: auto;">(Your Choice)</strong>';
        }

        optionDiv.innerHTML = `
          <span style="font-weight: 700; opacity: 0.8;">${ch.label}:</span>
          <span>${escapeHTML(ch.text)}</span>
          ${suffix}
        `;
        choicesList.appendChild(optionDiv);
      });

      correctionCard.appendChild(choicesList);
      correctionsContainer.appendChild(correctionCard);
    });
  }

  loadQuizQuestions();
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
