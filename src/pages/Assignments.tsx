import { useStore, Assignment, QuizQuestion, QuizOption } from '@/store';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileText, ClipboardList, Clock, CheckCircle2, AlertCircle, Upload, Check, X, Plus, Trash2, Users, ChevronRight, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

function uid() { return Math.random().toString(36).slice(2, 9); }
function emptyOpt(): QuizOption { return { id: uid(), text: '' }; }
function emptyQ(): QuizQuestion { return { id: uid(), type: 'mcq', text: '', options: [emptyOpt(), emptyOpt(), emptyOpt(), emptyOpt()], correctOptionIds: [], points: 10 }; }

function DeadlineBadge({ deadline }: { deadline: string }) {
  const diff = new Date(deadline).getTime() - Date.now();
  const isOverdue = diff < 0;
  const days = Math.ceil(Math.abs(diff) / 86400000);
  if (isOverdue) return <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Overdue by {days}d</span>;
  if (days <= 2) return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Due in {days}d</span>;
  return <span className="text-[10px] font-bold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full">Due {new Date(deadline).toLocaleDateString()}</span>;
}

function QuestionBuilder({ questions, onChange }: { questions: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void }) {
  const upd = (i: number, p: Partial<QuizQuestion>) => onChange(questions.map((q, idx) => idx === i ? { ...q, ...p } : q));
  const updOpt = (qi: number, oi: number, text: string) => { const opts = questions[qi].options.map((o, i) => i === oi ? { ...o, text } : o); upd(qi, { options: opts }); };
  const toggleCorrect = (qi: number, id: string) => { const q = questions[qi]; upd(qi, { correctOptionIds: q.type === 'mcq' ? [id] : q.correctOptionIds.includes(id) ? q.correctOptionIds.filter(x => x !== id) : [...q.correctOptionIds, id] }); };

  return (
    <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
      {questions.map((q, qi) => (
        <div key={q.id} className="border border-border rounded-xl p-3 bg-secondary/20 space-y-2">
          <div className="flex gap-2 items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Q{qi + 1}</span>
            <Input className="h-7 text-xs flex-1" placeholder="Question..." value={q.text} onChange={e => upd(qi, { text: e.target.value })} />
            <Input className="h-7 w-14 text-xs" type="number" min={1} value={q.points} onChange={e => upd(qi, { points: +e.target.value })} />
            <span className="text-xs text-muted-foreground">pts</span>
            {questions.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onChange(questions.filter((_, i) => i !== qi))}><Trash2 className="w-3 h-3" /></Button>}
          </div>
          <div className="space-y-1">
            {q.options.map((opt, oi) => (
              <div key={opt.id} className="flex gap-2 items-center">
                <button type="button" onClick={() => toggleCorrect(qi, opt.id)} className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${q.correctOptionIds.includes(opt.id) ? 'bg-green-500 border-green-500 text-white' : 'border-border hover:border-green-400'}`}>
                  {q.correctOptionIds.includes(opt.id) && <Check className="w-2.5 h-2.5" />}
                </button>
                <Input className="h-7 text-xs flex-1" placeholder={`Option ${oi + 1}`} value={opt.text} onChange={e => updOpt(qi, oi, e.target.value)} />
                {q.options.length > 2 && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => upd(qi, { options: q.options.filter((_, i) => i !== oi) })}><X className="w-3 h-3" /></Button>}
              </div>
            ))}
            <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={() => upd(qi, { options: [...q.options, emptyOpt()] })}><Plus className="w-3 h-3 mr-1" />Add Option</Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full border-dashed gap-1" onClick={() => onChange([...questions, emptyQ()])}><PlusCircle className="w-3.5 h-3.5" />Add Question</Button>
    </div>
  );
}

function CreateAssignmentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, courses, createAssignment } = useStore();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [weightage, setWeightage] = useState(10);
  const [mode, setMode] = useState<'mcq' | 'pdf'>('mcq');
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQ()]);

  const reset = () => { setStep(1); setTitle(''); setCourseId(''); setDescription(''); setDeadline(''); setWeightage(10); setMode('mcq'); setQuestions([emptyQ()]); };
  const handleClose = () => { reset(); onClose(); };

  const handleNext = () => {
    if (!title.trim() || !courseId || !description.trim() || !deadline) { toast.error('Fill all required fields'); return; }
    if (mode === 'pdf') {
      createAssignment({ id: uid(), courseId, title, description, deadline: new Date(deadline).toISOString(), weightage });
      toast.success('Assignment created!'); handleClose(); return;
    }
    setStep(2);
  };

  const handleCreate = () => {
    const bad = questions.find(q => !q.text.trim() || q.correctOptionIds.length === 0 || q.options.some(o => !o.text.trim()));
    if (bad) { toast.error('Complete all questions and mark correct answers'); return; }
    createAssignment({ id: uid(), courseId, title, description, deadline: new Date(deadline).toISOString(), weightage, questions });
    toast.success('Assignment published!'); handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-amber-600" />{step === 1 ? 'Create Assignment — Details' : 'Create Assignment — Questions'}</DialogTitle>
          <DialogDescription>{step === 1 ? 'Set assignment type, deadline, and weightage.' : 'Add MCQ questions. Click ✓ to mark correct answers.'}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mb-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-border'}`} />
          {mode === 'mcq' && <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-border'}`} />}
        </div>

        {step === 1 && (
          <div className="space-y-3 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2"><Label>Title</Label><Input placeholder="e.g. Python Basics" value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className="space-y-1"><Label>Course</Label>
                <Select value={courseId} onValueChange={setCourseId}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1"><Label>Deadline</Label><Input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
            </div>
            <div className="space-y-1"><Label>Description</Label>
              <textarea className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground" placeholder="Instructions for students..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Weightage (%)</Label><Input type="number" min={1} max={100} value={weightage} onChange={e => setWeightage(+e.target.value)} /></div>
              <div className="space-y-1"><Label>Submission Type</Label>
                <div className="flex gap-2">
                  {(['mcq', 'pdf'] as const).map(m => (
                    <button key={m} type="button" onClick={() => setMode(m)} className={`flex-1 h-10 rounded-lg border-2 text-xs font-bold transition-colors ${mode === m ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-border text-muted-foreground hover:border-amber-300'}`}>
                      {m === 'mcq' ? '📝 MCQ' : '📎 PDF'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {mode === 'pdf' && <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">Students will upload a file. You'll grade it manually in the gradebook.</div>}
            {mode === 'mcq' && <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">Students answer MCQs. Results are auto-graded on submission.</div>}
          </div>
        )}

        {step === 2 && <QuestionBuilder questions={questions} onChange={setQuestions} />}

        <DialogFooter className="mt-3 gap-2">
          {step === 2 && <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>}
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          {(step === 1) && <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleNext}>{mode === 'pdf' ? 'Create Assignment' : 'Next: Questions →'}</Button>}
          {step === 2 && <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleCreate}>Publish Assignment</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResponsesDialog({ assignment, open, onClose }: { assignment: Assignment; open: boolean; onClose: () => void }) {
  const { assignmentAttempts, submissions, courses } = useStore();
  const [filter, setFilter] = useState<'all' | 'attempted' | 'not'>('all');
  const isMCQ = !!assignment.questions?.length;
  const attempts = isMCQ ? assignmentAttempts.filter(a => a.assignmentId === assignment.id && a.status === 'submitted') : submissions.filter(s => s.assignmentId === assignment.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{assignment.title} — Responses</DialogTitle>
          <DialogDescription>{isMCQ ? 'Auto-graded MCQ responses' : 'PDF submission log'}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-1 bg-secondary border border-border rounded-lg p-1 w-fit mb-2">
          {(['all', 'attempted', 'not'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${filter === f ? 'bg-amber-600 text-white' : 'text-muted-foreground'}`}>
              {f === 'all' ? 'All' : f === 'attempted' ? 'Submitted' : 'Not Submitted'}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {attempts.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm"><Users className="w-8 h-8 mx-auto opacity-20 mb-2" />No submissions yet</div>
          ) : attempts.map((att: any) => {
            const score = att.score ?? att.marks;
            const total = att.totalPoints ?? 100;
            const pct = total > 0 ? Math.round((score / total) * 100) : 0;
            const isExpanded = expandedId === att.id;
            return (
              <div key={att.id} className="border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 cursor-pointer" onClick={() => isMCQ && setExpandedId(isExpanded ? null : att.id)}>
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">{att.studentName.charAt(0)}</div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{att.studentName}</p><p className="text-xs text-muted-foreground">{new Date(att.submittedAt).toLocaleString()}</p></div>
                  {isMCQ && <span className={`text-sm font-bold ${pct >= 60 ? 'text-green-600' : 'text-red-500'}`}>{score}/{total} ({pct}%)</span>}
                  <Badge className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100">Submitted</Badge>
                </div>
                {isExpanded && isMCQ && assignment.questions && (
                  <div className="border-t border-border px-4 pb-3 space-y-2 bg-secondary/10">
                    {assignment.questions.map((q, i) => {
                      const chosen = att.answers?.[q.id] || [];
                      const isCorrect = chosen.length === q.correctOptionIds.length && chosen.every((id: string) => q.correctOptionIds.includes(id));
                      const chosenTexts = q.options.filter(o => chosen.includes(o.id)).map(o => o.text);
                      const correctTexts = q.options.filter(o => q.correctOptionIds.includes(o.id)).map(o => o.text);
                      return (
                        <div key={q.id} className={`p-2.5 rounded-lg border text-xs ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                          <p className="font-medium mb-1">Q{i + 1}: {q.text}</p>
                          <p><span className="text-muted-foreground">Answered: </span><span className={isCorrect ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>{chosenTexts.join(', ') || 'No answer'}</span></p>
                          {!isCorrect && <p><span className="text-muted-foreground">Correct: </span><span className="text-green-700 font-semibold">{correctTexts.join(', ')}</span></p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Assignments() {
  const { user, assignments, courses, submissions, assignmentAttempts, submitAssignment } = useStore();
  const isProf = user?.role === 'professor';
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [responsesFor, setResponsesFor] = useState<Assignment | null>(null);

  const getStudentAttempt = (assignmentId: string) => {
    const a = assignmentAttempts.find(x => x.assignmentId === assignmentId && x.studentId === user?.id);
    return a;
  };
  const getStudentSubmission = (assignmentId: string) => submissions.find(s => s.assignmentId === assignmentId && s.studentId === user?.id);
  const getResponseCount = (a: Assignment) => a.questions?.length ? assignmentAttempts.filter(x => x.assignmentId === a.id && x.status === 'submitted').length : submissions.filter(s => s.assignmentId === a.id).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isProf ? 'Create and manage course assignments. Supports PDF submission and MCQ auto-grading.' : 'Complete assignments before their deadline. Each contributes 10% to your course grade.'}
          </p>
        </div>
        {isProf && <Button className="shrink-0 gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => setCreateOpen(true)}><PlusCircle className="w-4 h-4" />Create Assignment</Button>}
      </div>



      <div className="grid gap-4">
        {assignments.map(a => {
          const course = courses.find(c => c.id === a.courseId);
          const isMCQ = !!a.questions?.length;
          const attempt = getStudentAttempt(a.id);
          const submission = getStudentSubmission(a.id);
          const isSubmitted = isMCQ ? attempt?.status === 'submitted' : !!submission;
          const inProgress = isMCQ && attempt?.status === 'in_progress';
          const isOverdue = new Date(a.deadline) < new Date();
          const responseCount = getResponseCount(a);
          const pct = attempt?.totalPoints ? Math.round((attempt.score! / attempt.totalPoints) * 100) : 0;

          return (
            <Card key={a.id} className={`border-l-4 hover:shadow-md transition-all ${isSubmitted ? 'border-l-green-400' : isOverdue ? 'border-l-red-400' : 'border-l-amber-400'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase bg-amber-50 border-amber-200 text-amber-700">{isMCQ ? '📝 MCQ' : '📎 PDF'}</Badge>
                      {isSubmitted && <Badge className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100">✓ Submitted</Badge>}
                      {inProgress && <Badge className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>}
                      {!isSubmitted && !inProgress && <Badge className="text-[10px] bg-secondary text-muted-foreground hover:bg-secondary">Not Started</Badge>}
                    </div>
                    <CardTitle className="text-lg">{a.title}</CardTitle>
                    <CardDescription className="mt-0.5 text-xs">{course?.code} — {course?.title}</CardDescription>
                  </div>
                  <DeadlineBadge deadline={a.deadline} />
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <p className="text-sm text-foreground/70 line-clamp-2">{a.description}</p>
                {isMCQ && <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground"><ClipboardList className="w-3.5 h-3.5" />{a.questions!.length} questions · {a.questions!.reduce((s, q) => s + q.points, 0)} points total</div>}
                {!isProf && isSubmitted && isMCQ && attempt && (
                  <div className={`mt-3 p-3 rounded-lg flex items-center justify-between ${pct >= 60 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <span className={`font-bold text-sm ${pct >= 60 ? 'text-green-700' : 'text-red-600'}`}>Score: {attempt.score}/{attempt.totalPoints} ({pct}%)</span>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Auto-graded</span>
                  </div>
                )}
                {isProf && <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3.5 h-3.5" />{responseCount} submission{responseCount !== 1 ? 's' : ''}</div>}
              </CardContent>
              <CardFooter className="pt-3 pb-4 gap-2">
                {isProf ? (
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold" onClick={() => setResponsesFor(a)}><Users className="w-3.5 h-3.5" />View Responses<ChevronRight className="w-3.5 h-3.5 ml-auto" /></Button>
                ) : isMCQ ? (
                  <>
                    {!isSubmitted ? (
                      <Button size="sm" className="gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700" disabled={isOverdue && !inProgress} onClick={() => navigate(`/assignments/${a.id}/take`)}>
                        {inProgress ? '▶ Continue Assignment' : isOverdue ? 'Deadline Passed' : '▶ Start Assignment'}
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs font-semibold" onClick={() => navigate(`/assignments/${a.id}/take`)}>View Results & Review</Button>
                    )}
                  </>
                ) : (
                  <>
                    {!isSubmitted && !isOverdue && (
                      <Button size="sm" className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700" onClick={() => { submitAssignment(a.id); toast.success('Assignment submitted!'); }}>
                        <Upload className="w-3.5 h-3.5" />Submit File
                      </Button>
                    )}
                    {isSubmitted && <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700"><CheckCircle2 className="w-3.5 h-3.5" />Submitted</span>}
                    {isOverdue && !isSubmitted && <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600"><AlertCircle className="w-3.5 h-3.5" />Deadline Passed</span>}
                  </>
                )}
              </CardFooter>
            </Card>
          );
        })}
        {assignments.length === 0 && (
          <div className="py-16 text-center border-2 border-dashed rounded-2xl text-muted-foreground">
            <ClipboardList className="w-10 h-10 mx-auto opacity-20 mb-2" /><p className="font-semibold text-sm">No assignments yet</p>
          </div>
        )}
      </div>

      <CreateAssignmentDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {responsesFor && <ResponsesDialog assignment={responsesFor} open={!!responsesFor} onClose={() => setResponsesFor(null)} />}
    </div>
  );
}
