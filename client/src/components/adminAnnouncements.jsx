import React, { useState } from 'react';
import { Card, ListGroup, Dropdown } from 'react-bootstrap';
import "./adminAnnouncements.css";

const Announcements = ({ isLoggedIn, userId , userRole}) => {
  const [messages, setMessages] = useState([
    {
      subject: 'Important Announcement',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      date: '2023-11-10',
    },
    {
      subject: 'Reminder for Upcoming Exam',
      content: 'Nullam ac urna eu felis dapibus condimentum sit amet a augue.',
      date: '2023-11-09',
    },
    // Add more messages as needed
  ]);

  const [selectedDate, setSelectedDate] = useState('');

  // Sort messages by date in descending order
  const sortedMessages = [...messages].sort((a, b) => new Date(b.date) - new Date(a.date));

  const renderMessages = () => {
    // Filter messages based on the selected date
    const filteredMessages = selectedDate
      ? sortedMessages.filter((message) => message.date === selectedDate)
      : sortedMessages;

    return filteredMessages.map((message, index) => (
      <ListGroup.Item key={index}>
        <Card>
          <Card.Body>
            <Card.Title>{message.subject}</Card.Title>
            <Card.Text>{message.content}</Card.Text>
          </Card.Body>
          <Card.Footer className="text-muted">{message.date}</Card.Footer>
        </Card>
      </ListGroup.Item>
    ));
  };

  const handleDateFilter = (date) => {
    setSelectedDate(date);
  };

  const renderDateFilterDropdown = () => {
    const uniqueDates = [...new Set(messages.map((message) => message.date))];

    return (
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-custom">
          {selectedDate ? `Filtering by ${selectedDate}` : 'Filter by Date'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => handleDateFilter('')}>
            Show All Dates
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
