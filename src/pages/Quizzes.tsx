import { useStore, Quiz, QuizQuestion, QuizOption, QuizType } from '@/store';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PlusCircle, ClipboardCheck, Timer, ChevronRight, Trash2,
  Clock, BookOpen, Users, Zap, Lock, CheckSquare, LayoutGrid,
  ToggleLeft, X, Plus, Check, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }
function emptyOption(): QuizOption { return { id: uid(), text: '' }; }
function emptyQuestion(): QuizQuestion {
  return {
    id: uid(), type: 'mcq', text: '',
    options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
    correctOptionIds: [], points: 10,
  };
}

// ─── Quiz Status Badge ────────────────────────────────────────────────────────
function QuizStatusBadge({ quiz }: { quiz: Quiz }) {
  const now = Date.now();
  const start = new Date(quiz.startTime).getTime();
  const end = new Date(quiz.endTime).getTime();
  if (now < start) return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Upcoming</Badge>;
  if (now > end)   return <Badge className="bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100">Closed</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">● Live</Badge>;
}

// ─── Question Builder ─────────────────────────────────────────────────────────
function QuestionBuilder({ questions, onChange }: { questions: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void }) {
  const updateQ = (idx: number, patch: Partial<QuizQuestion>) =>
    onChange(questions.map((q, i) => i === idx ? { ...q, ...patch } : q));

  const addQ = () => onChange([...questions, emptyQuestion()]);
  const removeQ = (idx: number) => onChange(questions.filter((_, i) => i !== idx));

  const updateOption = (qIdx: number, oIdx: number, text: string) => {
    const options = questions[qIdx].options.map((o, i) => i === oIdx ? { ...o, text } : o);
    updateQ(qIdx, { options });
  };

  const addOption = (qIdx: number) => updateQ(qIdx, { options: [...questions[qIdx].options, emptyOption()] });
  const removeOption = (qIdx: number, oIdx: number) =>
    updateQ(qIdx, { options: questions[qIdx].options.filter((_, i) => i !== oIdx) });

  const toggleCorrect = (qIdx: number, optionId: string) => {
    const q = questions[qIdx];
    if (q.type === 'mcq') {
      updateQ(qIdx, { correctOptionIds: [optionId] });
    } else {
      const already = q.correctOptionIds.includes(optionId);
      updateQ(qIdx, {
        correctOptionIds: already
          ? q.correctOptionIds.filter(id => id !== optionId)
          : [...q.correctOptionIds, optionId]
      });
    }
  };

  return (
    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
      {questions.map((q, qIdx) => (
        <div key={q.id} className="border border-border rounded-xl p-4 bg-secondary/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">Q{qIdx + 1}</span>
            <Select value={q.type} onValueChange={(v) => updateQ(qIdx, { type: v as any, correctOptionIds: [] })}>
              <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">MCQ (single)</SelectItem>
                <SelectItem value="multi">Multi-select</SelectItem>
              </SelectContent>
            </Select>
            <Input className="h-7 text-xs w-16" type="number" min={1} value={q.points}
              onChange={e => updateQ(qIdx, { points: Number(e.target.value) })} />
            <span className="text-xs text-muted-foreground">pts</span>
            {questions.length > 1 && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive ml-auto" onClick={() => removeQ(qIdx)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <Input className="text-sm" placeholder="Question text..." value={q.text}
            onChange={e => updateQ(qIdx, { text: e.target.value })} />

          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Options — click ✓ to mark correct answer{q.type === 'multi' ? 's' : ''}
            </p>
            {q.options.map((opt, oIdx) => {
              const isCorrect = q.correctOptionIds.includes(opt.id);
              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <button type="button" onClick={() => toggleCorrect(qIdx, opt.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                      isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-border bg-background hover:border-green-400'
                    }`}>
                    {isCorrect && <Check className="w-3 h-3" />}
                  </button>
                  <Input className="h-8 text-xs flex-1" placeholder={`Option ${oIdx + 1}`}
                    value={opt.text} onChange={e => updateOption(qIdx, oIdx, e.target.value)} />
                  {q.options.length > 2 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground"
                      onClick={() => removeOption(qIdx, oIdx)}>
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              );
            })}
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground"
              onClick={() => addOption(qIdx)}>
              <Plus className="w-3 h-3 mr-1" /> Add Option
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={addQ}>
        <PlusCircle className="w-4 h-4" /> Add Question
      </Button>
    </div>
  );
}

// ─── Create Quiz Dialog ───────────────────────────────────────────────────────
function CreateQuizDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, courses, createQuiz } = useStore();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [quizType, setQuizType] = useState<QuizType>('advanced');
  const [timeLimit, setTimeLimit] = useState(30);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [shuffleQ, setShuffleQ] = useState(false);
  const [shuffleO, setShuffleO] = useState(false);
  const [showResults, setShowResults] = useState<'immediately' | 'after_end' | 'manual'>('immediately');
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);

  const reset = () => {
    setStep(1); setTitle(''); setCourseId(''); setQuizType('advanced');
    setTimeLimit(30); setStartTime(''); setEndTime('');
    setShuffleQ(false); setShuffleO(false); setShowResults('immediately');
    setQuestions([emptyQuestion()]);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleNext = () => {
    if (!title.trim()) { toast.error('Enter a quiz title'); return; }
    if (!courseId) { toast.error('Select a course'); return; }
    if (!startTime || !endTime) { toast.error('Set start and end times'); return; }
    if (timeLimit < 1) { toast.error('Time limit must be at least 1 minute'); return; }
    setStep(2);
  };

  const handleCreate = () => {
    const invalid = questions.find(q =>
      !q.text.trim() || q.correctOptionIds.length === 0 || q.options.some(o => !o.text.trim())
    );
    if (invalid) { toast.error('Complete all questions and mark correct answers (green)'); return; }

    createQuiz({
      id: uid(), courseId, title, type: quizType, questions,
      timeLimitMinutes: timeLimit,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      attemptsAllowed: 1,             // enforced: always 1
      shuffleQuestions: shuffleQ,
      shuffleOptions: shuffleO,
      showResultsAfter: showResults,
      createdBy: user!.id,
      createdAt: new Date().toISOString()
    });
    toast.success('Quiz published successfully!');
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            {step === 1 ? 'Create Quiz — Settings' : 'Create Quiz — Questions'}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Configure quiz timing and behaviour. Each student gets exactly one attempt.'
              : 'Add questions and click the checkbox to mark correct answers.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex gap-2 mb-1">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Quiz Title</Label>
                <Input placeholder="e.g. Midterm — Python Fundamentals" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Quiz Type</Label>
                <Select value={quizType} onValueChange={(v) => setQuizType(v as QuizType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple (MCQ only)</SelectItem>
                    <SelectItem value="advanced">Advanced (MCQ + Multi-select)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Time Limit (minutes) <span className="text-destructive">*</span></Label>
                <Input type="number" min={1} value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Attempts Per Student</Label>
                <div className="flex h-10 items-center px-3 rounded-md border border-border bg-secondary/50 text-sm font-semibold text-muted-foreground gap-2">
                  <Lock className="w-3.5 h-3.5" /> 1 (enforced)
                </div>
              </div>
            </div>

            <div className="border border-border rounded-xl p-4 space-y-3 bg-secondary/20">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Behaviour Settings</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: 'Shuffle Questions', val: shuffleQ, set: setShuffleQ },
                  { label: 'Shuffle Options', val: shuffleO, set: setShuffleO },
                ] as const).map(({ label, val, set }) => (
                  <button key={label} type="button" onClick={() => (set as any)(!val)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      val ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background border-border text-muted-foreground'
                    }`}>
                    <ToggleLeft className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Result Visibility</Label>
                <Select value={showResults} onValueChange={(v) => setShowResults(v as any)}>
                  <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Immediately after submission</SelectItem>
                    <SelectItem value="after_end">After quiz end time</SelectItem>
                    <SelectItem value="manual">Manual release</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exam rules reminder */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Strict exam mode:</strong> Students get exactly 1 attempt. Quiz auto-submits when the timer expires. No late submissions are accepted.
              </span>
            </div>
          </div>
        )}

        {step === 2 && <QuestionBuilder questions={questions} onChange={setQuestions} />}

        <DialogFooter className="mt-4 gap-2">
          {step === 2 && <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>}
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          {step === 1 && <Button onClick={handleNext}>Next: Questions →</Button>}
          {step === 2 && <Button onClick={handleCreate}>Publish Quiz</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Quizzes Page ────────────────────────────────────────────────────────
export function Quizzes() {
  const { user, quizzes, courses, quizAttempts, deleteQuiz } = useStore();
  const navigate = useNavigate();
  const isProf = user?.role === 'professor';
  const [createOpen, setCreateOpen] = useState(false);

  const myQuizzes = isProf
    ? quizzes.filter(q => q.createdBy === user!.id)
    : quizzes;

  const now = Date.now();

  const getStudentAttempt = (quizId: string) =>
    quizAttempts.find(a => a.quizId === quizId && a.studentId === user!.id && a.status === 'submitted');

  const getQuizResponseCount = (quizId: string) =>
    quizAttempts.filter(a => a.quizId === quizId && a.status === 'submitted').length;

  const canAttempt = (quiz: Quiz) => {
    const already = getStudentAttempt(quiz.id);
    const isOpen = now >= new Date(quiz.startTime).getTime() && now <= new Date(quiz.endTime).getTime();
    return !already && isOpen;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            {isProf
              ? 'Create and manage quizzes. All quizzes are auto-graded.'
              : 'Each quiz allows exactly one attempt. Results are auto-graded.'}
          </p>
        </div>
        {isProf && (
          <Button className="gap-2 shrink-0" onClick={() => setCreateOpen(true)}>
            <PlusCircle className="w-4 h-4" /> Create Quiz
          </Button>
        )}
      </div>

      {/* Stats — professor */}
      {isProf && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Quizzes', value: myQuizzes.length, icon: ClipboardCheck, color: 'text-primary bg-primary/10' },
            { label: 'Live Now', value: myQuizzes.filter(q => now >= new Date(q.startTime).getTime() && now <= new Date(q.endTime).getTime()).length, icon: Zap, color: 'text-green-600 bg-green-50' },
            { label: 'Upcoming', value: myQuizzes.filter(q => now < new Date(q.startTime).getTime()).length, icon: Timer, color: 'text-blue-600 bg-blue-50' },
            { label: 'Closed', value: myQuizzes.filter(q => now > new Date(q.endTime).getTime()).length, icon: Lock, color: 'text-slate-500 bg-slate-100' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-tight">{value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quiz Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {myQuizzes.map(quiz => {
          const course = courses.find(c => c.id === quiz.courseId);
          const responseCount = getQuizResponseCount(quiz.id);
          const studentAttempt = !isProf ? getStudentAttempt(quiz.id) : undefined;
          const isLive = now >= new Date(quiz.startTime).getTime() && now <= new Date(quiz.endTime).getTime();
          const attempted = !!studentAttempt;

          return (
            <Card key={quiz.id} className="border-border group hover:border-primary/30 hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <QuizStatusBadge quiz={quiz} />
                      <Badge variant="outline" className="text-[10px] font-bold uppercase">
                        {quiz.type === 'advanced'
                          ? <><LayoutGrid className="w-3 h-3 mr-1" />Advanced</>
                          : <><CheckSquare className="w-3 h-3 mr-1" />Simple</>}
                      </Badge>
                      {!isProf && attempted && (
                        <Badge className="bg-slate-100 text-slate-600 text-[10px] border-slate-200 hover:bg-slate-100">
                          <Lock className="w-3 h-3 mr-1" /> Submitted
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base leading-snug truncate">{quiz.title}</CardTitle>
                    <CardDescription className="mt-0.5 flex items-center gap-1.5 text-xs">
                      <BookOpen className="w-3 h-3" />{course?.code} — {course?.title}
                    </CardDescription>
                  </div>
                  {isProf && (
                    <Button variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => { deleteQuiz(quiz.id); toast.success('Quiz deleted'); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: Timer, label: `${quiz.timeLimitMinutes}m`, sub: 'Time Limit' },
                    { icon: ClipboardCheck, label: quiz.questions.length, sub: 'Questions' },
                    isProf
                      ? { icon: Users, label: responseCount, sub: 'Responses' }
                      : { icon: Lock, label: attempted ? 'Done' : '1', sub: attempted ? 'Locked' : 'Attempt' },
                  ].map(({ icon: Icon, label, sub }, i) => (
                    <div key={i} className="bg-secondary/50 rounded-lg p-2 flex flex-col items-center gap-0.5">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground mb-0.5" />
                      <span className="text-sm font-bold leading-none">{label}</span>
                      <span className="text-[10px] text-muted-foreground">{sub}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>
                    {new Date(quiz.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' → '}
                    {new Date(quiz.endTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Student score pill */}
                {!isProf && studentAttempt && (
                  <div className={`mt-3 px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${
                    (studentAttempt.score! / studentAttempt.totalPoints!) >= 0.6
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <span>Score: {studentAttempt.score}/{studentAttempt.totalPoints}</span>
                    <span className="text-[10px] font-bold uppercase opacity-70">Auto-graded</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0 pb-4 gap-2">
                {isProf ? (
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs font-semibold"
                    onClick={() => navigate(`/quizzes/${quiz.id}/results`)}>
                    <Users className="w-3.5 h-3.5" /> View Responses
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  </Button>
                ) : attempted ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 text-xs font-semibold"
                      onClick={() => navigate(`/quizzes/${quiz.id}/results/${studentAttempt!.id}`)}>
                      View Results & Review
                    </Button>
                  </>
                ) : canAttempt(quiz) ? (
                  <Button size="sm" className="w-full gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90"
                    onClick={() => navigate(`/quizzes/${quiz.id}/take`)}>
                    <Zap className="w-3.5 h-3.5" /> Start Quiz
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold" disabled>
                    {now < new Date(quiz.startTime).getTime() ? 'Not Started Yet' : 'Quiz Closed'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}

        {myQuizzes.length === 0 && (
          <div className="col-span-2 py-16 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl text-muted-foreground gap-3">
            <ClipboardCheck className="w-10 h-10 opacity-20" />
            <p className="font-semibold text-sm">No quizzes yet</p>
            {isProf && <p className="text-xs opacity-70">Create your first quiz to get started.</p>}
          </div>
        )}
      </div>

      <CreateQuizDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
