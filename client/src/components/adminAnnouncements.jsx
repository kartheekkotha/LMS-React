import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Dropdown } from 'react-bootstrap';
import "./adminAnnouncements.css";

const Announcements = ({ isLoggedIn, userId, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // Default to descending order
  const [selectedDate, setSelectedDate] = useState('');
  const backendURL = process.env.REACT_APP_BACKEND_URL || "https://lms-react-server.vercel.app";

  useEffect(() => {
    // Fetch student details to get hostel ID
    fetchStudentDetails(userId);
  }, [userId]);

  const fetchStudentDetails = async (userId) => {
    try {
      const response = await fetch(`${backendURL}/getStudentDetails/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }
      const data = await response.json();
      const hostelId = data.Hostel_ID;
      // Fetch messages for the hostel using the hostel ID
      fetchMessages(hostelId);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const fetchMessages = async (hostelId) => {
    try {
      const response = await fetch(`${backendURL}/getMessagesForHostel/${hostelId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderMessages = () => {
    let sortedMessages = [...messages];

    // Sort messages based on sortOrder
    sortedMessages.sort((a, b) => {
      const dateA = new Date(a.Date);
      const dateB = new Date(b.Date);
      if (sortOrder === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    // Filter messages based on the selected date
    const filteredMessages = selectedDate
      ? sortedMessages.filter((message) => message.Date === selectedDate)
      : sortedMessages;

    return filteredMessages.map((message, index) => (
      <ListGroup.Item key={index}>
        <Card>
          <Card.Body>
            <Card.Title>{message.Description}</Card.Title>
            {/* Assuming 'Date' in the message object represents the announcement date */}
            <Card.Footer className="text-muted">{formatDateTime(message.Date)}</Card.Footer>
          </Card.Body>
        </Card>
      </ListGroup.Item>
    ));
  };

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return dateTime.toLocaleString('en-US', options);
  };

  const handleDateFilter = (date) => {
    setSelectedDate(date);
  };

  const renderDateFilterDropdown = () => {
    const uniqueDates = [...new Set(messages.map((message) => message.Date))];

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

      {/* Display messages sorted by most recent with date filtering */}
      <div className="container mt-5">
        <h2>Announcements from Admin</h2>
        {renderDateFilterDropdown()}
        <ListGroup>{renderMessages()}</ListGroup>
      </div>
    </div>
  );
};

export default Announcements;
