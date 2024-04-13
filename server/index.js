const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const app = express();
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  connection.connect((err) => {
    if (err) {
      res.send('Error connecting to MySQL database:', err);
      return;
    }
    res.send('Welcome to API Connected to MySQL database');
  });
});

app.listen(4000, () => {
    console.log("Server is running on port 4000");
});

const connection = mysql.createConnection({  
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


app.post("/login", (req, res) => {
  console.log("Login request received");
  const { email, password, role } = req.body;

  // Query the database to fetch user details
  const query = `SELECT * FROM Student WHERE Email = ? AND Password_Hash = ?`;
  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ success: false, message: 'An error occurred' });
      return;
    }

    if (results.length === 0) {
      // If user not found or password does not match, send an error response
      res.status(401).json({ success: false, message: 'Incorrect email or password' });
      return;
    }

    const user = results[0];

    // If login successful, return user details and role
    res.json({ success: true, role: user.role });
  });
});
