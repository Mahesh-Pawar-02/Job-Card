# Database Schema Documentation

This document describes the database schema for the system. It includes table structures, relationships, and SQL queries to create the tables.

---

## 📊 Tables Overview

### 1. `customer`
Stores customer information.

| Field         | Type         | Null | Key | Extra          | Description         |
|---------------|--------------|------|-----|----------------|---------------------|
| customer_id   | int          | NO   | PRI | auto_increment | Unique customer ID  |
| customer_name | varchar(255) | NO   |     |                | Name of the customer |

---

### 2. `inward`
Represents inward entries linked to customers.

| Field       | Type | Null | Key | Extra          | Description                  |
|-------------|------|------|-----|----------------|------------------------------|
| inward_id   | int  | NO   | PRI | auto_increment | Unique inward entry ID       |
| inward_date | date | NO   |     |                | Date of inward entry         |
| customer_id | int  | NO   | MUL |                | Foreign key → customer table |

---

### 3. `inwardpart`
Associates parts with inward entries (many-to-many relationship).

| Field     | Type | Null | Key | Description                       |
|-----------|------|------|-----|-----------------------------------|
| inward_id | int  | NO   | PRI | Foreign key → inward.inward_id    |
| part_id   | int  | NO   | PRI | Foreign key → part.part_id        |
| qty       | int  | NO   |     | Quantity of the part in this batch |

---

### 4. `part`
Stores detailed information about each part.

| Field               | Type          | Null | Key | Extra           | Description                         |
| ------------------- | ------------- | ---- | --- | --------------- | ----------------------------------- |
| part\_id            | int           | NO   | PRI | auto\_increment | Unique part ID                      |
| customer\_id        | int           | YES  | MUL |                 | Foreign key → customer.customer\_id |
| part\_name          | varchar(255)  | YES  |     |                 | Name of the part                    |
| part\_no            | varchar(255)  | YES  |     |                 | Part number/code                    |
| material            | varchar(255)  | YES  |     |                 | Material type                       |
| weight              | decimal(10,2) | YES  |     |                 | Weight per piece                    |
| process             | varchar(255)  | YES  |     |                 | Process name                        |
| loading             | varchar(255)  | YES  |     |                 | Loading type                        |
| pasting             | varchar(10)   | YES  |     |                 | Pasting info (Y/N/NA)               |
| pattern\_no         | int           | YES  |     |                 | Pattern number                      |
| shot\_blasting      | varchar(10)   | YES  |     |                 | Shot blasting applied (Y/N)         |
| punching            | varchar(10)   | YES  |     |                 | Punching applied (Y/N)              |
| temperature         | int           | YES  |     |                 | Process temperature (°C)            |
| time                | varchar(50)   | YES  |     |                 | Process time                        |
| case\_depth         | varchar(50)   | YES  |     |                 | Case depth info                     |
| checking\_location  | varchar(255)  | YES  |     |                 | Checking location                   |
| cut\_off\_value     | varchar(50)   | YES  |     |                 | Cut off value                       |
| core\_hardness      | varchar(50)   | YES  |     |                 | Core hardness                       |
| surface\_hardness   | varchar(50)   | YES  |     |                 | Surface hardness                    |
| microstructure      | varchar(255)  | YES  |     |                 | Microstructure details              |
| furnace\_capacity   | varchar(50)   | YES  |     |                 | Furnace capacity                    |
| batch\_qty          | int           | YES  |     |                 | Batch quantity                      |
| total\_part\_weight | decimal(10,2) | YES  |     |                 | Total weight of parts               |
| drg                 | varchar(50)   | YES  |     |                 | Drawing number                      |
| broach\_spline      | varchar(10)   | YES  |     |                 | Broach/Spline info (Y/N)            |
| anti\_carb\_paste   | varchar(10)   | YES  |     |                 | Anti-carb paste applied (Y/N)       |
| hard\_temp          | int           | YES  |     |                 | Hardening temperature (°C)          |
| rpm                 | int           | YES  |     |                 | Machine RPM                         |


## 🛠 SQL Queries to Create Tables

```sql
-- Table: customer
CREATE TABLE customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL
);

-- Table: inward
CREATE TABLE inward (
    inward_id INT AUTO_INCREMENT PRIMARY KEY,
    inward_date DATE NOT NULL,
    customer_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- Table: part
-- Table: part
CREATE TABLE part (
    part_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    part_name VARCHAR(255),
    part_no VARCHAR(255),
    material VARCHAR(255),
    weight DECIMAL(10,2),
    process VARCHAR(255),
    loading VARCHAR(255),
    pasting VARCHAR(10),
    pattern_no INT,
    shot_blasting VARCHAR(10),
    punching VARCHAR(10),
    temperature INT,
    time VARCHAR(50),
    case_depth VARCHAR(50),
    checking_location VARCHAR(255),
    cut_off_value VARCHAR(50),
    core_hardness VARCHAR(50),
    surface_hardness VARCHAR(50),
    microstructure VARCHAR(255),
    furnace_capacity VARCHAR(50),
    batch_qty INT,
    total_part_weight DECIMAL(10,2),
    drg VARCHAR(50),
    broach_spline VARCHAR(10),
    anti_carb_paste VARCHAR(10),
    hard_temp INT,
    rpm INT,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);


-- Table: inwardpart
CREATE TABLE inwardpart (
    inward_id INT NOT NULL,
    part_id INT NOT NULL,
    qty INT NOT NULL,
    PRIMARY KEY (inward_id, part_id),
    FOREIGN KEY (inward_id) REFERENCES inward(inward_id),
    FOREIGN KEY (part_id) REFERENCES part(part_id)
);


-- Insert sample data into customer table
INSERT INTO customer (customer_id, customer_name) VALUES
(1, 'Rushikesh'),
(2, 'Vikas'),
(3, 'Mahesh'),
(4, 'Sai'),
(5, 'Nikhil'),
(6, 'Sneha'),
(7, 'Priya'),
(8, 'Ankit'),
(9, 'Pooja'),
(10, 'Ashwin'),
(11, 'Tanya'),
(12, 'Sameer'),
(13, 'Sakshi'),
(14, 'Deepak'),
(15, 'Vidya'),
(16, 'Amit'),
(17, 'Maya'),
(18, 'Kiran'),
(19, 'Anjali'),
(20, 'Raunak'),
(21, 'Bhavesh'),
(22, 'Shreya');

-- Insert sample data into part table
INSERT INTO part (
    part_id, part_name, material, drg, loading, broach_spline, anti_carb_paste,
    case_depth, surface_hardness, weight, total_part_weight, batch_qty,
    pattern_no, hard_temp, rpm, shot_blasting, punching, part_no
) VALUES
(1,'Gear','20MnCr5','Yes','star Bar','Yes','No','0.20-0.40@550Hv1 at RCD','89.5-91HR15N',0.918,293.76,320,'5',1400,1400,'Yes','NA','5484'),
(2,'Gear','20MnCr5','Yes','star Bar','Yes','No','0.20-0.40@550Hv1 at RCD','89.5-91HR15N',0.97,310.4,320,'5',1400,1400,'Yes','NA','5485'),
(3,'4WD input shaft','20MnCr5','Yes','Vertical','No','No','0.65 - 0.85@550Hv1 at SplineRCD','59-62Hrc',1.82,546,300,'4',1500,1500,'Yes','NA','0.018.7221.0/10'),
(4,'Diff. Housing flange','EN353','Yes','Flat','No','No','0.75 - 0.95@550Hv1 at OD','60-62Hrc',0.598,538.2,900,'1',1500,1500,'Yes','NA','0.0255.4615.0/40'),
(5,'4WD Shaft','20MnCr5','Yes','Vertical','No','Yes','0.65 - 0.85@550Hv1 at Spline root','60-62Hrc',2.8,560,200,'4',1500,1500,'Yes','NA','0.033.1160.0'),
(6,'Output Shaft','20MnCr5','Yes','Vertical','No','No','0.27 - 0.47@550Hv1','79-83HRA',1.14,364.8,320,'5',1500,1500,'Yes','NA','V17033'),
(7,'Output Shaft','20MnCr5','Yes','Vertical','No','No','0.27 - 0.47@550Hv1','79-83HRA',1.35,513,380,'5',1500,1500,'Yes','NA','V17027'),
(8,'Output Gear','20MnCr5','Yes','Vertical','No','No','0.27 - 0.47@550Hv1','79-83HRA',0.056,448,8000,'5',1500,1500,'Yes','NA','V170039'),
(9,'Output Gear','20MnCr5','Yes','Vertical','No','No','0.27 - 0.47@550Hv1','79-83HRA',0.072,576,8000,'5',1500,1500,'Yes','NA','V170041'),
(10,'Forward Clutch Bell','20MnCr5','Yes','Flat','Yes','Yes','0.80 - 1.10@550Hv1','60-63Hrc',7.16,358,50,'24',1200,1200,'Yes','NA','0.015.5434.0/50'),
(11,'Lever Output LRC, PPA','16MnCr5','Yes','Bar','Yes','No','0.59-1.01 mm @ 515 Hv1','60 HRC Min',0.35,490,1400,'4',1500,1500,'Yes','NA','8879357'),
(12,'PTO Shaft','20MnCr5','Yes','Flat','No','No','0.85 - 1.05 @ 550 Hv1','59-62 HRC',2.12,339.2,160,'10',1500,1500,'Yes','NA','0.022.2039.0/10'),
(13,'PTO Shaft','20MnCr5','Yes','Flat','No','No','0.85 - 1.05 @ 550 Hv1','59-62 HRC',2.12,339.2,160,'10',1500,1500,'Yes','NA','0.022.2040.0/10'),
(14,'Albero Transmettente 4RM Shaft','20MnCr5','Yes','Vertical','No','Yes','0.60 - 80@515 at Spline PCD','59-63 HRC',3.78,529.2,140,'4',1500,1500,'Yes','NA','V34001'),
(15,'Albero Posteriore PTO Rear Shaft','20MnCr5','Yes','Vertical','No','Yes','0.60 - 80@515Hv1 Spline PCD','59-63 HRC',2.11,316.5,150,'11',1500,1500,'Yes','NA','V34002'),
(16,'Routa Z28 Gear','20MnCr5','Yes','Vertical','No','No','0.65-0.85@550hV1 Spline root','60-63Hrc',2.37,545.1,230,'4',1500,1500,'Yes','NA','0.020.7433.0');

