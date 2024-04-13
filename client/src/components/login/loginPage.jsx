import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./loginPage.css";
import { Link } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role is student
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  const handleLogin = async () => {
    try {
      console.log(backendURL)
      const response = await fetch(`https://lms-one-rho.vercel.app/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });
      console.log("response", response);
  
      if (response.ok) {
        const data = await response.json();
        console.log("Login successful"  );
        toast.success("Login successful");
        onLogin(email, role);
        document.getElementById("homeLink").click(); 
      } else {
        console.error("Login failed");
  
        toast.error("Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Network error during login");
    }
  };

  return (
    <div className="container mt-5">
      <header>
        {/* Blank header */}
        <div style={{ height: "50px" }}></div>
      </header>
      <h2>Login</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="role" className="form-label">
            Role
          </label>
          <select
            className="form-select"
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="text"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ maxWidth: "200px" }}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ maxWidth: "200px" }}
          />
        </div>

        <button
          type="button"
          className="btn btn-login"
          onClick={handleLogin}
        >
          Login
        </button>
      </form>
      <Link to="/" style={{ display: "none" }} id="homeLink" />
    </div>
  );
};

export default Login;
