import React, { useState, useEffect } from "react";
import "./lostFound.css";
import AddImage from "../../assets/img/add-image.jpeg";

const LostAndFound = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentItem, setCurrentItem] = useState({
    type: "", 
    description: "",
    image: "",
    email: "",
  });

  const handleInputChange = (e) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
    console.log("Image URL:", currentItem.image);
  };

  const handlePost = () => {
    console.log("HandlePost is clicked")
    console.log(currentItem)
    if (!currentItem.description || !currentItem.imageUrl || !currentItem.email) {
      alert("Please fill in description, image upload, and email.");
      return;
    }

    const newItem = {
      ...currentItem,
      date: new Date().toLocaleString(),
    };

    const endpoint =
      currentItem.type === "lost" ? "/postLostItem" : "/postFoundItem";

    fetch(`https://lms-se.vercel.app/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    })
      .then((response) => {
        console.log("Response is recieved")
        if (response.ok) {
          console.log("Item posted successfully");
          return response.json();
        } else {
          console.error("Failed to post item");
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
      email: "",
    });
  };

  useEffect(() => {
    // Fetch lost items
    fetch("http://localhost:3001/getLostItems")
      .then((response) => response.json())
      .then((data) => setLostItems(data))
      .catch((error) => console.error("Error fetching lost items:", error));

    // Fetch found items
    fetch("http://localhost:3001/getFoundItems")
      .then((response) => response.json())
      .then((data) => setFoundItems(data))
      .catch((error) => console.error("Error fetching found items:", error));
  }, []); // Run only once on component mount

  const renderPosts = (items) => {
    return (
      <div>
        {items.map((item, index) => (
          <div key={index} className="card mb-3">
            <img
              src={item.Image}
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
        setCurrentItem((formData) => ({ ...formData, imageUrl: dataURL }));
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
            {/* <input
              type="text"
              className="form-control"
              id="itemImage"
              name="image"
              value={currentItem.image}
              onChange={handleInputChange}
            /> */}
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
