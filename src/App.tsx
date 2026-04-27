import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { ScheduleClass } from './pages/ScheduleClass';
import { Assignments } from './pages/Assignments';
import { AssignmentDetails } from './pages/AssignmentDetails';
import { Attendance } from './pages/Attendance';
import { Grades } from './pages/Grades';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from 'sonner';

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="schedule" element={<ScheduleClass />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:id" element={<AssignmentDetails />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="grades" element={<Grades />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  );
}
