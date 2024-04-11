import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./loginPage.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role is student

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        console.log("Login successful");

        // Show a success notification
        toast.success("Login successful");

        // Redirect user based on role
        if (role === "student") {
          // Redirect to student dashboard
          window.location.href = "/studentPortal";
        } else if (role === "staff") {
          // Redirect to staff dashboard
          window.location.href = "/adminPage";
        }
      } else {
        console.error("Login failed");

        // Show an error notification
        toast.error("Login failed");

        // Handle failed login, e.g., show an error message to the user
      }
    } catch (error) {
      console.error("Error during login:", error);

      // Show a network error notification
      toast.error("Network error during login");

      // Handle network errors or other issues
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
        
        <button type="button" className="btn btn-login" onClick={handleLogin}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
