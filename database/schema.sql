-- Create database
CREATE DATABASE IF NOT EXISTS truck_management;
USE truck_management;

-- Create trucks table
CREATE TABLE IF NOT EXISTS trucks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    truckNumber VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tripNumber INT NOT NULL,
    truckNumber VARCHAR(50) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    driverName VARCHAR(100) NOT NULL,
    `from` VARCHAR(100) NOT NULL,
    `to` VARCHAR(100) NOT NULL,
    partyName VARCHAR(100) NOT NULL,
    compressor ENUM('Yes', 'No') DEFAULT 'No',
    startKm INT,
    endKm INT,
    totalKm INT,
    dieselQty DECIMAL(10,2),
    dieselAmount DECIMAL(10,2),
    toll DECIMAL(10,2),
    driverSalary DECIMAL(10,2),
    advancedSalary DECIMAL(10,2),
    maintenance DECIMAL(10,2),
    freight DECIMAL(10,2),
    weight DECIMAL(10,2),
    totalFreight DECIMAL(10,2),
    totalExpenses DECIMAL(10,2),
    totalProfit DECIMAL(10,2),
    perDayProfit DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (truckNumber) REFERENCES trucks(truckNumber)
);

-- Create cities table for locations
CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(50) DEFAULT 'Gujarat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Gujarat cities
INSERT IGNORE INTO cities (name) VALUES 
('Ahmedabad'),
('Surat'),
('Vadodara'),
('Rajkot'),
('Bhavnagar'),
('Jamnagar'),
('Gandhinagar'),
('Junagadh'),
('Anand'),
('Nadiad'),
('Navsari'),
('Morbi'),
('Bharuch'),
('Mehsana'),
('Tulsigam');

-- Create parties table
CREATE TABLE IF NOT EXISTS parties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample locations
INSERT IGNORE INTO locations (name, state) VALUES 
('Mumbai', 'Maharashtra'),
('Delhi', 'Delhi'),
('Bangalore', 'Karnataka'),
('Hyderabad', 'Telangana'),
('Chennai', 'Tamil Nadu'),
('Kolkata', 'West Bengal'),
('Pune', 'Maharashtra'),
('Ahmedabad', 'Gujarat'),
('Surat', 'Gujarat'),
('Jaipur', 'Rajasthan');

-- Insert some sample materials
INSERT IGNORE INTO materials (name) VALUES 
('Sand'),
('Gravel'),
('Cement'),
('Steel'),
('Bricks'),
('Wood'),
('Coal'),
('Iron Ore'),
('Limestone'),
('Chemicals'); 