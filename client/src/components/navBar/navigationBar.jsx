import React from "react";
import { Link } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown'; // Import Dropdown from react-bootstrap
import "./navigationBar.css";

const NavigationBar = ({ isLoggedIn, userId, userRole, onLogout }) => {
  // Function to get the username from the email
  const getUsername = (email) => {
    const username = email.split("@")[0];
    return username;
  };

  return (
    <div>
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-custom fixed-top"
        style={{ height: "80px" }}
      >
        <Link className="navbar-brand" to="/">
          <h1 style={{ fontSize: "20px", marginLeft: "25%", marginTop: "5px" }}>
            Laundry Management
          </h1>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          data-bs-toggle="collapse"
          aria-controls="navbarNav"
          aria-expanded="false"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse justify-content-between"
          id="navbarNav"
          style={{ marginLeft: "45%" }}
        >
          <ul className="navbar-nav me-auto" style={{ fontSize: "17px" }}>
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <>
                {userRole === "student" ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/portal">
                        Laundry
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/lostFound">
                        Lost & Found
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/adminAnnouncements">
                        Messages for Students
                      </Link>
                    </li>
                  </>
                ) : userRole === "staff" ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin">
                        Admin
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/lostFound">
                        Lost & Found
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/studentComplaints">
                        Messages for Admin
                      </Link>
                    </li>
                  </>
                ) : null}
              </>
            )}
          </ul>
          {isLoggedIn && (
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="userDropdown">
                Welcome, {getUsername(userId)}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </nav>
    </div>
  );
};

export default NavigationBar;
