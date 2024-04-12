-- Creating Hostel Table
CREATE TABLE Hostel (
    Hostel_ID INT PRIMARY KEY,
    Warden_Name VARCHAR(255),
    Contact_No VARCHAR(20)
);

-- Creating Laundry_Bag Table
CREATE TABLE Laundry_Bag (
    Bag_ID INT PRIMARY KEY,
    No_of_clothes INT,
    Date_given DATE,
    Received_date DATE,
    Return_date DATE
);

-- Creating Student Table with Password Hash
CREATE TABLE Student (
    Roll_No INT PRIMARY KEY,
    Name VARCHAR(255),
    Hostel_ID INT,
    Room_No INT,
    Email VARCHAR(255),
    College_ID INT,
    Phone_No VARCHAR(20),
    Bag_ID INT,
    Image_URL VARCHAR(255),
    Password_Hash VARCHAR(255), -- New column for hashed password
    FOREIGN KEY (Hostel_ID) REFERENCES Hostel(Hostel_ID),
    FOREIGN KEY (Bag_ID) REFERENCES Laundry_Bag(Bag_ID) -- Adding foreign key constraint for Bag_ID
);


-- Creating LostAndFound Table
CREATE TABLE LostAndFound (
    Date DATE,
    Description VARCHAR(255),
    Ph_No VARCHAR(20),
    Hostel_ID INT,
    Room_No INT,
    Lost_Found ENUM('Lost', 'Found'),
    Image_URL VARCHAR(255), -- New attribute for image URL
    FOREIGN KEY (Hostel_ID) REFERENCES Hostel(Hostel_ID)
);

-- Creating AdminMessage Table
CREATE TABLE AdminMessage (
    Message_ID INT PRIMARY KEY,
    Date DATE,
    Description VARCHAR(255),
    Hostel_ID INT,
    Image_URL VARCHAR(255), -- New attribute for image URL
    FOREIGN KEY (Hostel_ID) REFERENCES Hostel(Hostel_ID)
);

-- Creating StudentComplaint Table
CREATE TABLE StudentComplaint (
    Complaint_ID INT PRIMARY KEY,
    Date DATE,
    Description VARCHAR(255),
    Roll_No INT,
    Image_URL VARCHAR(255), -- New attribute for image URL
    FOREIGN KEY (Roll_No) REFERENCES Student(Roll_No)
);


-- Inserting sample data into Hostel table
INSERT INTO Hostel (Hostel_ID, Warden_Name, Contact_No) VALUES
(1, 'John Doe', '123-456-7890'),
(2, 'Jane Smith', '987-654-3210');

-- Inserting sample data into Laundry_Bag table
INSERT INTO Laundry_Bag (Bag_ID, No_of_clothes, Date_given, Received_date, Return_date) VALUES
(1, 5, '2024-04-10', '2024-04-11', '2024-04-12'),
(2, 10, '2024-04-11', '2024-04-12', '2024-04-13');

-- Inserting sample data into Student table
INSERT INTO Student (Roll_No, Name, Hostel_ID, Room_No, Email, College_ID, Phone_No, Bag_ID, Image_URL, Password_Hash) VALUES
(1, 'Alice', 1, 101, 'alice@example.com', 1001, '987-654-3210', 1, 'https://example.com/images/alice.jpg', 'hashed_password_for_alice'),
(2, 'Bob', 2, 201, 'bob@example.com', 1002, '123-456-7890', 2, 'https://example.com/images/bob.jpg', 'hashed_password_for_bob');

-- Inserting sample data into LostAndFound table
INSERT INTO LostAndFound (Date, Description, Ph_No, Hostel_ID, Room_No, Lost_Found, Image_URL) VALUES
('2024-04-10', 'Found a wallet', '555-555-5555', 1, 101, 'Found', 'https://example.com/images/wallet.jpg'),
('2024-04-11', 'Lost phone', '666-666-6666', 2, 201, 'Lost', 'https://example.com/images/phone.jpg');

-- Inserting sample data into AdminMessage table
INSERT INTO AdminMessage (Message_ID, Date, Description, Hostel_ID, Image_URL) VALUES
(1, '2024-04-10', 'Important notice about upcoming maintenance', 1, 'https://example.com/images/maintenance.jpg'),
(2, '2024-04-11', 'Reminder: Meeting tomorrow at 10 AM', 2, 'https://example.com/images/meeting.jpg');

-- Inserting sample data into StudentComplaint table
INSERT INTO StudentComplaint (Complaint_ID, Date, Description, Roll_No, Image_URL) VALUES
(1, '2024-04-10', 'clothes arent dry ', 1, 'https://example.com/images/complaint.jpg'),
(2, '2024-04-11', 'not folded properly', 2, 'https://example.com/images/ac.jpg');
