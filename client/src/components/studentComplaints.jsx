import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Dropdown } from 'react-bootstrap';
import "./adminAnnouncements.css";

const Complaints = ({ isLoggedIn, userId, userRole }) => {
  const [complaints, setComplaints] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // Default to descending order
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
    let sortedItems = complaints;

    // Sort items based on sortOrder
    sortedItems.sort((a, b) => {
      const dateA = new Date(a.Date);
      const dateB = new Date(b.Date);
      if (sortOrder === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

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
            Posted on {formatDateTime(item.Date)}
          </Card.Footer>
        </Card>
      </ListGroup.Item>
    ));
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderDateFilterDropdown = () => {
    const uniqueDates = [...new Set(complaints.map((item) => item.Date))];

    return (
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-custom">
          {selectedDate ? `Filtering by ${selectedDate}` : 'Filter by Date'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={toggleSortOrder}>
            Sort by Date ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
          </Dropdown.Item>
          {uniqueDates.map((date, index) => (
            <Dropdown.Item key={index} onClick={() => setSelectedDate(date)}>
              {date}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
    return dateTime.toLocaleString('en-US', options);
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
