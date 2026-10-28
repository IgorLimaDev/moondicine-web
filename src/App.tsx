import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import QuizResultPage from './pages/QuizResultPage'
import ReviewPage from './pages/ReviewPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import ExamBrowserPage from './pages/ExamBrowserPage'
import SpecialtyBrowserPage from './pages/SpecialtyBrowserPage'
import Layout from './components/Layout'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminUsers from './admin/AdminUsers'
import AdminQuestions from './admin/AdminQuestions'
import AdminQuestionEdit from './admin/AdminQuestionEdit'
import LoadingScreen from './components/LoadingScreen'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAdmin } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<HomePage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="quiz/result" element={<QuizResultPage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="exams" element={<ExamBrowserPage />} />
        <Route path="specialties" element={<SpecialtyBrowserPage />} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="questions/new" element={<AdminQuestionEdit />} />
        <Route path="questions/:id" element={<AdminQuestionEdit />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
