import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'student' | 'professor' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  studentsCount?: number;
  progress?: number;
  professorId?: string;
  thumbnail?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  deadline: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  status: 'pending' | 'submitted' | 'graded';
  submittedAt?: string;
  marks?: number;
  feedback?: string;
}

export interface ClassSession {
  id: string;
  courseId: string;
  title: string;
  date: string;
  platform: 'Teams' | 'Google Meet';
  link: string;
}

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  date: string;
  authorName: string;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  date: string;
  joinTime: string;
  leaveTime: string;
  status: 'Present' | 'Absent';
  duration: string;
}

interface LmsStore {
  user: User | null;
  courses: Course[];
  assignments: Assignment[];
  submissions: Submission[];
  classes: ClassSession[];
  attendance: AttendanceRecord[];
  announcements: Announcement[];
  
  // Actions
  login: (role: Role) => void;
  logout: () => void;
  createCourse: (course: Course) => void;
  createAssignment: (assignment: Assignment) => void;
  scheduleClass: (session: ClassSession) => void;
  submitAssignment: (assignmentId: string, fileUrl?: string, fileName?: string) => void;
  gradeSubmission: (submissionId: string, marks: number, feedback?: string) => void;
  editAssignment: (assignmentId: string, updates: Partial<Assignment>) => void;
  approveAttendance: (recordId: string) => void;
  approveAllAttendance: () => void;
  isAttendanceApproved: boolean;
  createAnnouncement: (announcement: Announcement) => void;
}

const generateMockData = () => {
  const mockCourses: Course[] = [
    { id: '1', title: 'Introduction to Computer Science', code: 'CS101', studentsCount: 45, progress: 65, professorId: 'prof1' },
    { id: '2', title: 'Advanced Web Development', code: 'CS302', studentsCount: 32, progress: 40, professorId: 'prof1' },
    { id: '3', title: 'Data Structures and Algorithms', code: 'CS201', studentsCount: 50, progress: 85, professorId: 'prof1' }
  ];

  const mockAssignments: Assignment[] = [
    { id: '1', courseId: '1', title: 'Python Basics Quiz', description: 'Complete the quiz on canvas.', deadline: new Date(Date.now() + 86400000 * 2).toISOString() },
    { id: '2', courseId: '2', title: 'React UI Clone', description: 'Clone a popular website UI using React and Tailwind.', deadline: new Date(Date.now() + 86400000 * 5).toISOString() },
    { id: '3', courseId: '3', title: 'BST Implementation', description: 'Implement a Binary Search Tree in C++.', deadline: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: '4', courseId: '1', title: 'Hello World', description: 'Write your first program.', deadline: new Date(Date.now() - 86400000 * 10).toISOString() }
  ];

  const mockSubmissions: Submission[] = [
    { id: 's1', assignmentId: '3', studentId: 'stu1', studentName: 'Alex Carter', status: 'submitted', submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(), submittedFileName: 'bst_implementation_alex.cpp', submittedFileUrl: '#' },
    { id: 's2', assignmentId: '4', studentId: 'stu1', studentName: 'Alex Carter', status: 'graded', submittedAt: new Date(Date.now() - 86400000 * 11).toISOString(), marks: 100, feedback: 'Great job!', submittedFileName: 'hello_world.py', submittedFileUrl: '#' },
    { id: 's3', assignmentId: '3', studentId: 'stu2', studentName: 'Sarah Jenkins', status: 'submitted', submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(), submittedFileName: 'sarah_bst_v2.cpp', submittedFileUrl: '#' },
    { id: 's4', assignmentId: '4', studentId: 'stu2', studentName: 'Sarah Jenkins', status: 'graded', submittedAt: new Date(Date.now() - 86400000 * 12).toISOString(), marks: 85, feedback: 'Good, but missed some edge cases.', submittedFileName: 'hello_world.py', submittedFileUrl: '#' }
  ];

  const mockClasses: ClassSession[] = [
    { id: '1', courseId: '1', title: 'Arrays and Strings', date: new Date(Date.now() + 3600000 * 2).toISOString(), platform: 'Google Meet', link: 'https://meet.google.com/abc-defg-hij' }
  ];

  const mockAttendance: AttendanceRecord[] = [
    { id: '1', courseId: '1', studentId: 'stu1', studentName: 'Alex Carter', date: new Date().toISOString(), joinTime: '09:00 AM', leaveTime: '10:30 AM', status: 'Present', duration: '1h 30m' },
    { id: '2', courseId: '1', studentId: 'stu2', studentName: 'Sarah Jenkins', date: new Date().toISOString(), joinTime: '09:15 AM', leaveTime: '10:30 AM', status: 'Present', duration: '1h 15m' },
    { id: '3', courseId: '2', studentId: 'stu3', studentName: 'Michael Chang', date: new Date().toISOString(), joinTime: '-', leaveTime: '-', status: 'Absent', duration: '0h 0m' }
  ];

  const mockAnnouncements: Announcement[] = [
    { id: '1', courseId: '1', title: 'Welcome to CS101!', content: 'Please review the syllabus before our first class. Let me know if you have any questions.', date: new Date(Date.now() - 86400000 * 5).toISOString(), authorName: 'Prof. Alan Turing' },
    { id: '2', courseId: '1', title: 'Quiz 1 Reminder', content: 'Do not forget that Quiz 1 is due this Friday at midnight.', date: new Date(Date.now() - 3600000 * 12).toISOString(), authorName: 'Prof. Alan Turing' }
  ];

  return { mockCourses, mockAssignments, mockSubmissions, mockClasses, mockAttendance, mockAnnouncements };
}

export const useStore = create<LmsStore>()(
  persist(
    (set, get) => {
      const { mockCourses, mockAssignments, mockSubmissions, mockClasses, mockAttendance, mockAnnouncements } = generateMockData();
      
      return {
    user: null,
    courses: mockCourses,
    assignments: mockAssignments,
    submissions: mockSubmissions,
    classes: mockClasses,
    attendance: mockAttendance,
    announcements: mockAnnouncements,
    isAttendanceApproved: false,

    login: (role) => set({ 
      user: { 
        id: role === 'professor' ? 'prof1' : 'stu1', 
        name: role === 'professor' ? 'Prof. Alan Turing' : 'Alex Carter', 
        email: role === 'professor' ? 'alan@university.edu' : 'alex@student.edu', 
        role,
        avatar: role === 'professor' ? 'https://api.dicebear.com/7.x/notionists/svg?seed=alan' : 'https://api.dicebear.com/7.x/notionists/svg?seed=alex'
      } 
    }),
    
    logout: () => set({ user: null }),
    
    createCourse: (course) => set((state) => ({ courses: [...state.courses, course] })),
    
    createAssignment: (assignment) => set((state) => ({ assignments: [...state.assignments, assignment] })),
    
    scheduleClass: (session) => set((state) => ({ classes: [...state.classes, session] })),
    
    submitAssignment: (assignmentId, fileUrl, fileName) => set((state) => {
      if (!state.user || state.user.role !== 'student') return state;
      const existing = state.submissions.find(s => s.assignmentId === assignmentId && s.studentId === state.user!.id);
      if (existing) {
        return {
          submissions: state.submissions.map(s => s.id === existing.id ? { ...s, status: 'submitted', submittedAt: new Date().toISOString(), submittedFileUrl: fileUrl, submittedFileName: fileName } : s)
        };
      } else {
        return {
          submissions: [...state.submissions, {
            id: Math.random().toString(),
            assignmentId,
            studentId: state.user.id,
            studentName: state.user.name,
            status: 'submitted',
            submittedAt: new Date().toISOString(),
            submittedFileUrl: fileUrl,
            submittedFileName: fileName
          }]
        };
      }
    }),
    
    gradeSubmission: (submissionId, marks, feedback) => set((state) => ({
      submissions: state.submissions.map(s => s.id === submissionId ? { ...s, status: 'graded', marks, feedback } : s)
    })),

    editAssignment: (assignmentId, updates) => set((state) => ({
      assignments: state.assignments.map(a => a.id === assignmentId ? { ...a, ...updates } : a)
    })),

    approveAttendance: (recordId) => set((state) => ({
      attendance: state.attendance.map(a => a.id === recordId ? { ...a, status: 'Present' } : a)
    })),

    approveAllAttendance: () => set({ isAttendanceApproved: true }),

    createAnnouncement: (announcement) => set((state) => ({ announcements: [announcement, ...state.announcements] }))
  };
},
{
  name: 'lms-store-v3',
}
));
