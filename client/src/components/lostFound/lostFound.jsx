import React, { useState, useEffect } from "react";
import "./lostFound.css";
import AddImage from "../../assets/img/add-image.jpeg";

const LostAndFound = ({ isLoggedIn, userId }) => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentItem, setCurrentItem] = useState({
    type: "",
    description: "",
    image: "", // Changed from "image"
    email: userId,
  });
  const [studentDetails, setStudentDetails] = useState(null);
  const backendURL = process.env.REACT_APP_BACKEND_URL || "https://lms-react-server.vercel.app";

  // Function to fetch student details
  const fetchStudentDetails = async () => {
    if (!isLoggedIn || !userId) return;

    try {
      const response = await fetch(`${backendURL}/getStudentDetails/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentDetails(data);
        console.log(data)
      } else {
        console.error("Failed to fetch student details");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  useEffect(() => {
    // Fetch student details when component mounts
    fetchStudentDetails();
  }, [isLoggedIn, userId]); // Fetch again when isLoggedIn or userId changes

  const handleInputChange = (e) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
  };

  const handlePost = () => {
    // Check if the user is logged in
    if (!isLoggedIn) {
      alert("Please log in to post lost or found items.");
      return;
    }

    // Check if student details are fetched
    if (!studentDetails) {
      console.error("Student details not available.");
      return;
    }
    console.log(currentItem)
    if (!currentItem.description || !currentItem.image || !currentItem.email) {
      alert("Please fill in description, image upload, and email.");
      return;
    }

    const newItem = {
      date: new Date().toLocaleString(),
      description: currentItem.description,
      phNo: studentDetails.Phone_No,
      hostelId: studentDetails.Hostel_ID,
      roomNo: studentDetails.Room_No,
      imageUrl: currentItem.image,
      rollNo: studentDetails.Roll_No,
      email: currentItem.email,
    };

    const endpoint =
      currentItem.type === "lost" ? "postLostItem" : "postFoundItem";
    console.log("Posting item:", newItem);
    fetch(`${backendURL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to post item");
        }
      })
      .then((data) => {
        if (currentItem.type === "lost") {
          setLostItems([data, ...lostItems]);
        } else {
          setFoundItems([data, ...foundItems]);
        }
      })
      .catch((error) => {
        console.error("Error during item posting:", error);
      });

    setCurrentItem({
      type: "",
      description: "",
      image: "",
      email: userId,
    });
  };

  useEffect(() => {
    // Fetch lost items
    fetch(`${backendURL}/getLostItems`)
      .then((response) => response.json())
      .then((data) => setLostItems(data))
      .catch((error) => console.error("Error fetching lost items:", error));

    // Fetch found items
    fetch(`${backendURL}/getFoundItems`)
      .then((response) => response.json())
      .then((data) => setFoundItems(data))
      .catch((error) => console.error("Error fetching found items:", error));
  }, []);

  const renderPosts = (items) => {
    return (
      <div>
        {items.map((item, index) => (
          <div key={index} className="card mb-3">
            <img
              src={item.Image} // Changed from "Image"
              className="card-img-top"
              alt={`Item ${index}`}
            />
            <div className="card-body">
              <p className="card-text">{item.Description}</p>
              <p className="card-text">
                <small className="text-muted">{item.Date}</small>
              </p>
              <p className="card-text">
                <small className="text-muted">Posted by: {item.Email}</small>
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxFileSize = 1 * 1024 * 1024;
      if (file.size > maxFileSize) {
        alert("File size should not exceed 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result;
        setSelectedImage(dataURL);
        // Convert image data to Base64 and store it
        const base64Image = dataURL.split(",")[1];
        setCurrentItem((formData) => ({ ...formData, image: base64Image }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mt-5">
      <header>
        {/* Blank header */}
        <div style={{ height: "50px" }}></div>
      </header>
      <h2 className="text-center mb-4">Lost and Found</h2>
      <div className="row">
        <div className="col-md-4">
          <h4>Lost Items</h4>
          {renderPosts(lostItems)}
        </div>
        <div className="col-md-4">
          <h4>Found Items</h4>
          {renderPosts(foundItems)}
        </div>
        <div className="col-md-4">
          <h4>Post a Lost or Found Item</h4>
          <div className="mb-3">
            <label htmlFor="itemType">Item Type:</label>
            <select
              className="form-select"
              id="itemType"
              name="type"
              value={currentItem.type}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="itemDescription">Item Description:</label>
            <textarea
              className="form-control"
              id="itemDescription"
              name="description"
              value={currentItem.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="itemImage">Upload Image: </label>
            <div className="image-upload-container-create">
              <input
                type="file"
                id="fileInput"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <label htmlFor="fileInput" className="image-upload-label-create">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Uploaded"
                    className="uploaded-image-create"
                  />
                ) : (
                  <img
                    src={AddImage}
                    alt="Add-Gallery"
                    className="add-image-modal"
                    loading="lazy"
                  />
                )}
              </label>
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="itemEmail">Email:</label>
            <input
              type="email"
              className="form-control"
              id="itemEmail"
              name="email"
              value={currentItem.email}
              onChange={handleInputChange}
            />
          </div>
          <button className="btn btn-post" onClick={handlePost}>
            Post Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default LostAndFound;
