import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Notifications from './pages/Notifications';
import Facilities from './pages/member/Facilities';
import FacilityDetail from './pages/member/FacilityDetail';
import MyBookings from './pages/member/MyBookings';
import BookingHistory from './pages/member/BookingHistory';
import Partners from './pages/member/Partners';
import EquipmentReports from './pages/member/EquipmentReports';
import BookingRequests from './pages/staff/BookingRequests';
import AllBookings from './pages/staff/AllBookings';
import StaffEquipment from './pages/staff/StaffEquipment';
import Dashboard from './pages/admin/Dashboard';
import ManageFacilities from './pages/admin/ManageFacilities';
import ManageStaff from './pages/admin/ManageStaff';
import ManageMembers from './pages/admin/ManageMembers';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'staff') return <Navigate to="/staff/requests" replace />;
  return <Navigate to="/facilities" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<HomeRedirect />} />

            {/* Notifications - all roles */}
            <Route path="notifications" element={<Notifications />} />

            {/* Member routes */}
            <Route path="facilities" element={<Facilities />} />
            <Route path="facilities/:id" element={<FacilityDetail />} />
            <Route path="bookings" element={
              <ProtectedRoute roles={['member']}><MyBookings /></ProtectedRoute>
            } />
            <Route path="history" element={
              <ProtectedRoute roles={['member']}><BookingHistory /></ProtectedRoute>
            } />
            <Route path="partners" element={
              <ProtectedRoute roles={['member']}><Partners /></ProtectedRoute>
            } />
            <Route path="equipment" element={
              <ProtectedRoute roles={['member']}><EquipmentReports /></ProtectedRoute>
            } />

            {/* Staff routes */}
            <Route path="staff/requests" element={
              <ProtectedRoute roles={['staff', 'admin']}><BookingRequests /></ProtectedRoute>
            } />
            <Route path="staff/bookings" element={
              <ProtectedRoute roles={['staff', 'admin']}><AllBookings /></ProtectedRoute>
            } />
            <Route path="staff/equipment" element={
              <ProtectedRoute roles={['staff']}><StaffEquipment /></ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="admin" element={
              <ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>
            } />
            <Route path="admin/facilities" element={
              <ProtectedRoute roles={['admin']}><ManageFacilities /></ProtectedRoute>
            } />
            <Route path="admin/staff" element={
              <ProtectedRoute roles={['admin']}><ManageStaff /></ProtectedRoute>
            } />
            <Route path="admin/members" element={
              <ProtectedRoute roles={['admin']}><ManageMembers /></ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
