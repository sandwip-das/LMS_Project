import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages (will be created shortly)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import Profile from './pages/Profile';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import CourseDetail from './pages/CourseDetail';
import InstructorApplication from './pages/InstructorApplication';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import ProjectDetail from './pages/ProjectDetail';
import Resources from './pages/Resources';
import LiveClasses from './pages/LiveClasses';
import ClassJoining from './pages/ClassJoining';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role) && !user.is_superuser) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<CourseList />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/apply-instructor" element={<InstructorApplication />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['administrator', 'moderator']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="/live-classes" element={<ProtectedRoute><LiveClasses /></ProtectedRoute>} />
          <Route path="/class-joining" element={<ProtectedRoute><ClassJoining /></ProtectedRoute>} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <SiteProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </SiteProvider>
  );
}

export default App;
