import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

import LandingPage from './components/LandingPage';

// Admin pages
import Dashboard      from './components/admin/Dashboard';
import UsersPage      from './components/admin/pages/UsersPage';
import PostsPage      from './components/admin/pages/PostsPage';
import FeedbackPage   from './components/admin/pages/FeedbackPage';
import LostFoundPage  from './components/admin/pages/LostFoundPage';
import SettingsPage   from './components/admin/pages/SettingsPage';
import NotificationsPage from './components/admin/pages/NotificationsPage';
import LogsPage       from './components/admin/pages/LogsPage';
import LoginPage      from './components/admin/pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
            {/* Redirect root to admin */}
            <Route path="/" element={<LandingPage />} />

            <Route path="/login" element={<LoginPage />} />

            {/* Admin routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin"               element={<Dashboard />} />
              <Route path="/admin/users"         element={<UsersPage />} />
              <Route path="/admin/posts"         element={<PostsPage />} />
              <Route path="/admin/feedback"      element={<FeedbackPage />} />
              <Route path="/admin/lost-found"    element={<LostFoundPage />} />
              <Route path="/admin/settings"      element={<SettingsPage />} />
              <Route path="/admin/notifications" element={<NotificationsPage />} />
              <Route path="/admin/logs"          element={<LogsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
