import React from "react";
import { Link } from "react-router-dom";
import "./landingPage.css";

const LandingPage = ({ isLoggedIn, userId , userRole}) => {
  const getUsername = (email) => {
    const username = email.split("@")[0];
    return username;
  };

  return (
    <div className="container">
      <header>
        {/* Blank header */}
        <div style={{ height: "100px" }}></div>
      </header>
      <div className="home-body">
        {isLoggedIn ? (
          <>
            <h1 className="display-4" style={{ fontWeight: "bold" }}>
              Welcome, {getUsername(userId)}!
            </h1>
            <p className="lead">
              You are now logged in. Click on the links above to access the
              services.Happy Laundry!
            </p>
            {/* Additional content for logged-in users */}
          </>
        ) : (
          <>
            <h1 className="display-4" style={{ fontWeight: "bold" }}>
              Welcome to SNIoE Laundry Service!
            </h1>
            <p className="lead">
              We provide easy access to laundry management on campus. Made by
              the students.
             <br></br>
              For the better laundry experience, please sign in.
            </p>
            <div>
              <Link to="/login">
                <button
                  className="btn btn-signin mr-2"
                  style={{ marginLeft: "270px" }}
                >
                  Sign In
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
