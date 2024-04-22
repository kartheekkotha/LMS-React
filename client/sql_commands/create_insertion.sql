-- Hostel Table
CREATE TABLE Hostel (
    Hostel_ID INT PRIMARY KEY,
    Hostel_Name VARCHAR(255), -- Added new column for hostel name
    Warden_Name VARCHAR(255),
    Contact_No VARCHAR(20)
);


CREATE TABLE Student (
    Roll_No INT PRIMARY KEY,
    Name VARCHAR(255),
    Hostel_ID INT,
    Room_No INT,
    Email VARCHAR(255),
    College_ID INT,
    Phone_No VARCHAR(20),
    Image_URL VARCHAR(255),
    Password_Hash VARCHAR(255),
    laundry_status BOOL,
    FOREIGN KEY (Hostel_ID) REFERENCES Hostel(Hostel_ID)
);

-- Admin Table
CREATE TABLE Admin (
    Email VARCHAR(255) PRIMARY KEY,
    Name VARCHAR(255),
    Phone_No VARCHAR(20),
    Password_Hash VARCHAR(255)
);

-- Laundry_Assignment Table
CREATE TABLE Laundry_Assignment (
    Bag_ID INT PRIMARY KEY,
    Roll_No INT,
    Assigned_Date DATE,
    FOREIGN KEY (Roll_No) REFERENCES Student(Roll_No) 
);

-- Updated Laundry_Instance Table
CREATE TABLE Laundry_Instance (
    Instance_ID INT AUTO_INCREMENT PRIMARY KEY,
    Bag_ID INT,
    Clothes_Given INT,
    Received_Date DATE,
    Return_Date DATE DEFAULT NULL, -- Set default return date to NULL
    Assigned_Hostel_ID INT,
    Admin_Email VARCHAR(255),
    Edit_Status VARCHAR(255),
    Student_Message TEXT,
    FOREIGN KEY (Bag_ID) REFERENCES Laundry_Assignment(Bag_ID),
    FOREIGN KEY (Assigned_Hostel_ID) REFERENCES Hostel(Hostel_ID),
    FOREIGN KEY (Admin_Email) REFERENCES Admin(Email)
);



CREATE TABLE LostAndFound (
    LostFound_ID INT AUTO_INCREMENT PRIMARY KEY,
    Date DATE,
    Description VARCHAR(255),
    Ph_No VARCHAR(20),
    Hostel_ID INT,
    Room_No INT,
    Lost_Found ENUM('Lost', 'Found'),
    Image_URL VARCHAR(255),
    Roll_No INT, -- Foreign key reference to the Student table
    FOREIGN KEY (Hostel_ID) REFERENCES Hostel(Hostel_ID),
    FOREIGN KEY (Roll_No) REFERENCES Student(Roll_No)
);


-- Creating AdminMessage Table
CREATE TABLE AdminMessage (
    Message_ID INT AUTO_INCREMENT PRIMARY KEY,
    Date DATE,
    Description VARCHAR(255),
    Hostel_ID INT,
    Admin_Email VARCHAR(255),
    Image_URL VARCHAR(255),
    FOREIGN KEY (Hostel_ID) REFERENCES Hostel(Hostel_ID),
    FOREIGN KEY (Admin_Email) REFERENCES Admin(Email)
);

-- Creating StudentComplaint Table
CREATE TABLE StudentComplaint (
    Complaint_ID INT AUTO_INCREMENT PRIMARY KEY,
    Date DATE,
    Description VARCHAR(255),
    Roll_No INT,
    FOREIGN KEY (Roll_No) REFERENCES Student(Roll_No)
);

-- Dummy data for Hostel Table
INSERT INTO Hostel (Hostel_ID, Warden_Name, Contact_No) VALUES
(1, 'John Doe', '123-456-7890'),
(2, 'Jane Smith', '987-654-3210');

-- Dummy data for Student Table
INSERT INTO Student (Roll_No, Name, Hostel_ID, Room_No, Email, College_ID, Phone_No, Image_URL, Password_Hash) VALUES
(1001, 'Alice Johnson', 1, 101, 'alice@example.com', 123456, '555-123-4567', 'http://example.com/alice.jpg', 'hashed_password_1'),
(1002, 'Bob Smith', 1, 102, 'bob@example.com', 654321, '555-987-6543', 'http://example.com/bob.jpg', 'hashed_password_2');

-- Dummy data for Admin Table
INSERT INTO Admin (Email, Name, Phone_No, Password_Hash) VALUES
('admin1@example.com', 'Admin One', '999-888-7777', 'admin1_password_hash'),
('admin2@example.com', 'Admin Two', '777-888-9999', 'admin2_password_hash');

-- Dummy data for Laundry_Assignment Table
INSERT INTO Laundry_Assignment (Bag_ID, Roll_No, Assigned_Date) VALUES
(1, 1001, '2024-04-01'),
(2, 1002, '2024-04-02');

-- Dummy data for Laundry_Instance Table
INSERT INTO Laundry_Instance (Instance_ID, Bag_ID, Clothes_Given, Received_Date, Return_Date, Assigned_Hostel_ID, Admin_Email) VALUES
(1, 1, 5, '2024-04-01', '2024-04-02', 1, 'admin1@example.com'),
(2, 2, 10, '2024-04-02', '2024-04-03', 1, 'admin2@example.com');

-- Dummy data for LostAndFound Table
INSERT INTO LostAndFound (Date, Description, Ph_No, Hostel_ID, Room_No, Lost_Found, Roll_No) VALUES
('2024-04-01', 'Lost keys', '555-111-2222', 1, 101, 'Lost', 1001),
('2024-04-02', 'Found wallet', '555-333-4444', 1, 102, 'Found', 1002);

-- Dummy data for AdminMessage Table
INSERT INTO AdminMessage (Message_ID, Date, Description, Hostel_ID, Admin_Email, Image_URL) VALUES
(1, '2024-04-01', 'Important announcement', 1, 'admin1@example.com', 'http://example.com/announcement1.jpg'),
(2, '2024-04-02', 'Reminder: Laundry pickup', 1, 'admin2@example.com', 'http://example.com/announcement2.jpg');

-- Dummy data for StudentComplaint Table
INSERT INTO StudentComplaint (Complaint_ID, Date, Description, Roll_No, Image_URL) VALUES
(1, '2024-04-01', 'Broken washing machine', 1001, 'http://example.com/complaint1.jpg'),
(2, '2024-04-02', 'Dryer not working', 1002, 'http://example.com/complaint2.jpg');

-- Insert random values into the table
INSERT INTO studentComplaint (Complaint_ID, Date, Description, Roll_No) 
VALUES 
    (UUID(), NOW(), 'Description 1', RAND()*1000),
    (UUID(), NOW(), 'Description 2', RAND()*1000),
    (UUID(), NOW(), 'Description 3', RAND()*1000),
    -- Add more rows as needed
    ;
