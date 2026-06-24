# Full Stack Learning Management System (LMS)

## 📖 Project Overview
This project is a secure, role-based Learning Management System (LMS) built with Django (Backend) and React (Frontend). It is designed to handle multiple user types, secure JWT-based authentication, course creation and management, student enrollments, and comprehensive administrative reporting. The platform offers dedicated dashboard experiences tailored to administrators, instructors, and students.

## ✨ Features
- **Robust Authentication (JWT)**: Secure user registration, login, and protected routes using JSON Web Tokens.
- **Password Management**: Secure password hashing along with "Forget Password" and token-based "Reset Password" workflows.
- **Multi-User Role System**: 
  - **Administrators**: Full access to platform analytics, user management, and course approval.
  - **Instructors**: Dedicated portals to manage their assigned courses, create curriculums, and interact with students.
  - **Students**: Interactive dashboard to view enrolled courses, track progress, and continue learning.
- **Profile Management**: Users can view and update their profile details securely.
- **Course & Curriculum Engine**: Full CRUD capabilities for Course Categories, Courses, Modules, and interactive curriculum building.
- **Enrollment System**: Seamless student enrollment and progress tracking.
- **Dynamic Dashboards**:
  - **Admin**: Summary cards showing total users, active courses, enrollment statistics, and role-wise user distribution.
  - **Instructor**: Quick access to modify assigned courses.
  - **Student**: View active enrollments and learning progress.

## 💻 Tech Stack
**Backend:**
- Python 3
- Django & Django REST Framework (DRF)
- JWT (SimpleJWT) for Authentication
- SQLite (Default Database)

**Frontend:**
- React (bootstrapped with Vite)
- React Router (for navigation)
- Context API (for global state management)
- Lucide React (for iconography)
- Framer Motion (for animations)
- React Quill (for rich text editing)

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.10 or higher)

### 1. Backend Setup (Django)
Open your terminal and navigate to the backend directory:
```bash
cd backend
```

Create and activate a Python virtual environment:
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

Install the required Python packages:
```bash
pip install -r requirements.txt
```

Run database migrations to set up the SQLite database:
```bash
python manage.py makemigrations
python manage.py migrate
```

Start the Django development server:
```bash
python manage.py runserver
```
*The backend API will now be running at http://localhost:8000*

### 2. Frontend Setup (React)
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
```

Install the required Node dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The frontend application will now be running locally (usually at http://localhost:5173)*

### 3. Creating an Admin User
To access the Administrator Control Panel, you will need to create a superuser account in the backend terminal:
```bash
cd backend
# Ensure your virtual environment is activated
python manage.py createsuperuser
```
Follow the prompts to set your email and password, then log into the frontend using those credentials to access the Admin Dashboard.
