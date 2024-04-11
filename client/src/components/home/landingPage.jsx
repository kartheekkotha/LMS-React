import { Link } from "react-router-dom";
import "./landingPage.css";

const LandingPage = () => {
  return (
    <div className="container">
      <header>
        {/* Blank header */}
        <div style={{ height: "100px" }}></div>
      </header>
      <div className="home-body">
        <h1 className="display-4" style={{ fontWeight: "bold" }}>
          Welcome to our Laundry Service!
        </h1>
        <p className="lead">
          We provide easy access to laundry management on campus. Made by the
          students. For the students.
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
          <Link to="/register">
            <button className="btn btn-register" style={{ margin: 20 }}>
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
