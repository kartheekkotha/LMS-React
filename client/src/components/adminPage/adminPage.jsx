import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./adminPage.css"

const AdminPortal = ({ isLoggedIn, userId , userRole}) => {
  const backendURL = process.env.REACT_APP_BACKEND_URL || "https://lms-react-server.vercel.app";
  const [hostels, setHostels] = useState([]);

  
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
  
  useEffect(() => {
    fetchHostels();
  }, []);
  const [laundryData, setLaundryData] = useState([
    {
      hostelName: "Hostel A",
      dateReceived: "2023-11-10",
      bagsReceived: 5,
      status: "Received",
      submissions: [
        {
          name: "John Doe",
          room: "502",
          phone: "123-456-7890",
          count: 10,
          note: "winter clotes to be washed carefully"
        },
        {
          name: "John Doe",
          room: "502",
          phone: "123-456-7890",
          count: 10,
          note: "winter clotes to be washed carefully"
        },
        {
          name: "John Doe",
          room: "502",
          phone: "123-456-7890",
          count: 10,
          note: "winter clotes to be washed carefully"
        },
        // Add more submissions as needed
      ],
    },
    {
      hostelName: "Hostel B",
      dateReceived: "2023-11-09",
      bagsReceived: 8,
      status: "Washing",
      submissions: [
        {
          name: "John Doe",
          room: "502",
          phone: "123-456-7890",
          count: 10,
          note: "winter clotes to be washed carefully"
        },
        // Add more submissions as needed
      ],
    },
    // Add more data as needed
  ]);

  const [filterHostel, setFilterHostel] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [sortBy, setSortBy] = useState(""); // 'hostel', 'date', 'status'
  const [sortOrder, setSortOrder] = useState(""); // 'asc', 'desc'

  const [messageHostel, setMessageHostel] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  const handleEditStatus = (index, newStatus) => {
    const updatedLaundryData = [...laundryData];
    updatedLaundryData[index].status = newStatus;
    setLaundryData(updatedLaundryData);
    toast.success(
      `Status updated for ${updatedLaundryData[index].hostelName}`,
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
  };

  const handleSendMessage = async () => {
    // Check if required fields are filled
    if (!messageHostel || !adminMessage) {
      toast.error("Please select a hostel and enter a message!", {
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
      return;
    }
  
    try {
      // Send request to backend
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
  
      // Show success message
      toast.success(`Message sent to ${messageHostel}: ${adminMessage}`, {
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
  
      // Clear message input fields after sending
      setMessageHostel("");
      setAdminMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Error sending message", {
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
            new Set(laundryData.map((entry) => entry.hostelName))
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
            new Set(laundryData.map((entry) => entry.dateReceived))
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
            new Set(laundryData.map((entry) => entry.status))
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
          onChange={(e) => handleSort(e.target.value)}
          value={sortBy}
        >
          <option value="">None</option>
          <option value="hostel">Hostel</option>
          <option value="date">Date</option>
          <option value="status">Status</option>
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

  const renderLaundryTable = () => {
    // Apply filters to the data
    let filteredData = [...laundryData];

    if (filterHostel) {
      filteredData = filteredData.filter(
        (entry) => entry.hostelName === filterHostel
      );
    }

    if (filterDate) {
      
      filteredData = filteredData.filter(
        (entry) => entry.dateReceived === filterDate
      );
    }

    if (filterStatus) {
      filteredData = filteredData.filter(
        (entry) => entry.status === filterStatus
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
          <h3>Laundry Information from Each Hostel</h3>
          {renderFiltersAndSort()}
          <table className="table mt-4">
            <thead>
              <tr>
                <th>Hostel Name</th>
                <th>Date Received</th>
                <th>Bags Received</th>
                <th>Status</th>
                <th>Edit Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.hostelName}</td>
                  <td>{entry.dateReceived}</td>
                  <td
                    onClick={() => handleViewDetails(index)}
                    style={{ cursor: "pointer", color: "#2026d2" }}
                  >
                    {entry.bagsReceived}
                  </td>
                  <td style={{ backgroundColor: getStatusColor(entry.status)}}>
                    {entry.status}
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
                        <option value="Ready to Collect">
                          Ready to Collect
                        </option>
                      </select>
                    </div>
                  </td>
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

  const handleViewDetails = (index) => {
    const hostelName = laundryData[index].hostelName;
    const details = laundryData[index].submissions.map((submission, idx) => (
      <tr key={idx}>
        <td>{submission.name}</td>
        <td>{submission.room}</td>
        <td>{submission.phone}</td>
        <td>{submission.count}</td>
        <td>{submission.note}</td>
      </tr>
    ));

    // Show details in a new table
    toast.info(
      <div>
        <h3 className="toast-title">Details for Submissions from {hostelName}</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Phone</th>
              <th>No. of Clothes</th>
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
          marginTop:"100px",
          marginLeft:"300px",
          fontSize: "15px",
          padding: "10px",
          height:"450px",
          width:"1000px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          borderRadius:"5px"
        },
      }
    );
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
