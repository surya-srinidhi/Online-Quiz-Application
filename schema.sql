-- Create Database
CREATE DATABASE IF NOT EXISTS quiz_db;
USE quiz_db;

-- 1. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT
);

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option CHAR(1) NOT NULL, -- 'A', 'B', 'C', or 'D'
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 3. Scores Table (Leaderboard)
CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Insert Sample Quizzes
INSERT INTO quizzes (id, title, description) VALUES
(1, 'Web Development Basics', 'Test your knowledge on HTML, CSS, and basic web concepts.'),
(2, 'JavaScript Fundamentals', 'Challenge yourself with core JS concepts, loops, scoping, and arrays.'),
(3, 'Node.js & Express Starter', 'A beginner-friendly quiz covering server setups, middleware, and routes.');

-- Insert Sample Questions for Quiz 1: Web Development Basics
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(1, 'What does HTML stand for?', 'Hyper Text Preprocessor', 'Hyper Text Markup Language', 'Hyper Text Multiple Language', 'Hyper Tool Multi Language', 'B'),
(1, 'Which CSS property controls the text size?', 'font-style', 'text-size', 'font-size', 'text-style', 'C'),
(1, 'What is the correct HTML element for inserting a line break?', '<br>', '<lb>', '<break>', '<newline>', 'A'),
(1, 'How do you apply an external stylesheet in HTML?', '<style src="style.css">', '<link rel="stylesheet" href="style.css">', '<stylesheet href="style.css">', '<link src="style.css">', 'B'),
(1, 'Which tag is used to define an interactive button in an HTML form?', '<input type="button">', '<button>', '<input type="submit">', 'All of the above', 'D');

-- Insert Sample Questions for Quiz 2: JavaScript Fundamentals
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(2, 'Which of the following is NOT a JavaScript data type?', 'Undefined', 'Number', 'Float', 'Boolean', 'C'),
(2, 'How do you write "Hello World" in an alert box in JavaScript?', 'msgBox("Hello World");', 'alertBox("Hello World");', 'alert("Hello World");', 'console.log("Hello World");', 'C'),
(2, 'Which keyword is used to declare a block-scoped variable that can be reassigned?', 'var', 'let', 'const', 'set', 'B'),
(2, 'What will `typeof []` return in JavaScript?', '"array"', '"object"', '"null"', '"list"', 'B'),
(2, 'How do you write a comment in JavaScript code?', '// This is a comment', '/* This is a comment */', '# This is a comment', 'Both A and B', 'D');

-- Insert Sample Questions for Quiz 3: Node.js & Express Starter
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(3, 'Which of the following command installs Express in Node.js?', 'npm install express', 'node install express', 'npm express get', 'npx express install', 'A'),
(3, 'What is the default port of a Node.js process unless defined?', 'There is no default port, it must be specified', '3000', '8080', '5000', 'A'),
(3, 'What does Node.js use to manage package dependencies?', 'pip', 'npm', 'gradle', 'composer', 'B'),
(3, 'In Express, what is a function that has access to the request and response objects called?', 'Controller', 'Router', 'Middleware', 'Model', 'C'),
(3, 'Which Express method is used to serve static files like images, CSS, and JavaScript?', 'express.static()', 'express.serve()', 'express.public()', 'express.files()', 'A');
