import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from "react";
import StudentPortal from "./components/studentPortal/studentPortal";
import Login from "./components/login/loginPage";
import NavigationBar from "./components/navBar/navigationBar";
import Register from "./components/register/registerPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminPortal from "./components/adminPage/adminPage";
import LostAndFound from "./components/lostFound/lostFound";
import LandingPage from "./components/home/landingPage";
import Announcements from "./components/adminAnnouncements";
import Complaints from "./components/studentComplaints";


const App = () =>{
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");


  const handleLogin = (userId , userRole) => {
    console.log("User ID:", userId);
    setIsLoggedIn(true);
    setUserId(userId);
    setUserRole(userRole);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId("");
    setUserRole("");
  };


 return (  
  <div>
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
      
<script>var Alert = ReactBootstrap.Alert;</script>
    <ToastContainer />
    <Router>
      <div>
        <NavigationBar 
          isLoggedIn={isLoggedIn}
          userId={userId}
          userRole={userRole}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/portal" element={<StudentPortal userId={userId}/>} />
          <Route path="/login" element={<Login  onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/lostfound" element={<LostAndFound />} />
          <Route path="/adminAnnouncements" element={<Announcements />} />
          <Route path="/studentComplaints" element={<Complaints />} />
        </Routes>
      </div>
    </Router>
  </div>
)};

export default App;
