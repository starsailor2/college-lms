import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'student' | 'professor' | null;
export interface User { id: string; name: string; email: string; role: Role; avatar?: string; }
export type QuizType = 'simple' | 'advanced';
export type QuestionType = 'mcq' | 'multi';
export interface QuizOption { id: string; text: string; }
export interface QuizQuestion { id: string; type: QuestionType; text: string; options: QuizOption[]; correctOptionIds: string[]; points: number; }

export interface Course { id: string; title: string; code: string; studentsCount?: number; progress?: number; professorId?: string; thumbnail?: string; }

export interface Assignment {
  id: string; courseId: string; title: string; description: string; deadline: string;
  weightage?: number; questions?: QuizQuestion[];
  attachmentUrl?: string; attachmentName?: string;
}

export interface Submission { id: string; assignmentId: string; studentId: string; studentName: string; status: 'pending'|'submitted'|'graded'; submittedAt?: string; marks?: number; feedback?: string; }
export interface ClassSession { id: string; courseId: string; title: string; date: string; platform: 'Teams'|'Google Meet'; link: string; }
export interface Announcement { id: string; courseId: string; title: string; content: string; date: string; authorName: string; }
export interface AttendanceRecord { id: string; courseId: string; studentId: string; studentName: string; date: string; joinTime: string; leaveTime: string; status: 'Present'|'Absent'; duration: string; }

export interface AssignmentAttempt {
  id: string; assignmentId: string; studentId: string; studentName: string;
  answers: Record<string, string[]>;
  startedAt: string; submittedAt?: string;
  score?: number; totalPoints?: number;
  status: 'in_progress' | 'submitted';
}

export interface Quiz {
  id: string; courseId: string; title: string; type: QuizType; questions: QuizQuestion[];
  timeLimitMinutes: number; startTime: string; endTime: string;
  attemptsAllowed: number; shuffleQuestions: boolean; shuffleOptions: boolean;
  showResultsAfter: 'immediately'|'after_end'|'manual'; createdBy: string; createdAt: string;
}

export interface QuizAttempt {
  id: string; quizId: string; studentId: string; studentName: string;
  answers: Record<string, string[]>;
  startedAt: string; submittedAt?: string;
  score?: number; totalPoints?: number; status: 'in_progress'|'submitted';
}

export function scoreAnswers(questions: QuizQuestion[], answers: Record<string, string[]>): { score: number; totalPoints: number } {
  let score = 0, totalPoints = 0;
  for (const q of questions) {
    totalPoints += q.points;
    const chosen = answers[q.id] || [];
    const correct = q.correctOptionIds;
    if (chosen.length === correct.length && chosen.every(id => correct.includes(id))) score += q.points;
  }
  return { score, totalPoints };
}

export function scoreAttempt(quiz: Quiz, answers: Record<string, string[]>) {
  return scoreAnswers(quiz.questions, answers);
}

interface LmsStore {
  user: User | null;
  courses: Course[]; assignments: Assignment[]; submissions: Submission[];
  classes: ClassSession[]; attendance: AttendanceRecord[]; announcements: Announcement[];
  quizzes: Quiz[]; quizAttempts: QuizAttempt[];
  assignmentAttempts: AssignmentAttempt[];
  isAttendanceApproved: boolean;
  login: (role: Role) => void; logout: () => void;
  createCourse: (c: Course) => void;
  createAssignment: (a: Assignment) => void;
  editAssignment: (id: string, updates: Partial<Assignment>) => void;
  scheduleClass: (s: ClassSession) => void;
  submitAssignment: (assignmentId: string, fileUrl?: string, fileName?: string) => void;
  gradeSubmission: (id: string, marks: number, feedback?: string) => void;
  approveAttendance: (id: string) => void;
  approveAllAttendance: () => void;
  createAnnouncement: (a: Announcement) => void;
  createQuiz: (q: Quiz) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  startAttempt: (quizId: string) => QuizAttempt;
  saveAnswer: (attemptId: string, questionId: string, optionIds: string[]) => void;
  submitAttempt: (attemptId: string) => void;
  startAssignmentAttempt: (assignmentId: string) => AssignmentAttempt;
  saveAssignmentAnswer: (attemptId: string, questionId: string, optionIds: string[]) => void;
  submitAssignmentAttempt: (attemptId: string) => void;
}

function uid() { return Math.random().toString(36).slice(2, 10); }

function generateMockData() {
  const mockCourses: Course[] = [
    { id: '1', title: 'Introduction to Computer Science', code: 'CS101', studentsCount: 45, progress: 65, professorId: 'prof1' },
    { id: '2', title: 'Advanced Web Development', code: 'CS302', studentsCount: 32, progress: 40, professorId: 'prof1' },
    { id: '3', title: 'Data Structures and Algorithms', code: 'CS201', studentsCount: 50, progress: 85, professorId: 'prof1' },
  ];

  const mockAssignments: Assignment[] = [
    {
      id: '1', courseId: '1', title: 'Python Basics', description: 'Test your understanding of Python fundamentals including syntax, data types, and basic operations.', deadline: new Date(Date.now() + 86400000 * 2).toISOString(), weightage: 10,
      questions: [
        { id: 'a1q1', type: 'mcq', text: 'What is the correct syntax to print "Hello World" in Python?', points: 10, options: [{ id: 'a1q1o1', text: 'print("Hello World")' }, { id: 'a1q1o2', text: 'echo("Hello World")' }, { id: 'a1q1o3', text: 'printf("Hello World")' }, { id: 'a1q1o4', text: 'System.out.println("Hello World")' }], correctOptionIds: ['a1q1o1'] },
        { id: 'a1q2', type: 'mcq', text: 'Which data type is used to store True or False in Python?', points: 10, options: [{ id: 'a1q2o1', text: 'int' }, { id: 'a1q2o2', text: 'str' }, { id: 'a1q2o3', text: 'bool' }, { id: 'a1q2o4', text: 'float' }], correctOptionIds: ['a1q2o3'] },
        { id: 'a1q3', type: 'mcq', text: 'What does len([1, 2, 3]) return?', points: 10, options: [{ id: 'a1q3o1', text: '1' }, { id: 'a1q3o2', text: '2' }, { id: 'a1q3o3', text: '3' }, { id: 'a1q3o4', text: '4' }], correctOptionIds: ['a1q3o3'] },
      ]
    },
    {
      id: '2', courseId: '2', title: 'React Fundamentals Check', description: 'Assess your understanding of React core concepts including hooks, JSX, and component lifecycle.', deadline: new Date(Date.now() + 86400000 * 5).toISOString(), weightage: 10,
      questions: [
        { id: 'a2q1', type: 'mcq', text: 'Which hook is used to manage state in React functional components?', points: 10, options: [{ id: 'a2q1o1', text: 'useEffect' }, { id: 'a2q1o2', text: 'useState' }, { id: 'a2q1o3', text: 'useRef' }, { id: 'a2q1o4', text: 'useMemo' }], correctOptionIds: ['a2q1o2'] },
        { id: 'a2q2', type: 'mcq', text: 'What does JSX stand for?', points: 10, options: [{ id: 'a2q2o1', text: 'JavaScript XML' }, { id: 'a2q2o2', text: 'Java Syntax Extension' }, { id: 'a2q2o3', text: 'JSON XML' }, { id: 'a2q2o4', text: 'JavaScript Extension' }], correctOptionIds: ['a2q2o1'] },
        { id: 'a2q3', type: 'mcq', text: 'Which method runs after a class component mounts?', points: 10, options: [{ id: 'a2q3o1', text: 'componentWillMount' }, { id: 'a2q3o2', text: 'componentDidMount' }, { id: 'a2q3o3', text: 'render' }, { id: 'a2q3o4', text: 'constructor' }], correctOptionIds: ['a2q3o2'] },
      ]
    },
    {
      id: '3', courseId: '3', title: 'BST Concepts', description: 'Evaluate your grasp of Binary Search Trees — properties, traversals, and complexity analysis.', deadline: new Date(Date.now() - 86400000 * 1).toISOString(), weightage: 10,
      questions: [
        { id: 'a3q1', type: 'mcq', text: 'What is the average case time complexity of search in a BST?', points: 10, options: [{ id: 'a3q1o1', text: 'O(1)' }, { id: 'a3q1o2', text: 'O(log n)' }, { id: 'a3q1o3', text: 'O(n)' }, { id: 'a3q1o4', text: 'O(n²)' }], correctOptionIds: ['a3q1o2'] },
        { id: 'a3q2', type: 'mcq', text: 'Which traversal of a BST gives elements in sorted order?', points: 10, options: [{ id: 'a3q2o1', text: 'Pre-order' }, { id: 'a3q2o2', text: 'Post-order' }, { id: 'a3q2o3', text: 'In-order' }, { id: 'a3q2o4', text: 'Level-order' }], correctOptionIds: ['a3q2o3'] },
        { id: 'a3q3', type: 'mcq', text: 'In a BST, for any node, the left subtree contains:', points: 10, options: [{ id: 'a3q3o1', text: 'Larger values' }, { id: 'a3q3o2', text: 'Smaller values' }, { id: 'a3q3o3', text: 'Equal values' }, { id: 'a3q3o4', text: 'Random values' }], correctOptionIds: ['a3q3o2'] },
      ]
    },
    {
      id: '4', courseId: '1', title: 'Hello World Concepts', description: 'Basic introductory questions on programming concepts and Python syntax for beginners.', deadline: new Date(Date.now() - 86400000 * 10).toISOString(), weightage: 10,
      questions: [
        { id: 'a4q1', type: 'mcq', text: "What is Python's syntax to output text to the screen?", points: 10, options: [{ id: 'a4q1o1', text: 'System.out.print()' }, { id: 'a4q1o2', text: 'console.log()' }, { id: 'a4q1o3', text: 'print()' }, { id: 'a4q1o4', text: 'echo()' }], correctOptionIds: ['a4q1o3'] },
        { id: 'a4q2', type: 'mcq', text: 'Which of these is a valid Python single-line comment?', points: 10, options: [{ id: 'a4q2o1', text: '// comment' }, { id: 'a4q2o2', text: '/* comment */' }, { id: 'a4q2o3', text: '# comment' }, { id: 'a4q2o4', text: '<!-- comment -->' }], correctOptionIds: ['a4q2o3'] },
      ]
    },
  ];

  const mockSubmissions: Submission[] = [
    { id: 's1', assignmentId: '3', studentId: 'stu1', studentName: 'Alex Carter', status: 'submitted', submittedAt: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: 's2', assignmentId: '4', studentId: 'stu1', studentName: 'Alex Carter', status: 'graded', submittedAt: new Date(Date.now() - 86400000 * 11).toISOString(), marks: 100, feedback: 'Great job!' },
  ];

  const mockClasses: ClassSession[] = [
    { id: '1', courseId: '1', title: 'Arrays and Strings', date: new Date(Date.now() + 3600000 * 2).toISOString(), platform: 'Google Meet', link: 'https://meet.google.com/abc-defg-hij' },
  ];

  const mockAttendance: AttendanceRecord[] = [
    { id: '1', courseId: '1', studentId: 'stu1', studentName: 'Alex Carter', date: new Date().toISOString(), joinTime: '09:00 AM', leaveTime: '10:30 AM', status: 'Present', duration: '1h 30m' },
    { id: '2', courseId: '1', studentId: 'stu2', studentName: 'Sarah Jenkins', date: new Date().toISOString(), joinTime: '09:15 AM', leaveTime: '10:30 AM', status: 'Present', duration: '1h 15m' },
    { id: '3', courseId: '2', studentId: 'stu3', studentName: 'Michael Chang', date: new Date().toISOString(), joinTime: '-', leaveTime: '-', status: 'Absent', duration: '0h 0m' },
  ];

  const mockAnnouncements: Announcement[] = [
    { id: '1', courseId: '1', title: 'Welcome to CS101!', content: 'Please review the syllabus before our first class.', date: new Date(Date.now() - 86400000 * 5).toISOString(), authorName: 'Prof. Alan Turing' },
    { id: '2', courseId: '1', title: 'Assignment 1 Released', content: 'Python Basics assignment is now live. Due in 2 days.', date: new Date(Date.now() - 3600000 * 12).toISOString(), authorName: 'Prof. Alan Turing' },
  ];

  const mockQuizzes: Quiz[] = [
    {
      id: 'q1', courseId: '1', title: 'CS101 Midterm: Python Fundamentals', type: 'advanced',
      timeLimitMinutes: 30, startTime: new Date(Date.now() - 3600000 * 2).toISOString(), endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
      attemptsAllowed: 1, shuffleQuestions: true, shuffleOptions: false, showResultsAfter: 'immediately',
      createdBy: 'prof1', createdAt: new Date(Date.now() - 86400000).toISOString(),
      questions: [
        { id: 'qq1', type: 'mcq', text: 'Which of the following is NOT a valid Python data type?', points: 10, options: [{ id: 'o1', text: 'int' }, { id: 'o2', text: 'float' }, { id: 'o3', text: 'char' }, { id: 'o4', text: 'bool' }], correctOptionIds: ['o3'] },
        { id: 'qq2', type: 'mcq', text: 'What does the `len()` function return for the string "Hello"?', points: 10, options: [{ id: 'o5', text: '4' }, { id: 'o6', text: '5' }, { id: 'o7', text: '6' }, { id: 'o8', text: 'Error' }], correctOptionIds: ['o6'] },
        { id: 'qq3', type: 'multi', text: 'Which of the following are mutable data structures in Python?', points: 15, options: [{ id: 'o9', text: 'List' }, { id: 'o10', text: 'Tuple' }, { id: 'o11', text: 'Dictionary' }, { id: 'o12', text: 'String' }], correctOptionIds: ['o9', 'o11'] },
        { id: 'qq4', type: 'mcq', text: 'What is the output of `print(2 ** 3)`?', points: 10, options: [{ id: 'o13', text: '6' }, { id: 'o14', text: '8' }, { id: 'o15', text: '9' }, { id: 'o16', text: '5' }], correctOptionIds: ['o14'] },
        { id: 'qq5', type: 'mcq', text: 'Which keyword defines a function in Python?', points: 10, options: [{ id: 'o17', text: 'func' }, { id: 'o18', text: 'function' }, { id: 'o19', text: 'def' }, { id: 'o20', text: 'define' }], correctOptionIds: ['o19'] },
      ],
    },
    {
      id: 'q2', courseId: '2', title: 'Web Dev Quick Check — JavaScript', type: 'simple',
      timeLimitMinutes: 15, startTime: new Date(Date.now() - 86400000).toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(),
      attemptsAllowed: 1, shuffleQuestions: false, shuffleOptions: false, showResultsAfter: 'immediately',
      createdBy: 'prof1', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      questions: [
        { id: 'qq6', type: 'mcq', text: 'Which method selects an element by its ID?', points: 10, options: [{ id: 'o21', text: 'document.getElement()' }, { id: 'o22', text: 'document.getElementById()' }, { id: 'o23', text: 'document.selectById()' }, { id: 'o24', text: 'document.queryId()' }], correctOptionIds: ['o22'] },
        { id: 'qq7', type: 'mcq', text: 'What does `===` check in JavaScript?', points: 10, options: [{ id: 'o25', text: 'Value only' }, { id: 'o26', text: 'Type only' }, { id: 'o27', text: 'Value and type' }, { id: 'o28', text: 'Neither' }], correctOptionIds: ['o27'] },
        { id: 'qq8', type: 'mcq', text: 'Which declares a constant in JS?', points: 10, options: [{ id: 'o29', text: 'var' }, { id: 'o30', text: 'let' }, { id: 'o31', text: 'const' }, { id: 'o32', text: 'static' }], correctOptionIds: ['o31'] },
      ],
    },
  ];

  const mockQuizAttempts: QuizAttempt[] = [
    { id: 'qa1', quizId: 'q2', studentId: 'stu1', studentName: 'Alex Carter', answers: { 'qq6': ['o22'], 'qq7': ['o25'], 'qq8': ['o31'] }, startedAt: new Date(Date.now() - 86400000 - 3600000).toISOString(), submittedAt: new Date(Date.now() - 86400000).toISOString(), score: 20, totalPoints: 30, status: 'submitted' },
  ];

  const mockAssignmentAttempts: AssignmentAttempt[] = [
    { id: 'aa1', assignmentId: '4', studentId: 'stu1', studentName: 'Alex Carter', answers: { 'a4q1': ['a4q1o3'], 'a4q2': ['a4q2o3'] }, startedAt: new Date(Date.now() - 86400000 * 11 - 3600000).toISOString(), submittedAt: new Date(Date.now() - 86400000 * 11).toISOString(), score: 20, totalPoints: 20, status: 'submitted' },
  ];

  return { mockCourses, mockAssignments, mockSubmissions, mockClasses, mockAttendance, mockAnnouncements, mockQuizzes, mockQuizAttempts, mockAssignmentAttempts };
}

export const useStore = create<LmsStore>()(
  persist(
    (set, get) => {
      const { mockCourses, mockAssignments, mockSubmissions, mockClasses, mockAttendance, mockAnnouncements, mockQuizzes, mockQuizAttempts, mockAssignmentAttempts } = generateMockData();
      return {
        user: null, courses: mockCourses, assignments: mockAssignments, submissions: mockSubmissions,
        classes: mockClasses, attendance: mockAttendance, announcements: mockAnnouncements,
        quizzes: mockQuizzes, quizAttempts: mockQuizAttempts,
        assignmentAttempts: mockAssignmentAttempts, isAttendanceApproved: false,

        login: (role) => set({ user: { id: role === 'professor' ? 'prof1' : 'stu1', name: role === 'professor' ? 'Prof. Alan Turing' : 'Alex Carter', email: role === 'professor' ? 'alan@university.edu' : 'alex@student.edu', role, avatar: role === 'professor' ? 'https://api.dicebear.com/7.x/notionists/svg?seed=alan' : 'https://api.dicebear.com/7.x/notionists/svg?seed=alex' } }),
        logout: () => set({ user: null }),
        createCourse: (c) => set((s) => ({ courses: [...s.courses, c] })),
        createAssignment: (a) => set((s) => ({ assignments: [a, ...s.assignments] })),
        editAssignment: (id, updates) => set((s) => ({ assignments: s.assignments.map(a => a.id === id ? { ...a, ...updates } : a) })),
        scheduleClass: (session) => set((s) => ({ classes: [...s.classes, session] })),
        submitAssignment: (assignmentId, fileUrl, fileName) => set((s) => {
          if (!s.user || s.user.role !== 'student') return s;
          const existing = s.submissions.find(x => x.assignmentId === assignmentId && x.studentId === s.user!.id);
          if (existing) return { submissions: s.submissions.map(x => x.id === existing.id ? { ...x, status: 'submitted', submittedAt: new Date().toISOString() } : x) };
          return { submissions: [...s.submissions, { id: Math.random().toString(), assignmentId, studentId: s.user.id, studentName: s.user.name, status: 'submitted', submittedAt: new Date().toISOString() }] };
        }),
        gradeSubmission: (id, marks, feedback) => set((s) => ({ submissions: s.submissions.map(x => x.id === id ? { ...x, status: 'graded', marks, feedback } : x) })),
        approveAttendance: (id) => set((s) => ({ attendance: s.attendance.map(a => a.id === id ? { ...a, status: 'Present' } : a) })),
        approveAllAttendance: () => set({ isAttendanceApproved: true }),
        createAnnouncement: (a) => set((s) => ({ announcements: [a, ...s.announcements] })),
        createQuiz: (q) => set((s) => ({ quizzes: [q, ...s.quizzes] })),
        updateQuiz: (id, updates) => set((s) => ({ quizzes: s.quizzes.map(q => q.id === id ? { ...q, ...updates } : q) })),
        deleteQuiz: (id) => set((s) => ({ quizzes: s.quizzes.filter(q => q.id !== id) })),
        startAttempt: (quizId) => {
          const s = get(); if (!s.user) throw new Error('Not logged in');
          const a: QuizAttempt = { id: uid(), quizId, studentId: s.user.id, studentName: s.user.name, answers: {}, startedAt: new Date().toISOString(), status: 'in_progress' };
          set((st) => ({ quizAttempts: [...st.quizAttempts, a] })); return a;
        },
        saveAnswer: (attemptId, questionId, optionIds) => set((s) => ({ quizAttempts: s.quizAttempts.map(a => a.id === attemptId ? { ...a, answers: { ...a.answers, [questionId]: optionIds } } : a) })),
        submitAttempt: (attemptId) => set((s) => {
          const attempt = s.quizAttempts.find(a => a.id === attemptId); if (!attempt) return s;
          const quiz = s.quizzes.find(q => q.id === attempt.quizId); if (!quiz) return s;
          const { score, totalPoints } = scoreAttempt(quiz, attempt.answers);
          return { quizAttempts: s.quizAttempts.map(a => a.id === attemptId ? { ...a, status: 'submitted', submittedAt: new Date().toISOString(), score, totalPoints } : a) };
        }),
        startAssignmentAttempt: (assignmentId) => {
          const s = get(); if (!s.user) throw new Error('Not logged in');
          const existing = s.assignmentAttempts.find(a => a.assignmentId === assignmentId && a.studentId === s.user!.id);
          if (existing) return existing;
          const a: AssignmentAttempt = { id: uid(), assignmentId, studentId: s.user.id, studentName: s.user.name, answers: {}, startedAt: new Date().toISOString(), status: 'in_progress' };
          set((st) => ({ assignmentAttempts: [...st.assignmentAttempts, a] })); return a;
        },
        saveAssignmentAnswer: (attemptId, questionId, optionIds) => set((s) => ({ assignmentAttempts: s.assignmentAttempts.map(a => a.id === attemptId ? { ...a, answers: { ...a.answers, [questionId]: optionIds } } : a) })),
        submitAssignmentAttempt: (attemptId) => set((s) => {
          const attempt = s.assignmentAttempts.find(a => a.id === attemptId); if (!attempt) return s;
          const assignment = s.assignments.find(a => a.id === attempt.assignmentId); if (!assignment?.questions) return s;
          const { score, totalPoints } = scoreAnswers(assignment.questions, attempt.answers);
          return { assignmentAttempts: s.assignmentAttempts.map(a => a.id === attemptId ? { ...a, status: 'submitted', submittedAt: new Date().toISOString(), score, totalPoints } : a) };
        }),
      };
    },
    { name: 'lms-store-v5' }
  )
);
