import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./studentPortal.css";

const StudentPortal = ({ isLoggedIn, userId, userRole }) => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [clothesCount, setClothesCount] = useState(0);
  const [note, setNote] = useState("");
  const [laundryHistory, setLaundryHistory] = useState([]);
  const [complaint, setComplaint] = useState("");
  const [laundryStatus, setLaundryStatus] = useState(false);

  const backendURL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://lms-react-server.vercel.app";

  useEffect(() => {
    if (isLoggedIn && userId && userRole === "student") {
      fetchStudentDetails(userId);
      fetchLaundryHistory();
    }
  }, [isLoggedIn, userId, userRole]);

  const fetchStudentDetails = async (userId) => {
    try {
      const response = await fetch(`${backendURL}/getStudentDetails/${userId}`);
      if (response.ok) {
        const student = await response.json();
        setStudentDetails(student);
        setLaundryStatus(student.laundry_status); 
        await fetchLaundryHistory(student.Roll_No);
      } else {
        throw new Error("Failed to fetch student details");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  const fetchLaundryHistory = async (rollNo) => {
    try {
      const response = await fetch(`${backendURL}/getLaundry/${rollNo}`);
      if (response.ok) {
        const { laundryHistory } = await response.json();
        console.log("Laundry History:", laundryHistory);
        setLaundryHistory(laundryHistory);
      } else {
        throw new Error("Failed to fetch laundry history");
      }
    } catch (error) {
      console.error("Error fetching laundry history:", error);
    }
  };

  const handleClothesSubmit = async () => {
    if (
      clothesCount <= 0 ||
      clothesCount > 30 ||
      !isLoggedIn ||
      !studentDetails ||
      userRole !== "student"
    ) {
      toast.error(
        "Please enter a valid number of clothes and sign in with student credentials!",
        {
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
        }
      );
      return;
    }

    if (laundryStatus) {
      toast.error("You already have laundry in process!", {
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

    const rollNo = studentDetails.Roll_No;
    const hostelId = studentDetails.Hostel_ID;
    try {
      const response = await fetch(`${backendURL}/submitLaundry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ givenClothes: clothesCount, rollNo: rollNo, assignedHostelId: hostelId, message: note }),
      });

      if (response.ok) {
        await fetchLaundryHistory(); // Update laundry history after submission
        setClothesCount(0);
        setNote("");

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
        throw new Error(
          "Failed to submit laundry. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error during laundry submission:", error);
      toast.error(
        "Error during laundry submission. Please try again later.",
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

  const handleComplaintSubmit = async () => {
    if (
      !isLoggedIn ||
      userRole !== "student" ||
      !studentDetails ||
      complaint.trim() === ""
    ) {
      toast.error(
        "Please enter a valid complaint and sign in with student credentials!",
        {
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
        }
      );
      return;
    }
    if (complaint.trim() !== "") {
      const rollNo = studentDetails.Roll_No;
      try {
        const response = await fetch(`${backendURL}/submitComplaint`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ complaintText: complaint, rollNo }),
        });

        if (response.ok) {
          setComplaint("");

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
          throw new Error(
            "Failed to submit complaint. Please try again later."
          );
        }
      } catch (error) {
        console.error("Error during complaint submission:", error);
        toast.error(
          "Error during complaint submission. Please try again later.",
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
  
  const renderLaundryHistoryTable = () => {
    return (
      <div className="container mt-3">
        <h3>Laundry Submission History</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date of Submission</th>
              <th>Number of Clothes</th>
              <th>Status</th>
              <th>Return Date</th>
            </tr>
          </thead>
          <tbody>
            {laundryHistory.map((entry, index) => (
              <tr key={index}>
                <td>{formatDate(entry.Received_Date)}</td>
                <td>{entry.Clothes_Given}</td>
                <td style={{ color: getStatusColor(entry.Edit_Status) }}>
                  {entry.Edit_Status}
                </td>
                <td>{entry.Return_Date ? formatDate(entry.Return_Date) : 'None'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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
            {laundryStatus ? (
              <p>Your laundry is already in process.</p>
            ) : (
              <>
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
                  <label htmlFor="note">Note:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ marginTop: 10, marginBottom: 10 }}
                  />
                </div>
                <button
                  className="btn btn-sub"
                  onClick={handleClothesSubmit}
                >
                  Submit
                </button>
              </>
            )}
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
  