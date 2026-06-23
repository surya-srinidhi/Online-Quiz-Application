# BrainQuiz 🧠

Welcome to **BrainQuiz**, a modern, responsive, and visually stunning Online Quiz Application. Test your skills, evaluate your learning step-by-step, and see your rank climb the live leaderboard!

Designed with a sleek **dark glassmorphic UI**, this project is an excellent full-stack application built for beginners using HTML, CSS, JavaScript, Node.js, Express, and MySQL.

---

## 🎬 Project Demo

Here is a full demonstration of the application in action:

![BrainQuiz Demo Flow](./demo.webp)

---

## ✨ Features

- **Glassmorphic UI Theme:** A curated HSL color palette featuring deep space-indigo gradients, backdrop blurring, glow effects, and smooth hover micro-animations.
- **Dynamic Quiz Selection:** Choose from multiple categories including Web Development, JavaScript, and Node.js.
- **Progress Tracking:** Interactive progress bars indicate exactly which question you are on.
- **Interactive Choice Picking:** Instant visual feedback (selected state) when picking answers.
- **Comprehensive Scorecards:** Shows correct answers highlighted in **green** and your incorrect choices highlighted in **red** after submission.
- **Live Leaderboard:** Saves scores automatically in a MySQL database and displays the top 10 players on the dashboard.
- **Developer Safety Fail-Safe:** If your database server is offline, the Node application starts up anyway and shows a friendly diagnostic alert banner to the user, instead of crashing the site.

---

## 🛠️ Technology Stack

- **Frontend:** Semantic HTML5, Vanilla CSS3 (Custom Variables, Flexbox/Grid), JavaScript (DOM manipulation, Fetch API)
- **Backend:** Node.js, Express.js
- **Database:** MySQL (Relational tables, database connections via `mysql2/promise` pool)
- **Environment Management:** `dotenv`

---

## 🚀 Setup & Installation

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and a local [MySQL Server](https://www.mysql.com/) installed on your machine.

### 2. Database Installation
Create the database and load the schema & sample questions by running the sql script in your MySQL terminal:

```bash
mysql -u root -p < schema.sql
```
*Enter your MySQL root password when prompted.*

### 3. Environment Configuration
Create or configure the `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=quiz_db
```

### 4. Running the Application
Install dependencies (if not already done):
```bash
npm install
```

Start the local server:
```bash
npm start
```

Access the application in your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

Enjoy playing and learning with **BrainQuiz**! 🎓
