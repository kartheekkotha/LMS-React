/* eslint-disable no-undef */
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();
const port = 5330;

app.use(cors());
app.use(bodyParser.json());

app.use("/" , (req , res) => {
  res.send("Hello World, server is running");
});
// Create a connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "logi3002",
  database: "laundry",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// server.js
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


// Endpoint to submit laundry
app.post('/submitLaundry', (req, res) => {
  const { givenClothes, studentEmail } = req.body;

  // Check if the number of clothes is greater than 0 and student email is not empty
  if (givenClothes <= 0 || !studentEmail.trim()) {
    res.status(400).json({ error: 'Invalid input. Please provide valid clothes count and student email.' });
    return;
  }

  // Simulate saving the laundry submission to the database
  const submissionDate = new Date().toLocaleDateString();
  const laundryStatus = {
    submission_date: submissionDate,
    given_clothes: givenClothes,
    status: 'Received bag',
    studentEmail: studentEmail,
  };

  // Assuming you have a table named 'laundry_submission'
  pool.execute(
    'INSERT INTO laundry_submission (submission_date, given_clothes, status, studentEmail) VALUES (?, ?, ?, ?)',
    [submissionDate, givenClothes, 'Received bag', studentEmail],
    (err, results) => {
      if (err) {
        console.error('Error inserting into database:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const insertedId = results.insertId;
        res.status(200).json({ message: 'Laundry submitted successfully', laundryStatus: { id: insertedId, ...laundryStatus } });
      }
    }
  );
});

app.get('/getLaundryHistory', async (req, res) => {
  const { studentEmail } = req.query;

  try {
    const connection = await pool.getConnection();

    // Fetch laundry history based on the student email
    const [rows] = await connection.execute(
      'SELECT * FROM laundry_submission WHERE studentEmail = ?',
      [studentEmail]
    );

    connection.release();

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching laundry history:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post("/submitComplaint", (req, res) => {
  const { complaintText, studentEmail } = req.body;

  if (!complaintText || !studentEmail) {
    return res.status(400).json({ message: 'Invalid request. Missing data.' });
  }

  // Simulating submission of complaint
  const complaintDate = new Date().toLocaleDateString();
  const newComplaint = {
    complaintText,
    complaintDate,
    studentEmail,
  };

  // Store complaint in the database
  pool.query(
    'INSERT INTO student_complaint (description, date, email) VALUES (?, ?, ?)',
    [complaintText, complaintDate, studentEmail],
    (error, results) => {
      if (error) {
        console.error('Error during complaint submission:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      res.status(200).json({ message: 'Complaint submitted successfully', complaint: newComplaint });
    }
  );
});

// Endpoint to get complaints
app.get('/getComplaints', (req, res) => {
  // Use the pool to get a connection
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const query = 'SELECT * FROM student_complaint';

    // Execute the query
    connection.query(query, (error, results) => {
      // Release the connection back to the pool
      connection.release();

      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      // Send the results as JSON
      res.json(results);
    });
  });
});


// Endpoint for posting a lost or found item
app.post('/postLostItem', (req, res) => {
  const { type, description, image, email } = req.body;
  const date = new Date().toLocaleString();
  console.log("The server is running fine, as of now");
  const sql = 'INSERT INTO LostAndFound (Date, LostFoundTag, Description, Image, Email) VALUES (?, ?, ?, ?, ?)';
  pool.query(sql, [date, type, description, image, email], (err, result) => {
    if (err) {
      console.error('Error posting item:', err);
      res.status(500).send('Internal Server Error');
    } else {
      const newItem = { ID: result.insertId, Date: date, LostFoundTag: type, Description: description, Image: image, Email: email };
      res.status(201).json(newItem);
    }
  });
});

// Endpoint for posting a lost or found item
app.post('/postFoundItem', (req, res) => {
  const { type, description, image, email } = req.body;
  const date = new Date().toLocaleString();

  const sql = 'INSERT INTO LostAndFound (Date, LostFoundTag, Description, Image, Email) VALUES (?, ?, ?, ?, ?)';
  pool.query(sql, [date, type, description, image, email], (err, result) => {
    if (err) {
      console.error('Error posting item:', err);
      res.status(500).send('Internal Server Error');
    } else {
      const newItem = { ID: result.insertId, Date: date, LostFoundTag: type, Description: description, Image: image, Email: email };
      res.status(201).json(newItem);
    }
  });
});

// Endpoint for fetching lost items
app.get('/getLostItems', (req, res) => {
  const sql = 'SELECT * FROM LostAndFound WHERE LostFoundTag = "lost" ORDER BY date desc';
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching lost items:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results);
    }
  });
});

// Endpoint for fetching found items
app.get('/getFoundItems', (req, res) => {
  const sql = 'SELECT * FROM LostAndFound WHERE LostFoundTag = "found" ORDER BY date desc';
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching found items:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results);
    }
  });
});

app.post("/postLaundryInfo", (req, res) => {
  const { hostelName, dateReceived, bagsReceived, status, submissions } =
    req.body;

  pool.query(
    "INSERT INTO laundry_info (hostelName, dateReceived, bagsReceived, status) VALUES (?, ?, ?, ?)",
    [hostelName, dateReceived, bagsReceived, status],
    (error, result) => {
      if (error) {
        console.error("Error posting laundry info:", error);
        res.status(500).json({ message: "Internal Server Error" });
      } else {
        const laundryInfoId = result.insertId;

        // Insert laundry submissions
        submissions.forEach((submission) => {
          pool.query(
            "INSERT INTO laundry_submissions (laundryInfoId, name, email, phoneNumber, clothesCount) VALUES (?, ?, ?, ?, ?)",
            [
              laundryInfoId,
              submission.name,
              submission.email,
              submission.phoneNumber,
              submission.clothesCount,
            ],
            (submissionError) => {
              if (submissionError) {
                console.error(
                  "Error posting laundry submission:",
                  submissionError
                );
                res.status(500).json({ message: "Internal Server Error" });
              }
            }
          );
        });

        res
          .status(201)
          .json({ message: "Laundry information posted successfully" });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
