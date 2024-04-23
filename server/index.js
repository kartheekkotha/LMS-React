const express = require('express');
const cors = require("cors");
const { google } = require('googleapis');
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const multer = require('multer');
const app = express();
const path = require('path'); // Import path module
const moment = require('moment'); // Import moment.js library

app.use(express.json());

require('dotenv').config();

const backendBaseURL = process.env.BACKEND_URL || "https://lms-react-server.vercel.app";
console.log('Backend base URL:', backendBaseURL);
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

app.post('/submitLaundry', (req, res) => {
  const { givenClothes, rollNo, assignedHostelId, message } = req.body;

  // Check if the number of clothes is greater than 0 and student email is not empty
  if (givenClothes <= 0 || !rollNo) {
    return res.status(400).json({ error: 'Invalid input. Please provide valid clothes count and student email.' });
  }

  // Getting the current date
  const laundryDate = new Date().toISOString().split('T')[0]; // Get the current date in 'YYYY-MM-DD' format
  const editStatus = 'Submitted'; // Initial status

  // Query to insert laundry instance into database
  const instanceInsertQuery = `
    INSERT INTO Laundry_Instance (Bag_ID, Clothes_Given, Received_Date, Assigned_Hostel_ID, Edit_Status, Student_Message) 
    VALUES (
      (SELECT Bag_ID FROM Laundry_Assignment WHERE Roll_No = ?), 
      ?, ?, ?, ?, ?
    )
  `;

  // Execute the instance insertion query
  connection.query(instanceInsertQuery, [rollNo, givenClothes, laundryDate, assignedHostelId, editStatus, message], (error, results) => {
    if (error) {
      console.error('Error submitting laundry:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }

    // Update laundry_status in Student table
    const updateStatusQuery = 'UPDATE Student SET laundry_status = true WHERE Roll_No = ?';

    // Execute the status update query
    connection.query(updateStatusQuery, [rollNo], (error, results) => {
      if (error) {
        console.error('Error updating laundry status:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
      }

      // Send success response
      return res.status(200).json({ success: true, message: 'Laundry submitted successfully' });
    });
  });
});



// Endpoint to submit a complaint
app.post("/submitComplaint", (req, res) => {
  const { complaintText, rollNo } = req.body;

  if (!complaintText || !rollNo) {
    return res.status(400).json({ message: 'Invalid request. Missing data.' });
  }

  // Simulating submission of complaint
  const complaintDate = new Date().toLocaleDateString();
  const formattedDate = moment(complaintDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
  const newComplaint = {
    complaintText,
    formattedDate,
    rollNo,
  };

  // Store complaint in the database
  connection.query(
    'INSERT INTO StudentComplaint (Description, Date, Roll_No) VALUES (?, ?, ?)',
    [complaintText, formattedDate, rollNo],
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
    const query = 'SELECT * FROM StudentComplaint';

    // Execute the query
    connection.query(query, (error, results) => {
      // Release the connection back to the connection pool
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      // Send the results as JSON
      res.json(results);
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

const credentials = require('./credentials/google.json');
const fs = require('fs');

const { client_email, private_key } = credentials;
const scopes = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.JWT(client_email, null, private_key, scopes);
const drive = google.drive({
  version: 'v3',
  auth: auth // This 'auth' variable should be defined in your code. It contains the authentication credentials for Google Drive API.
});
// Route for posting lost items with image upload
// ID of the folder in Google Drive where you want to upload files
const folderId = '1OVYVH13cOvF73dM2O0N-IvzYAMfiHbwp'; // Replace 'YOUR_FOLDER_ID' with the actual ID of your folder

// Route for posting lost items with image upload to Google Drive
app.post('/postLostItem', upload.single('image'), (req, res) => {
  const { date, description, phNo, hostelId, roomNo, email, rollNo } = req.body;
  const formattedDate = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');

  const fileMetadata = {
    name: req.file.filename,
    parents: [folderId] // Specify the folder ID as the parent
  };
  const media = {
    mimeType: req.file.mimetype,
    body: fs.createReadStream(req.file.path)
  };

  drive.files.create({
    resource: fileMetadata,
    fields: 'id, webViewLink'
  }, (err, response) => {
    if (err) {
      console.error('Error uploading image to Google Drive:', err);
      res.status(500).send('Internal Server Error while creating google image link');
      return;
    }

    // Get the file ID from the response
    const fileId = response.data.id;
    const webViewLink = `https://drive.google.com/file/d/${fileId}/preview`

    // Insert the image URL into your database or perform any necessary operations
    // For demonstration purposes, let's assume you're inserting it into a table named 'LostAndFound'
    const sql = 'INSERT INTO LostAndFound (Date, Description, Ph_No, Hostel_ID, Room_No, Lost_Found, Image_URL, Roll_No) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [formattedDate, description, phNo, hostelId, roomNo, 'Lost', webViewLink, rollNo], (err, result) => {
      if (err) {
        console.error('Error posting lost item:', err);
        res.status(500).send(`Internal Server Error but link of drive image is ${webViewLink}`);
      } else {
        res.status(201).json({ message: 'Lost item posted successfully' });
      }
    });
  });
});

// Endpoint to post a found item with image upload
app.post('/postFoundItem', upload.single('image'), (req, res) => {
  const { date, description, phNo, hostelId, roomNo, email, rollNo } = req.body;
  const formattedDate = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');
  const imageUrl = req.file.path; // Retrieve uploaded image path

  // Upload image to Google Drive
  const fileMetadata = {
    name: req.file.filename,
    parents: [folderId] // Specify the folder ID as the parent
  };
  const media = {
    mimeType: req.file.mimetype,
    body: fs.createReadStream(req.file.path)
  };

  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink'
  }, (err, response) => {
    if (err) {
      console.error('Error uploading image to Google Drive:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Get the file ID from the response
    const fileId = response.data.id;

    // Construct the image URL from the file ID
    const webViewLink = `https://drive.google.com/file/d/${fileId}/preview`

  const sql = 'INSERT INTO LostAndFound (Date, Description, Ph_No, Hostel_ID, Room_No, Lost_Found, Image_URL, Roll_No) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(sql, [formattedDate, description, phNo, hostelId, roomNo, 'Found', webViewLink, rollNo], (err, result) => {
    if (err) {
      console.error('Error posting lost item:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(201).json({ message: 'Lost item posted successfully' });
    }
  });
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
        Image_URL: `${item.Image_URL}` // Assuming the Image_URL is stored as it is in the database
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
      console.error('Error fetching lost items:', err);
      res.status(500).send('Internal Server Error');
    } else {
      // Modify the results to include full image URLs
      const itemsWithImageURLs = results.map(item => ({
        ...item,
        Image_URL: `${item.Image_URL}` // Assuming the Image_URL is stored as it is in the database
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



// Update Laundry Status
app.put('/updateLaundryStatusAndReturnDate', (req, res) => {
  const { instanceId, status } = req.body;
  let returnDate = null;

  // If status is "Ready to collect", set the return date to the current date
  if (status === 'Ready to Collect') {
    returnDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  }
  console.log(instanceId, status, returnDate)
  // Update Laundry_Instance table
  const updateQuery = `
    UPDATE Laundry_Instance
    SET Edit_Status = ?,
        Return_Date = ?
    WHERE Instance_ID = ?;
  `;

  connection.query(updateQuery, [status, returnDate, instanceId], (error, results) => {
    if (error) {
      console.error('Error updating laundry status and return date:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // If status is "Ready to collect", update laundry_status in Student table
    if (status === 'Ready to Collect') {
      const updateStudentQuery = `
        UPDATE Student
        SET laundry_status = FALSE
        WHERE Roll_No = (
          SELECT Roll_No
          FROM Laundry_Assignment
          WHERE Bag_ID = (
            SELECT Bag_ID
            FROM Laundry_Instance
            WHERE Instance_ID = ?
          )
        );
      `;

      connection.query(updateStudentQuery, [instanceId], (studentError, studentResults) => {
        if (studentError) {
          console.error('Error updating student laundry status:', studentError);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        
        res.status(200).json({ message: 'Laundry status and return date updated successfully' });
      });
    } else {
      res.status(200).json({ message: 'Laundry status and return date updated successfully' });
    }
  });
});

// Endpoint to send admin message
app.post('/sendMessageToHostel', (req, res) => {
  const { hostelName, message, adminEmail } = req.body;
  console.log(hostelName, message, adminEmail);   
      // Insert admin message into AdminMessage table
      const insertQuery = 'INSERT INTO AdminMessage (Date, Description, Hostel_ID, Admin_Email) VALUES (?, ?, ?, ?)';
      let formattedDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      connection.query(insertQuery, [formattedDate, message, hostelName, adminEmail], (error, results) => {
          if (error) {
            console.log("Ir is a error message")
              console.error('Error inserting admin message:', error);
              res.status(500).json({ error: 'Internal server error' });
              return;
          }
          res.status(200).json({ message: 'Admin message sent successfully' });
      });
  });

  
// Endpoint to get laundry history
app.get('/getLaundry/:rollNo', (req, res) => {
  const rollNo = req.params.rollNo;

  // Query to fetch laundry history for the student
  const laundryQuery = `
    SELECT li.Instance_ID, li.Received_Date, li.Clothes_Given, li.Return_Date, li.Edit_Status, s.Email AS studentEmail, h.Hostel_Name
    FROM Laundry_Instance li
    JOIN Laundry_Assignment la ON li.Bag_ID = la.Bag_ID
    JOIN Student s ON la.Roll_No = s.Roll_No
    JOIN Hostel h ON li.Assigned_Hostel_ID = h.Hostel_ID
    WHERE s.Roll_No = ?
    ORDER BY li.Received_Date DESC
  `;

  // Execute the laundry query
  connection.query(laundryQuery, [rollNo], (error, results) => {
    if (error) {
      console.error('Error fetching laundry history:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }

    // Send the laundry history as response
    return res.status(200).json({ success: true, laundryHistory: results });
  });
});


// Endpoint to fetch student details by email
app.get('/getStudentDetailsByEmail/:studentEmail/:laundryBagID/:instanceID', (req, res) => {
  const email = req.params.studentEmail;
  const bagID = req.params.laundryBagID;
  const instanceID = req.params.instanceID
  console.log("Requesting user details , " ,email , bagID, instanceID);
  const query = `
  SELECT 
  s.Roll_No, 
  s.Hostel_ID, 
  s.Room_No,
  s.Phone_No,
  s.Name,
  s.Email AS Student_Email,
  la.Bag_ID AS Laundry_Bag_ID,
  li.Instance_ID AS Instance_ID,
  li.Student_Message AS Laundry_Message,
  h.Hostel_Name
FROM 
  Student s
JOIN 
  Laundry_Assignment la ON s.Roll_No = la.Roll_No
JOIN 
  Laundry_Instance li ON la.Bag_ID = li.Bag_ID
JOIN 
  Hostel h ON li.Assigned_Hostel_ID = h.Hostel_ID
WHERE 
  s.Email = ? AND la.Bag_ID = ? AND li.Instance_ID = ?; 
  `;

  connection.query(query, [email,  bagID, instanceID], (error, results) => {
    if (error) {
      console.log("couldn't fetch")
      console.error('Error fetching student details:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.status(200).json(results[0]); // Assuming email is unique, so only one result is expected
  });
});

// Endpoint to fetch laundry data
app.get('/getLaundryData', (req, res) => {
  const query = `
    SELECT 
      li.*, 
      s.Email AS studentEmail
    FROM 
      Laundry_Instance li
    JOIN 
      Laundry_Assignment la ON li.Bag_ID = la.Bag_ID
    JOIN 
      Student s ON la.Roll_No = s.Roll_No
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching laundry data:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json(results);
  });
});

// Endpoint to fetch laundry data
// app.get('/getLaundryData', (req, res) => {
//   const query = 'SELECT * FROM Laundry_Instance';
//   connection.query(query, (error, results) => {
//       if (error) {
//           console.error('Error fetching laundry data:', error);
//           res.status(500).json({ error: 'Internal server error' });
//           return;
//       }

//       res.json(results);
//   });
// });

// Endpoint to fetch hostels
app.get('/getHostels', (req, res) => {
  const sql = 'SELECT * FROM Hostel';
  connection.query(sql, (error, results) => {
      if (error) {
          console.error('Error fetching hostels:', error);
          res.status(500).json({ error: 'Internal server error' });
          return;
      }
      res.json(results);
  });
});

app.get('/getMessagesForHostel/:hostelName', (req, res) => {
  const hostelName = req.params.hostelName;

  // Query the database for messages for the specified hostel
  const selectQuery = 'SELECT * FROM AdminMessage WHERE Hostel_ID = ?';

  connection.query(selectQuery, [hostelName], (error, results) => {
    if (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // Return the messages
    res.status(200).json(results);
  });
});