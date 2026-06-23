require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quiz_db',
};

let dbPool;

async function initDatabase() {
  try {
    dbPool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    
    // Test the database connection
    const connection = await dbPool.getConnection();
    console.log('Connected to MySQL database: ' + dbConfig.database);
    connection.release();
  } catch (error) {
    console.error('----------------------------------------------------');
    console.error('DATABASE CONNECTION ERROR:');
    console.error(error.message);
    console.error('Make sure:');
    console.error('1. MySQL is running.');
    console.error('2. You imported schema.sql.');
    console.error('3. Credentials in your .env file match your MySQL setup.');
    console.error('----------------------------------------------------');
    dbPool = null;
  }
}

initDatabase();

// Middleware to prevent routing errors if database is down
function checkDbOnline(req, res, next) {
  if (!dbPool) {
    return res.status(503).json({
      error: 'Database is offline. Please make sure MySQL is running and configured correctly in the .env file.',
    });
  }
  next();
}

// Get all quizzes
app.get('/api/quizzes', checkDbOnline, async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM quizzes');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get questions for a specific quiz (exclude correct_option to prevent cheating)
app.get('/api/quizzes/:id/questions', checkDbOnline, async (req, res) => {
  const quizId = req.params.id;
  try {
    const [rows] = await dbPool.query(
      'SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id = ?',
      [quizId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found or has no questions.' });
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Grade quiz answers and save user score
app.post('/api/quizzes/:id/submit', checkDbOnline, async (req, res) => {
  const quizId = req.params.id;
  const { username, answers } = req.body;

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required.' });
  }

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Invalid answers format.' });
  }

  try {
    const [questions] = await dbPool.query(
      'SELECT id, correct_option FROM questions WHERE quiz_id = ?',
      [quizId]
    );

    if (questions.length === 0) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    let score = 0;
    const totalQuestions = questions.length;
    const results = {};

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      const correctAnswer = q.correct_option;
      results[q.id] = correctAnswer; // Returned to highlight results on frontend

      if (userAnswer && userAnswer.toUpperCase() === correctAnswer.toUpperCase()) {
        score++;
      }
    });

    await dbPool.query(
      'INSERT INTO scores (username, quiz_id, score, total_questions) VALUES (?, ?, ?, ?)',
      [username.trim(), quizId, score, totalQuestions]
    );

    res.json({
      score,
      totalQuestions,
      correctAnswers: results,
    });
  } catch (error) {
    console.error('Error grading quiz:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get top 10 scores
app.get('/api/leaderboard', checkDbOnline, async (req, res) => {
  try {
    const [rows] = await dbPool.query(
      `SELECT s.id, s.username, s.score, s.total_questions, s.created_at, q.title AS quiz_title 
       FROM scores s 
       JOIN quizzes q ON s.quiz_id = q.id 
       ORDER BY s.score DESC, s.created_at DESC 
       LIMIT 10`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Catch-all route to serve index.html for unknown frontend routes
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
