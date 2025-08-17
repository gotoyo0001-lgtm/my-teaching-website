import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import MyCoursesPage from './pages/MyCoursesPage'
import AssignmentsPage from './pages/AssignmentsPage'
import AssignmentDetailPage from './pages/AssignmentDetailPage'
import AssignmentSubmitPage from './pages/AssignmentSubmitPage'
import AssignmentCreatePage from './pages/AssignmentCreatePage'
import CourseCreatePage from './pages/admin/CourseCreatePage'
// 管理者頁面
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import CourseManagement from './pages/admin/CourseManagement'
import Analytics from './pages/admin/Analytics'
import Announcements from './pages/admin/Announcements'
import SystemSettings from './pages/admin/SystemSettings'
import './App.css'

function App() {
  const { initialize, loading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/dashboard" element={<MyCoursesPage />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/assignments/create" element={<AssignmentCreatePage />} />
              <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
              <Route path="/assignments/:id/submit" element={<AssignmentSubmitPage />} />
              {/* 管理者路由 */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/courses/new" element={<CourseCreatePage />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/announcements" element={<Announcements />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
