const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/" , (req, res) => {
    res.send("Server is running");
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}, (err) => {
  if (err) {
      console.error('Error connecting to the database:', err);
  } else {
      console.log('Connected to the database successfully');
  }
});


app.post("/register", async (req, res) => {
    const { collegeId, email, password, phoneNo } = req.body;
  
    // Check if the email already exists in the database
    pool.query(
      "SELECT * FROM login WHERE Email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Error querying database:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }
  
        // If the email already exists, return an error
        if (results.length > 0) {
          return res.status(400).json({ message: "Email already exists" });
        }
  
        try {
          // Hash the password using bcrypt
          const hashedPassword = await bcrypt.hash(password, 10);
  
          // Insert the user into the database
          pool.query(
            "INSERT INTO login (CollegeID, Password, Email, PhoneNo) VALUES (?, ?, ?, ?)",
            [collegeId, hashedPassword, email, phoneNo],
            (insertError) => {
              if (insertError) {
                console.error("Error registering user:", insertError);
                return res.status(500).json({ message: "Internal Server Error" });
              }
  
              return res.status(201).json({ message: "Registration successful" });
            }
          );
        } catch (hashError) {
          console.error("Error hashing password:", hashError);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      }
    );
  });
  
  
  app.post("/login", (req, res) => {
    const { email, password } = req.body;
  
    // Retrieve user data from the database
    pool.query(
      "SELECT * FROM login WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).json({ message: "Internal Server Error" });
          return;
        }
  
        // Check if a user with the given email exists
        if (results.length > 0) {
          const storedPassword = results[0].Password; // Assuming Password is the column name for the hashed password
  
          // Compare the provided password with the stored hashed password
          const passwordsMatch = await bcrypt.compare(password, storedPassword);
  
          if (passwordsMatch) {
            const user_id = results[0].CollegeID; // Assuming CollegeID is the column name for the user_id
            res.status(200).json({ message: "Login successful", user_id });
          } else {
            res.status(401).json({ message: "Invalid password" });
          }
        } else {
          res.status(401).json({ message: "Invalid email" });
        }
      }
    );
  });
  
  