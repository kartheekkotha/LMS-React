const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const multer = require('multer');
const app = express();
const path = require('path'); // Import path module
const moment = require('moment'); // Import moment.js library


require('dotenv').config();

const backendBaseURL = process.env.BACKEND_URL || "https://lms-react-server.vercel.app";;
app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Endpoint to get student details
app.get('/getStudentDetails/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = 'SELECT * FROM Student WHERE Email = ?';
  connection.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching student details:', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (result.length > 0) {
        const student = result[0];
        res.status(200).json(student);
      } else {
        res.status(404).json({ message: 'Student not found' });
      }
    }
  });
});

app.post("/login", (req, res) => {
  console.log("Login request received");
  const { email, password, role } = req.body;
  // Query the database to fetch user details based on role
  let query = "";
  if (role === "student") {
    query = `SELECT * FROM Student WHERE Email = ? AND Password_Hash = ?`;
  } else if (role === "staff") {
    query = `SELECT * FROM Admin WHERE Email = ? AND Password_Hash = ?`;
  } else {
    res.status(400).json({ success: false, message: 'Invalid role' });
    return;
  }

  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ success: false, message: 'An error occurred' });
      return;
    }

    if (results.length === 0) {
      // If user not found or password is incorrect, send an error response
      res.status(401).json({ success: false, message: 'Incorrect email or password' });
      return;
    }

    // If login successful, return user details and role
    res.json({ success: true, role: role });
  });
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
  connection.execute(
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

// Endpoint to get laundry history
app.get('/getLaundryHistory', async (req, res) => {
  const { studentEmail } = req.query;

  try {
    const connection = await connection.getConnection();

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

// Endpoint to submit a complaint
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
  connection.query(
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
  // Use the connection to get a connection
  connection.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from connection:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const query = 'SELECT * FROM student_complaint';

    // Execute the query
    connection.query(query, (error, results) => {
      // Release the connection back to the connection
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

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for storing uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Generate unique filename
  }
});
const upload = multer({ storage: storage });

// Route for posting lost items with image upload
app.post('/postLostItem', upload.single('image'), (req, res) => {
  const { date, description, phNo, hostelId, roomNo, email , rollNo} = req.body;
  console.log(date)
  const imageUrl = req.file.path; // Retrieve uploaded image path
  const formattedDate = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');
  const sql = 'INSERT INTO LostAndFound (Date, Description, Ph_No, Hostel_ID, Room_No, Lost_Found, Image_URL, Roll_No) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(sql, [formattedDate, description, phNo, hostelId, roomNo, 'Lost', imageUrl, rollNo], (err, result) => {
    if (err) {
      console.error('Error posting lost item:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(201).json({ message: 'Lost item posted successfully' });
    }
  });
});

// Endpoint to post a found item with image upload
app.post('/postFoundItem', upload.single('image'), (req, res) => {
  console.log('Received file:', req.file);
  const { date, description, phNo, hostelId, roomNo, email, rollNo } = req.body;
  const formattedDate = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');
  const imageUrl = req.file.path; // Retrieve uploaded image path
  console.log('Image URL:', imageUrl);

  const sql = 'INSERT INTO LostAndFound (Date, Description, Ph_No, Hostel_ID, Room_No, Lost_Found, Image_URL, Roll_No) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(sql, [formattedDate, description, phNo, hostelId, roomNo, 'Found', imageUrl, rollNo], (err, result) => {
    if (err) {
      console.error('Error posting found item:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(201).json({ message: 'Found item posted successfully' });
    }
  });
});


// Endpoint for fetching lost items
app.get('/getLostItems', (req, res) => {
  const sql = 'SELECT Date, Description, Ph_No, Hostel_ID, Room_No, Lost_Found, Image_URL, Roll_No FROM LostAndFound WHERE Lost_Found = "Lost" ORDER BY Date DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching lost items:', err);
      res.status(500).send('Internal Server Error');
    } else {
      // Modify the results to include full image URLs
      const itemsWithImageURLs = results.map(item => ({
        ...item,
        Image_URL: `${backendBaseURL}/${item.Image_URL}` // Assuming backendBaseURL is the base URL of your server where images are stored
      }));
      res.json(itemsWithImageURLs);
    }
  });
});

// Endpoint for fetching found items
app.get('/getFoundItems', (req, res) => {
  const sql = 'SELECT Date, Description, Ph_No, Hostel_ID, Room_No, Lost_Found, Image_URL, Roll_No FROM LostAndFound WHERE Lost_Found = "Found" ORDER BY Date DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching found items:', err);
      res.status(500).send('Internal Server Error');
    } else {
      // Modify the results to include full image URLs
      const itemsWithImageURLs = results.map(item => ({
        ...item,
        Image_URL: `${backendBaseURL}/${item.Image_URL}` // Assuming backendBaseURL is the base URL of your server where images are stored
      }));
      res.json(itemsWithImageURLs);
    }
  });
});


// Endpoint to post laundry information
app.post("/postLaundryInfo", (req, res) => {
  const { hostelName, dateReceived, bagsReceived, status, submissions } = req.body;

  connection.query(
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
          connection.query(
            "INSERT INTO laundry_submissions (laundryInfoId, name, email, phoneNumber, clothesCount) VALUES (?, ?, ?, ?, ?)",
            [laundryInfoId, submission.name, submission.email, submission.phoneNumber, submission.clothesCount],
            (submissionError) => {
              if (submissionError) {
                console.error("Error posting laundry submission:", submissionError);
                res.status(500).json({ message: "Internal Server Error" });
              }
            }
          );
        });

        res.status(201).json({ message: "Laundry information posted successfully" });
      }
    }
  );
});