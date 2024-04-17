import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Dropdown } from 'react-bootstrap';
import "./adminAnnouncements.css";

const Complaints = ({ isLoggedIn, userId, userRole }) => {
  const [complaints, setComplaints] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const backendURL = process.env.REACT_APP_BACKEND_URL || "https://lms-react-server.vercel.app";

  useEffect(() => {
    // Fetch data from the server when the component mounts
    if (isLoggedIn && userRole === 'staff') {
      fetchComplaints();
    }
  }, [isLoggedIn, userRole]);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${backendURL}/getComplaints`);
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      } else {
        throw new Error('Failed to fetch complaints');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error.message);
    }
  };

  const renderItems = () => {
    const sortedItems = complaints.sort((a, b) => new Date(b.Date) - new Date(a.Date));

    const filteredItems =
      selectedDate === ''
        ? sortedItems
        : sortedItems.filter((item) => item.Date === selectedDate);

    return filteredItems.map((item, index) => (
      <ListGroup.Item key={index} className="complaint-item">
        <Card>
          <Card.Body>
            <Card.Title>
              {item.Roll_No} (Complaint ID: {item.Complaint_ID})
            </Card.Title>
            <Card.Text>{item.Description}</Card.Text>
          </Card.Body>
          <Card.Footer className="text-muted">
            Posted on {item.Date}
          </Card.Footer>
        </Card>
      </ListGroup.Item>
    ));
  };

  const handleDateFilter = (date) => {
    setSelectedDate(date);
  };

  const renderDateFilterDropdown = () => {
    const uniqueDates = [...new Set(complaints.map((item) => item.Date))];

    return (
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-custom">
          {selectedDate ? `Filtering by ${selectedDate}` : 'Filter by Date'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {uniqueDates.map((date, index) => (
            <Dropdown.Item key={index} onClick={() => handleDateFilter(date)}>
              {date}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  if (!isLoggedIn) {
    return <div>Please log in to view complaints.</div>;
  }

  if (userRole !== 'staff') {
    return <div>You don't have permission to view complaints.</div>;
  }

  return (
    <div>
      <header>
        {/* Blank header */}
        <div style={{ height: '50px' }}></div>
      </header>

      {/* Display complaints sorted by most recent with date filtering */}
      <div className="container mt-5">
        <h2>Student Complaints</h2>
        {renderDateFilterDropdown()}
        <ListGroup>{renderItems()}</ListGroup>
      </div>
    </div>
  );
};

export default Complaints;
