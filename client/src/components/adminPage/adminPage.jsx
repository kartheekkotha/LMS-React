import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./adminPage.css"

const AdminPortal = ({ isLoggedIn, userId , userRole}) => {
  const backendURL = process.env.REACT_APP_BACKEND_URL || "https://lms-react-server.vercel.app";
  const [hostels, setHostels] = useState([]);
  const [laundryData, setLaundryData] = useState([]);
  const [filterHostel, setFilterHostel] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState(''); // 'hostel', 'date', 'status'
  const [sortOrder, setSortOrder] = useState(''); // 'asc', 'desc'
  const [messageHostel, setMessageHostel] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  
 
  
    useEffect(() => {
      if (isLoggedIn && userRole === 'staff') {
        fetchLaundryData();
        fetchHostels();
      }
    }, [isLoggedIn, userRole]);
  
    const fetchLaundryData = async () => {
      try {
        const response = await fetch(`${backendURL}/getLaundryData`);
        if (!response.ok) {
          throw new Error('Failed to fetch laundry data');
        }
        const data = await response.json();
        console.log(data);
        setLaundryData(data);
      } catch (error) {
        console.error('Error fetching laundry data:', error.message);
        toast.error('Error fetching laundry data');
      }
    };
  
    // const [laundryData, setLaundryData] = useState([
    //   {
    //     hostelName: "Hostel 2B",
    //     dateReceived: "2023-11-09",
    //     student: "ab123",
    //     clothesReceived: 15,
    //     status: "Washing",
    //     returnDate: "2023-18-09",
    //     submissions: [
    //       {
    //         name: "John Doe",
    //         email: "ab123",
    //         hostel: "2B",
    //         room: "502",
    //         phone: "123-456-7890",
    //         note: "winter clotes to be washed carefully"
    //       },
          
    //     ],
    //   },
    //   {
    //     hostelName: "Hostel B",
    //     dateReceived: "2023-11-09",
    //     student: "ty491",
    //     clothesReceived: 20,
    //     status: "Washing",
    //     returnDate: "2023-18-09",
    //     submissions: [
    //       {
    //         name: "John Doe",
    //         email: "ty491",
    //         hostel: "B",
    //         room: "502",
    //         phone: "123-456-7890",
    //         note: "winter clotes to be washed carefully"
    //       },
    //       // Add more submissions as needed
    //     ],
    //   },
    //   // Add more data as needed
    // ]);

    const fetchHostels = async () => {
      try {
        const response = await fetch(`${backendURL}/getHostels`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Hostels:", data);
        setHostels(data);
      } catch (error) {
        console.error("Error fetching hostels:", error);
        toast.error("Error fetching hostels", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            fontSize: "18px",
            padding: "20px",
          },
        });
      }
     };
  
    const handleEditStatus = async (index, newStatus) => {
      try {
        const updatedLaundryData = [...laundryData];
        updatedLaundryData[index].status = newStatus;
  
        const response = await fetch(`${backendURL}/updateLaundryStatus`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bagId: updatedLaundryData[index].bag_id,
            status: newStatus,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update laundry status');
        }
  
        setLaundryData(updatedLaundryData);
        toast.success(`Status updated for ${updatedLaundryData[index].hostelName}`);
      } catch (error) {
        console.error('Error updating status:', error.message);
        toast.error('Error updating status');
      }
    };
  
    const handleSendMessage = async () => {
      if (!messageHostel || !adminMessage) {
        toast.error('Please select a hostel and enter a message!');
        return;
      }
  
      try {
        await fetch(`${backendURL}/sendMessageToHostel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hostelName: messageHostel,
            message: adminMessage,
            adminEmail: userId,
          }),
        });
  
        toast.success(`Message sent to ${messageHostel}: ${adminMessage}`);
        setMessageHostel('');
        setAdminMessage('');
      } catch (error) {
        console.error('Error sending message:', error.message);
        toast.error('Error sending message');
      }
    };
  
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };



const renderLaundryTable = () => {
  // Apply filters to the data
  let filteredData = [...laundryData];

  if (filterHostel) {
    filteredData = filteredData.filter(
      (entry) => entry.Assigned_Hostel_ID === filterHostel
    );
  }

  if (filterDate) {
    // Convert filterDate and entry.Received_Date to the same format before comparison
    filteredData = filteredData.filter(
      (entry) => formatDate(entry.Received_Date) === filterDate
    );
  }

  if (filterStatus) {
    filteredData = filteredData.filter(
      (entry) => entry.Edit_Status === filterStatus
    );
  }

  // Apply sorting
  if (sortBy && sortOrder) {
    filteredData = filteredData.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      if (sortOrder === "asc") {
        return valueA.localeCompare(valueB, undefined, { numeric: true });
      } else {
        return valueB.localeCompare(valueA, undefined, { numeric: true });
      }
    });
  }

  return (
    <div className="row mt-3">
      <div className="col-md-9">
        <h3>Laundry Information</h3>
        {renderFiltersAndSort()}
        <table className="table mt-4">
          <thead>
            <tr>
              <th>Hostel Name</th>
              <th>Date Received</th>
              <th>Student</th>
              <th>Clothes Received</th>
              <th>Status</th>
              <th>Edit Status</th>
              <th>Return Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.Assigned_Hostel_ID}</td>
                <td>{formatDate(entry.Received_Date)}</td>
                <td
                  onClick={() => handleViewDetails(entry, index)}
                  style={{ cursor: "pointer", color: "#2026d2" }}
                >
                  {entry.studentEmail}
                </td>
                <td>{entry.Clothes_Given}</td>
                <td style={{ backgroundColor: getStatusColor(entry.status) }}>
                  {entry.Edit_Status}
                </td>
                <td>
                  <div className="input-group">
                    <select
                      className="form-select"
                      onChange={(e) =>
                        handleEditStatus(index, e.target.value)
                      }
                      value={entry.status}
                    >
                      <option value="Received">Received</option>
                      <option value="Washing">Washing</option>
                      <option value="Drying">Drying</option>
                      <option value="Ready to Collect">Ready to Collect</option>
                    </select>
                  </div>
                </td>
                <td>{entry.returnDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-md-3">
        {/* Message Box */}
        <div className="card">
          <div className="card-body">
            <h4>Send Message to Hostel</h4>
            <div className="form-group">
              <label htmlFor="messageHostel">Hostel:</label>
              <select
                className="form-control"
                id="messageHostel"
                onChange={(e) => setMessageHostel(e.target.value)}
                value={messageHostel}
              >
                <option value="">Select Hostel</option>
                {/* Use the hostels data fetched from the backend */}
                {hostels.map((hostel, index) => (
                  <option key={index} value={hostel.Hostel_ID}>
                    {hostel.Hostel_Name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="adminMessage">Message:</label>
              <textarea
                className="form-control"
                id="adminMessage"
                rows="3"
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
              ></textarea>
            </div>
            <button className="btn btn-send" onClick={handleSendMessage}>
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Adjust the function that renders the filter and sort options
const renderFiltersAndSort = () => (
  <div className="mb-3 d-flex justify-content-between align-items-center">
    <div className="d-flex">
      <label className="mx-2 mt-3">Filter by:</label>
      <select
        className="form-select"
        onChange={(e) => setFilterHostel(e.target.value)}
        value={filterHostel}
      >
        <option value="">All Hostels</option>
        {/* Add hostel options dynamically based on available hostels */}
        {Array.from(
          new Set(laundryData.map((entry) => entry.Assigned_Hostel_ID))
        ).map((hostel, index) => (
          <option key={index} value={hostel}>
            {hostel}
          </option>
        ))}
      </select>

      <label className="mx-2 mt-3"></label>
      <select
        className="form-select"
        onChange={(e) => setFilterDate(e.target.value)}
        value={filterDate}
      >
        <option value="">All Dates</option>
        {/* Add date options dynamically based on available dates */}
        {Array.from(
          new Set(laundryData.map((entry) => formatDate(entry.Received_Date)))
        ).map((date, index) => (
          <option key={index} value={date}>
            {date}
          </option>
        ))}
      </select>

      <label className="mx-2 mt-3"></label>
      <select
        className="form-select"
        onChange={(e) => setFilterStatus(e.target.value)}
        value={filterStatus}
      >
        <option value="">All Statuses</option>
        {/* Add status options dynamically based on available statuses */}
        {Array.from(
          new Set(laundryData.map((entry) => entry.Edit_Status))
        ).map((status, index) => (
          <option key={index} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>

    <div className="d-flex">
      <label className="mx-2">Sort By:</label>
      <select
        className="form-select"
        onChange={(e) => setSortBy(e.target.value)}
        value={sortBy}
      >
        <option value="">None</option>
        <option value="Assigned_Hostel_ID">Hostel</option>
        <option value="Received_Date">Date</option>
        <option value="Edit_Status">Status</option>
      </select>

      <label className="mx-2 mt-3">Order:</label>
      <select
        className="form-select"
        onChange={(e) => setSortOrder(e.target.value)}
        value={sortOrder}
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  </div>
);



  const getStatusColor = (status) => {
    switch (status) {
      case "Received":
        return "#97b9fc";
      case "Washing":
        return "lightorange";
      case "Drying":
        return "lightyellow";
      case "Ready to Collect":
        return "lightgreen";
      default:
        return "white";
    }
  };

  const handleSort = (field) => {
    // Sort by the specified field
    if (field === sortBy) {
      // If already sorting by this field, toggle the sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If sorting by a new field, set the sort field and order
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleViewDetails = async (entry, index) => {
    const studentEmail = entry.studentEmail; // Get the student email from the clicked entry
  
    try {
      // Fetch student details from the backend using the student email
      const response = await fetch(`${backendURL}/getStudentDetailsByEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: studentEmail }),
      });
  
      if (response.ok) {
        const { studentDetails } = await response.json();
        // Render student details in a table
        const details = (
          <tr>
            <td>{studentDetails.Name}</td>
            <td>{studentDetails.Email}</td>
            <td>{studentDetails.Hostel_Name}</td>
            <td>{studentDetails.Room_No}</td>
            <td>{studentDetails.Phone_No}</td>
            <td>{studentDetails.Student_Message}</td>
          </tr>
        );
        console.log("student details: ",details);
        // Show details in a new table
        toast.info(
          <div>
            <h3 className="toast-title">Student Details</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Hostel</th>
                  <th>Room</th>
                  <th>Phone</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>{details}</tbody>
            </table>
          </div>,
          {
            position: "top-left",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {
              marginTop: "100px",
              marginLeft: "300px",
              fontSize: "18px",
              padding: "10px",
              height: "400px",
              width: "1000px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              borderRadius: "5px",
            },
          }
        );
      } else {
        throw new Error("Failed to fetch student details");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error(
        "Error fetching student details. Please try again later.",
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            fontSize: "18px",
            padding: "20px",
          },
        }
      );
    }
  };
  

  return (
    <div>
      <header>
        {/* Blank header */}
        <div style={{ height: "50px" }}></div>
      </header>
      <div className="container mt-5 mb-5">
        <div className="row">
          <div className="col-md-12">
            <div className="col-md-12">{renderLaundryTable()}</div>
          </div>
        </div>
        {/* ToastContainer for notifications */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default AdminPortal;