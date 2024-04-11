import { useState } from "react";
import { toast } from "react-toastify";
import "./registerPage.css";

const Register = () => {
  const [collegeId, setCollegeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNo, setphoneNo] = useState("");

  const handleRegister = () => {
    const userData = { collegeId, email, password, phoneNo };

    fetch("http://localhost:3001/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Registration failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Registration successful:", data);

        // Show a success notification
        toast.success("Registration successful");

        // Optionally, you can redirect the user or perform other actions upon successful registration
      })
      .catch((error) => {
        console.error("Registration error:", error.message);

        // Show an error notification
        toast.error("Registration failed");
      });
  };

  return (
    <div className="container mt-5">
      <header>
        {/* Blank header */}
        <div style={{ height: "50px" }}></div>
      </header>
      <h2>Register</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="collegeId" className="form-label">
            College ID
          </label>
          <input
            type="text"
            className="form-control"
            id="collegeId"
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            style={{ maxWidth: "200px" }}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
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
        <div className="mb-3">
          <label htmlFor="phoneNo" className="form-label">
            Phone Number
          </label>
          <input
            type="text"
            className="form-control"
            id="phoneNo"
            value={phoneNo}
            onChange={(e) => setphoneNo(e.target.value)}
            style={{ maxWidth: "200px" }}
          />
        </div>
        <button
          type="button"
          className="btn btn-reg"
          onClick={handleRegister}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
