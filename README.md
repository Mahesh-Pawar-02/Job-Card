⚙️ Parts & Process Management System

A full-stack application to manage Customers, Parts, and Processes for a manufacturing company.
Features include CRUD operations, file uploads (images), advanced search, pagination, PDF/print exports, and role-based workflow.

🛠 Tech Stack

Frontend: React (Vite), Tailwind CSS

Backend: Node.js, Express.js

Database: MySQL

File Uploads: Multer (stored in /uploads/parts)

PDF/Print Export: html2pdf.js

customer
| Field          | Type         | Key | Notes             |
| -------------- | ------------ | --- | ----------------- |
| customer\_id   | int (PK)     | AI  | Unique identifier |
| customer\_name | varchar(255) |     | Required          |

process
| Field              | Type         | Notes                 |
| ------------------ | ------------ | --------------------- |
| process\_id        | int (PK)     | Auto increment        |
| process\_name      | varchar(255) | Required              |
| loading            | varchar(255) |                       |
| pasting            | varchar(10)  | Yes / No              |
| pattern\_no        | int          |                       |
| shot\_blasting     | varchar(10)  | Yes / No              |
| punching           | varchar(10)  | Yes / No              |
| temperature        | int          | Tempering temperature |
| time               | varchar(50)  | Tempering time        |
| case\_depth        | varchar(50)  | Inspection            |
| checking\_location | varchar(255) | Inspection            |
| cut\_off\_value    | varchar(50)  | Inspection            |
| core\_hardness     | varchar(50)  | Inspection            |
| surface\_hardness  | varchar(50)  | Inspection            |
| microstructure     | varchar(255) | Inspection            |

part
| Field               | Type          | Notes                                          |
| ------------------- | ------------- | ---------------------------------------------- |
| part\_id            | int (PK)      | Auto increment                                 |
| customer\_id        | int (FK)      | References `customer.customer_id`              |
| process\_id         | int (FK)      | References `process.process_id`                |
| part\_name          | varchar(255)  | Required                                       |
| part\_no            | varchar(255)  |                                                |
| material            | varchar(255)  |                                                |
| weight              | decimal(10,2) |                                                |
| furnace\_capacity   | varchar(50)   | Charge preparation                             |
| batch\_qty          | int           |                                                |
| total\_part\_weight | decimal(10,2) |                                                |
| drg                 | varchar(50)   | Drawing available?                             |
| broach\_spline      | varchar(10)   | Yes / No                                       |
| anti\_carb\_paste   | varchar(10)   | Yes / No                                       |
| hard\_temp          | int           | Hardening temperature                          |
| rpm                 | int           |                                                |
| image1              | varchar(255)  | First image path (stored in `/uploads/parts`)  |
| image2              | varchar(255)  | Second image path (stored in `/uploads/parts`) |


🚀 Features

CRUD Operations for Customer, Process, and Part.

Search & Pagination on parts (client-side optimized for up to 10,000 records).

File Uploads: Upload two images per part, old images auto-deleted on update.

View Modal with professional PDF/Print layout (includes images, process details, inspection, and remarks).

Export / Print parts details with signatures for Prepared By & Approved By.

Dynamic Columns & Filtering in frontend tables.

Validation: Customer and Process must be selected from autocomplete before saving part.

📂 Project Structure
backend/
 ├── controllers/       # Business logic (partController.js, processController.js, customerController.js)
 ├── middleware/        # Multer upload config
 ├── routes/            # Express routes
 ├── uploads/parts/     # Uploaded images
 ├── server.js          # App entry point
 └── db.js              # MySQL connection

frontend/
 ├── src/
 │   ├── components/    # UI components
 │   ├── pages/         # PartPage.jsx, CustomerPage.jsx, ProcessPage.jsx
 │   ├── context/       # Auth & global context
 │   └── App.jsx        # Routes & layout

⚡️ Setup & Installation
1. Clone the repo
git clone https://github.com/your-username/job-card-system.git
cd job-card-system

2. Backend setup
cd backend
npm install


Configure MySQL database in db.js.

Create tables (customer, process, part) using schema above.

Run server:

npm start


Backend runs at: http://localhost:5000

3. Frontend setup
cd frontend
npm install
npm run dev


Frontend runs at: http://localhost:5173

📸 Screenshots

Dashboard with Parts Table (Search + Pagination)

Part View Modal (with images, process, inspection, remarks)

PDF Export / Print Layout

📝 Future Improvements

Authentication (role-based: Admin, Operator).

Export to Excel directly.

Bulk part upload from CSV.

Audit logs for part updates.

👨‍💻 Author

Built with ❤️ by [Your Name].