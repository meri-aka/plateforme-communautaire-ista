import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

// Admin pages
import Dashboard              from './components/admin/Dashboard';
import UsersPage              from './components/admin/pages/UsersPage';
import PostsPage              from './components/admin/pages/PostsPage';
import FeedbackPage           from './components/admin/pages/FeedbackPage';
import AdminLostFoundPage     from './components/admin/pages/LostFoundPage';
import SettingsPage           from './components/admin/pages/SettingsPage';
import AdminNotificationsPage from './components/admin/pages/NotificationsPage';
import LogsPage               from './components/admin/pages/LogsPage';
import ReportsPage            from './components/admin/pages/ReportsPage';
import CompleteProfilePage    from './components/user/pages/UserCompleteProfilePage';
import ProtectedRoute         from './components/ProtectedRoute';

// User-facing pages
import UserProtectedRoute from './components/user/UserProtectedRoute';
import UserAuthPage       from './components/user/pages/UserAuthPage';
import FeedPage           from './components/user/pages/FeedPage';
import ProfilePage        from './components/user/pages/ProfilePage';
import LostFoundPage      from './components/user/pages/LostFoundPage';
import NotificationsPage  from './components/user/pages/NotificationsPage';
import SinglePostPage     from './components/user/pages/SinglePostPage';
import FeedbackPageUser   from './components/user/pages/FeedbackPage';

// Landing
import LandingPage from './components/LandingPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Public */}
            <Route path="/login"            element={<UserAuthPage />} />
            <Route path="/register"         element={<UserAuthPage />} />
            <Route path="/forgot-password"  element={<UserAuthPage />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />

            {/* ── Admin routes ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin"               element={<Dashboard />} />
              <Route path="/admin/users"         element={<UsersPage />} />
              <Route path="/admin/posts"         element={<PostsPage />} />
              <Route path="/admin/feedback"      element={<FeedbackPage />} />
              <Route path="/admin/lost-found"    element={<AdminLostFoundPage />} />
              <Route path="/admin/settings"      element={<SettingsPage />} />
              <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
              <Route path="/admin/logs"          element={<LogsPage />} />
              <Route path="/admin/reports"       element={<ReportsPage />} />
            </Route>

            {/* ── User-facing routes ── */}
            <Route element={<UserProtectedRoute />}>
              <Route path="/feed"          element={<FeedPage />} />
              <Route path="/posts/:id"     element={<SinglePostPage />} />
              <Route path="/profile"       element={<ProfilePage />} />
              <Route path="/profile/:id"   element={<ProfilePage />} />
              <Route path="/lost-found"    element={<LostFoundPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/feedback"      element={<FeedbackPageUser />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}