# Library Management System

A full-stack web application built with React, FastAPI, and Supabase PostgreSQL.

- Backend: [LibraryHub - Backend](https://github.com/MMunim90/FastAPI-Fullstack-Project-Backend)

## 🚀 Tech Stack

### Frontend
- React
- JavaScript
- HTML5 & CSS3
- Tailwind CSS
- Daisy UI

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy 

### Database
- Supabase
- PostgreSQL

### Tools
- Git & GitHub
- VS Code
- Postman

## ✨ Features

- Responsive and user-friendly interface
- RESTful API development with FastAPI
- PostgreSQL database integration using Supabase
- Data validation with Pydantic
- CRUD operations (Create, Read, Update, Delete)
- Frontend and backend separation

## 🏗️ Architecture

```text
React Frontend
      |
      | HTTP Requests (REST API)
      v
FastAPI Backend
      |
      | Database Queries
      v
Supabase PostgreSQL
```

## 📁 Project Structure

```text
FastAPI-Fullstack-Project/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│    ├── router/
│    ├── .env
│    ├── .gitignore
│    ├── database.py
│    ├── main.py
│    ├── models.py
│    └── requirements.txt
│
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js and npm
- Python 3.10+
- A Supabase account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/MMunim90/FastAPI-Fullstack-Project.git
cd FastAPI-Fullstack-Project
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

Windows:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file and configure your database connection:

```env
DATABASE_URL=your_supabase_postgresql_connection_string
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will run at:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 3. Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Configure your frontend environment variables if required.

Create a `.env` file:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the React development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## 🗄️ Database Setup

1. Create a project in [Supabase](https://supabase.com/).
2. Set up your PostgreSQL database tables.
3. Copy the appropriate database connection string from your Supabase project.
4. Add the connection string to the backend `.env` file.
5. Ensure your database credentials are kept private.

## 🔐 Environment Variables

Never commit secret keys, passwords, or database credentials to GitHub.

Add the following to `.gitignore`:

```gitignore
.env
venv/
__pycache__/
node_modules/
dist/
```

## 📖 API Documentation

FastAPI automatically generates interactive API documentation.

- Swagger UI: `/docs`
- ReDoc: `/redoc`

## 🛠️ Development Workflow

1. Build the user interface with React.
2. Develop API endpoints with FastAPI.
3. Connect the backend to Supabase PostgreSQL.
4. Integrate the frontend with the backend API.
5. Test API endpoints and database operations.
6. Test the complete application.

## 🚧 Project Status

Currently under development.

## 👨‍💻 Author

**Munim**

- GitHub: [@MMunim90](https://github.com/MMunim90)
- LinkedIn: [MD. SHAHAN AL MUNIM](https://www.linkedin.com/in/m-munim)

## 📄 License

This project is licensed under the MIT License. Add a `LICENSE` file if you intend to distribute it under that license.
