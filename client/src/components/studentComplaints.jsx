import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Dropdown } from 'react-bootstrap';
import "./adminAnnouncements.css";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    // Fetch data from the server when the component mounts
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:3001/getComplaints');
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

  const allItems = complaints;
  const sortedItems = allItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  const renderItems = () => {
    const filteredItems =
      selectedDate === ''
        ? sortedItems
        : sortedItems.filter((item) => item.date === selectedDate);

    return filteredItems.map((item, index) => (
      <ListGroup.Item key={index} className="complaint-item">
        <Card>
          <Card.Body>
            <Card.Title>
              {item.email} (ID: {item.complaint_id})
            </Card.Title>
            <Card.Text>{item.description}</Card.Text>
          </Card.Body>
          <Card.Footer className="text-muted">
            Posted on {item.date}
          </Card.Footer>
        </Card>
      </ListGroup.Item>
    ));
  };

  const handleDateFilter = (date) => {
    setSelectedDate(date);
  };

  const renderDateFilterDropdown = () => {
    const uniqueDates = [...new Set(allItems.map((item) => item.date))];

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
