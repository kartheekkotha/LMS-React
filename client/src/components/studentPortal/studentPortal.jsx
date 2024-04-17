import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./studentPortal.css"

const StudentPortal = ({ isLoggedIn, userId , userRole}) => {
  const [clothesCount, setClothesCount] = useState(0);
  const [note, setnote] = useState("");
  const [laundryHistory, setLaundryHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [complaint, setComplaint] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  const handleClothesSubmit = async () => {
    if (clothesCount <= 0 || !studentEmail.trim()) {
      toast.error("Please enter a valid number of clothes and student email!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        style: {
          fontSize: "18px",
          padding: "20px",
        },
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/submitLaundry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ givenClothes: clothesCount, studentEmail }),
      });

      if (response.ok) {
        const result = await response.json();
        const newLaundryStatus = result.laundryStatus;
        setLaundryHistory([newLaundryStatus, ...laundryHistory]);

        setClothesCount(0);
        setStudentEmail("");

        toast.success("Your laundry has been submitted!", {
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
      } else {
        throw new Error("Failed to submit laundry. Please try again later.");
      }
    } catch (error) {
      console.error("Error during laundry submission:", error);
      toast.error("Error during laundry submission. Please try again later.", {
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


  const handleComplaintSubmit = async () => {
    if (complaint.trim() !== "") {
      try {
        const response = await fetch("http://localhost:4000/submitComplaint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ complaintText: complaint, studentEmail }),
        });

        if (response.ok) {
          // const result = await response.json();
          setComplaint("");
          setStudentEmail("");

          toast.info("Your complaint has been submitted!", {
            position: "top-center",
            autoClose: 1000,
            pauseOnFocusLoss: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            style: {
              fontSize: "18px",
              padding: "20px",
            },
          });
        } else {
          throw new Error("Failed to submit complaint. Please try again later.");
        }
      } catch (error) {
        console.error("Error during complaint submission:", error);
        toast.error("Error during complaint submission. Please try again later.", {
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
    } else {
      toast.error("Please enter a valid complaint!", {
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

  const handleRemoveEntry = async (index) => {
    const entryToRemove = laundryHistory[index];

    try {
      const response = await fetch("http://localhost:4000/removeLaundry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryToRemove),
      });

      if (response.ok) {
        const updatedHistory = [...laundryHistory];
        updatedHistory.splice(index, 1);
        setLaundryHistory(updatedHistory);

        toast.success("Laundry entry removed successfully!", {
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
      } else {
        throw new Error("Failed to remove laundry entry. Please try again later.");
      }
    } catch (error) {
      console.error("Error during removal of laundry entry:", error);
      toast.error("Error during removal of laundry entry. Please try again later.", {
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

  const handleFilterByDate = (date) => {
    setSelectedDate(date);
    const filtered = laundryHistory.filter(
      (entry) => entry.submission_date === date
    );
    setFilteredHistory(filtered);
  };

  const renderDateFilterDropdown = () => {
    const uniqueDates = [
      ...new Set(laundryHistory.map((entry) => entry.submission_date)),
    ];
    return (
      <div className="form-group">
        <label htmlFor="dateFilter">Filter by Date:</label>
        <select
          className="form-control"
          id="dateFilter"
          onChange={(e) => handleFilterByDate(e.target.value)}
          value={selectedDate}
        >
          <option value="">All Dates</option>
          {uniqueDates.map((date, index) => (
            <option key={index} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>
    );
  };

  
  const renderLaundryHistoryTable = () => {
    if (laundryHistory.length === 0) {
      return null;
    }
    const historyToDisplay = selectedDate ? filteredHistory : laundryHistory;
    return (
      <div className="container mt-3">
        <h3>Laundry Submission History</h3>
        {renderDateFilterDropdown()}
        <table className="table">
          <thead>
            <tr>
              <th>Date of Submission</th>
              <th>Number of Clothes</th>
              <th>Status</th>
              <th>Student Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {historyToDisplay.map((entry, index) => (
              <tr key={index}>
                <td>{entry.submission_date}</td>
                <td>{entry.given_clothes}</td>
                <td style={{ color: getStatusColor(entry.status) }}>
                  {entry.status}
                </td>
                <td>{entry.studentEmail}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveEntry(index)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "Received bag":
        return "blue";
      case "Washing clothes":
        return "green";
      case "Drying clothes":
        return "orange";
      case "Ready to collect":
        return "purple";
      default:
        return "black";
    }
  };

  return (
    <div>
      <header>
        <div style={{ height: "50px" }}></div>
      </header>
      <div className="container mt-5 mb-5">
        <div className="row">
          <div className="col-md-8">
            <h2>Give your Laundry!</h2>
            <div className="form-group">
              <label htmlFor="studentEmail">Student Email:</label>
              <input
                type="text"
                className="form-control"
                id="studentEmail"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                style={{ marginTop: 10, marginBottom: 10 }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="clothesCount">
                Number of Clothes to be Given:
              </label>
              <input
                type="number"
                className="form-control"
                id="clothesCount"
                value={clothesCount}
                onChange={(e) => setClothesCount(parseInt(e.target.value))}
                style={{ marginTop: 10, marginBottom: 10 }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="note">
                Note:
              </label>
              <input
                type="text"
                className="form-control"
                id="note"
                value={note}
                onChange={(e) => setnote((e.target.value))}
                style={{ marginTop: 10, marginBottom: 10 }}
              />
            </div>
            <button className="btn btn-sub" onClick={handleClothesSubmit}>
              Submit
            </button>
            {renderLaundryHistoryTable()}
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h4>Raise Complaint</h4>
                <div className="form-group">
                  <label htmlFor="complaint">Enter Your Complaint:</label>
                  <textarea
                    className="form-control"
                    id="complaint"
                    rows="3"
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    style={{ marginTop: 10, marginBottom: 10 }}
                  ></textarea>
                </div>
                <button
                  className="btn btn-comp"
                  onClick={handleComplaintSubmit}
                >
                  Submit 
                </button>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default StudentPortal;
