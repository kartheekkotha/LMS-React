const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/" , (req, res) => {
    res.send("Server is running");
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});

// Endpoint for posting a lost or found item
app.post('/postLostItem', (req, res) => {
    const { type, description, image, email } = req.body;
    console.log(req.body)
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