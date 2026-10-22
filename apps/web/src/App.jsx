import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProtectedRoute } from './layouts/ProtectedRoute.jsx';
import { AuthorLayout } from './layouts/AuthorLayout.jsx';
import { AdminLayout } from './layouts/AdminLayout.jsx';

// Pages
import { LoginPage } from './pages/LoginPage.jsx';
import { AuthorDashboard } from './pages/author/AuthorDashboard.jsx';
import { AuthorBooks } from './pages/author/AuthorBooks.jsx';
import { AuthorCreateTicket } from './pages/author/AuthorCreateTicket.jsx';
import { AuthorTickets } from './pages/author/AuthorTickets.jsx';
import { AuthorTicketDetail } from './pages/author/AuthorTicketDetail.jsx';
import { AuthorProfile } from './pages/author/AuthorProfile.jsx';

import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminTicketQueue } from './pages/admin/AdminTicketQueue.jsx';
import { AdminTicketWorkspace } from './pages/admin/AdminTicketWorkspace.jsx';
import { NotFound } from './pages/NotFound.jsx';

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-[#FBFBF9]" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/author/dashboard'} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <Routes>
            {/* Root & Public */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Author Portal */}
            <Route element={<ProtectedRoute allowedRole="author" />}>
              <Route element={<AuthorLayout />}>
                <Route path="/author/dashboard" element={<AuthorDashboard />} />
                <Route path="/author/books" element={<AuthorBooks />} />
                <Route path="/author/tickets" element={<AuthorTickets />} />
                <Route path="/author/tickets/new" element={<AuthorCreateTicket />} />
                <Route path="/author/tickets/:ticketId" element={<AuthorTicketDetail />} />
                <Route path="/author/profile" element={<AuthorProfile />} />
              </Route>
            </Route>

            {/* Admin Portal */}
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/tickets" element={<AdminTicketQueue />} />
                <Route path="/admin/tickets/:ticketId" element={<AdminTicketWorkspace />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
