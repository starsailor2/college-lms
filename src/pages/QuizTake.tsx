import { useStore, QuizQuestion } from '@/store';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, Camera, ShieldAlert, ChevronLeft, ChevronRight,
  Timer, Send, X, CheckCircle2, Check, Lock
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Timer ────────────────────────────────────────────────────────────────────
function QuizTimer({ totalSeconds, onExpire }: { totalSeconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (remaining <= 0) {
      if (!expiredRef.current) { expiredRef.current = true; onExpire(); }
      return;
    }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const pct = (remaining / totalSeconds) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining < 120; // last 2 minutes
  const isCritical = remaining < 30; // last 30 seconds

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold transition-colors ${
      isCritical
        ? 'bg-red-100 text-red-700 border-2 border-red-400 animate-pulse'
        : isUrgent
          ? 'bg-red-50 text-red-600 border border-red-300'
          : 'bg-secondary text-foreground border border-border'
    }`}>
      <Timer className={`w-4 h-4 ${isUrgent ? 'animate-pulse' : ''}`} />
      <span className="tabular-nums">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
      <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden ml-1">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isCritical ? 'bg-red-600' : isUrgent ? 'bg-red-500' : 'bg-primary'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Question Navigator Sidebar ───────────────────────────────────────────────
function QNav({ questions, currentIdx, answers, onJump }: {
  questions: QuizQuestion[];
  currentIdx: number;
  answers: Record<string, string[]>;
  onJump: (i: number) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Question Navigator</p>
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, i) => {
          const isAnswered = (answers[q.id] || []).length > 0;
          const isCurrent = i === currentIdx;
          return (
            <button key={q.id} onClick={() => onJump(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-primary text-primary-foreground shadow-md scale-110'
                  : isAnswered
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-secondary text-muted-foreground hover:bg-muted border border-border'
              }`}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-1.5 pt-1 border-t border-border">
        {[
          { color: 'bg-primary', label: 'Current' },
          { color: 'bg-green-500', label: 'Answered' },
          { color: 'bg-secondary border border-border', label: 'Not Answered' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`w-3 h-3 rounded shrink-0 ${color}`} />
            {label}
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-700 leading-relaxed">
        <strong>Reminder:</strong> Quiz auto-submits when time ends. Only 1 attempt allowed.
      </div>
    </div>
  );
}

// ─── Warning Screen ───────────────────────────────────────────────────────────
function WarningScreen({
  quiz, onAgree
}: {
  quiz: { title: string; timeLimitMinutes: number; questions: QuizQuestion[] };
  onAgree: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">Read carefully before you begin</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Time Limit', value: `${quiz.timeLimitMinutes} min` },
            { label: 'Questions', value: quiz.questions.length },
            { label: 'Attempts', value: '1 only' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-secondary rounded-xl p-3 text-center border border-border">
              <p className="text-lg font-bold">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2.5 mb-6">
          {[
            { icon: Lock, text: 'This is a one-time attempt. You cannot retake this quiz.', color: 'text-slate-700 bg-slate-50 border-slate-200' },
            { icon: Timer, text: 'Your quiz will be auto-submitted when the timer reaches zero.', color: 'text-orange-600 bg-orange-50 border-orange-200' },
            { icon: Camera, text: 'Keep your camera ON at all times. You are being monitored.', color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { icon: AlertTriangle, text: 'Do not switch tabs. Tab switches are detected and recorded.', color: 'text-red-600 bg-red-50 border-red-200' },
            { icon: ShieldAlert, text: 'Do not refresh or close the page. Your progress may be lost.', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className={`flex items-start gap-3 p-3 rounded-xl border text-sm font-medium ${color}`}>
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-6 group">
          <button type="button" onClick={() => setAgreed(!agreed)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
              agreed ? 'bg-primary border-primary text-white' : 'border-border bg-background group-hover:border-primary/50'
            }`}>
            {agreed && <Check className="w-3 h-3" />}
          </button>
          <span className="text-sm text-foreground leading-relaxed">
            I understand this is a <strong>one-time attempt</strong>. I agree to the rules above and confirm my camera is ON. I will not switch tabs or windows.
          </span>
        </label>

        <Button className="w-full h-11 text-base font-bold gap-2" disabled={!agreed} onClick={onAgree}>
          Begin Quiz <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Submit Confirmation Dialog ───────────────────────────────────────────────
function SubmitDialog({ open, questions, answers, onConfirm, onCancel }: {
  open: boolean;
  questions: QuizQuestion[];
  answers: Record<string, string[]>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  const answered = questions.filter(q => (answers[q.id] || []).length > 0).length;
  const unanswered = questions.length - answered;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Submit Quiz?</h2>
            <p className="text-xs text-muted-foreground">This action cannot be undone. No reattempts are allowed.</p>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Questions</span>
            <span className="font-bold">{questions.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600 font-medium">Answered</span>
            <span className="font-bold text-green-600">{answered}</span>
          </div>
          {unanswered > 0 && (
            <div className="flex justify-between">
              <span className="text-amber-600 font-medium">Unanswered</span>
              <span className="font-bold text-amber-600">{unanswered}</span>
            </div>
          )}
        </div>

        {unanswered > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{unanswered} question{unanswered > 1 ? 's' : ''} unanswered. Unanswered questions receive 0 marks.</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Go Back</Button>
          <Button className="flex-1 gap-2" onClick={onConfirm}>
            <CheckCircle2 className="w-4 h-4" /> Submit & Lock
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Switch Warning ───────────────────────────────────────────────────────
function TabWarning({ count, onDismiss }: { count: number; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border-2 border-red-300 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-700">Tab Switch Detected</h2>
          <p className="text-sm text-muted-foreground mt-1">Incident recorded — Warning <strong>#{count}</strong></p>
        </div>
        <p className="text-sm text-center bg-secondary rounded-lg p-3 leading-relaxed">
          Switching tabs or windows during a quiz violates academic integrity policies. Repeated violations may result in automatic disqualification.
        </p>
        <Button variant="destructive" className="w-full gap-2" onClick={onDismiss}>
          <X className="w-4 h-4" /> I Understand — Resume Quiz
        </Button>
      </div>
    </div>
  );
}

// ─── Locked / Already Submitted Screen ───────────────────────────────────────
function AlreadySubmittedScreen({ quizId, attemptId }: { quizId: string; attemptId: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-slate-500" />
        </div>
        <h1 className="text-2xl font-bold">Quiz Locked</h1>
        <p className="text-muted-foreground text-sm">
          You have already submitted this quiz. Only one attempt is allowed, and your submission is final.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={() => navigate(`/quizzes/${quizId}/results/${attemptId}`)}>
            View My Results
          </Button>
          <Button variant="outline" onClick={() => navigate('/quizzes')}>
            Back to Quizzes
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Take Page ───────────────────────────────────────────────────────────
export function QuizTake() {
  const { quizId } = useParams<{ quizId: string }>();
  const { user, quizzes, quizAttempts, startAttempt, saveAnswer, submitAttempt } = useStore();
  const navigate = useNavigate();

  const quiz = quizzes.find(q => q.id === quizId);

  // Check for existing submitted attempt (strict: 1 attempt)
  const existingAttempt = quizAttempts.find(
    a => a.quizId === quizId && a.studentId === user?.id && a.status === 'submitted'
  );

  const [phase, setPhase] = useState<'warning' | 'quiz'>('warning');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [displayQuestions, setDisplayQuestions] = useState<QuizQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAgree = useCallback(() => {
    if (!quiz || !user) return;
    const attempt = startAttempt(quiz.id);
    setAttemptId(attempt.id);
    let qs = [...quiz.questions];
    if (quiz.shuffleQuestions) qs = qs.sort(() => Math.random() - 0.5);
    if (quiz.shuffleOptions) qs = qs.map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) }));
    setDisplayQuestions(qs);
    setPhase('quiz');
  }, [quiz, user, startAttempt]);

  // Tab switch detection
  useEffect(() => {
    if (phase !== 'quiz') return;
    const handler = () => {
      if (document.hidden) {
        setTabWarnings(c => c + 1);
        setShowTabWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [phase]);

  const handleSelect = (questionId: string, optionId: string, isMulti: boolean) => {
    if (!attemptId || isSubmitting) return;
    let selected: string[];
    if (isMulti) {
      const prev = answers[questionId] || [];
      selected = prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId];
    } else {
      selected = [optionId];
    }
    setAnswers(prev => ({ ...prev, [questionId]: selected }));
    saveAnswer(attemptId, questionId, selected);
  };

  const doSubmit = useCallback((isAutoSubmit = false) => {
    if (!attemptId || isSubmitting) return;
    setIsSubmitting(true);
    submitAttempt(attemptId);
    if (isAutoSubmit) {
      toast.warning('Time is up. Your quiz has been submitted automatically.', { duration: 6000 });
    } else {
      toast.success('Quiz submitted successfully. Results are auto-graded.');
    }
    navigate(`/quizzes/${quizId}/results/${attemptId}`);
  }, [attemptId, isSubmitting, submitAttempt, navigate, quizId]);

  const handleTimerExpire = useCallback(() => doSubmit(true), [doSubmit]);
  const handleConfirmSubmit = useCallback(() => doSubmit(false), [doSubmit]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Quiz not found.
      </div>
    );
  }

  // Already submitted — show locked screen
  if (existingAttempt) {
    return <AlreadySubmittedScreen quizId={quiz.id} attemptId={existingAttempt.id} />;
  }

  // Quiz not open
  const now = Date.now();
  if (now < new Date(quiz.startTime).getTime()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Timer className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <p className="font-bold text-lg">Quiz not started yet</p>
          <p className="text-muted-foreground text-sm">
            Starts {new Date(quiz.startTime).toLocaleString()}
          </p>
          <Button variant="outline" onClick={() => navigate('/quizzes')}>Back to Quizzes</Button>
        </div>
      </div>
    );
  }

  if (now > new Date(quiz.endTime).getTime()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <p className="font-bold text-lg">Quiz Closed</p>
          <p className="text-muted-foreground text-sm">This quiz ended on {new Date(quiz.endTime).toLocaleString()}</p>
          <Button variant="outline" onClick={() => navigate('/quizzes')}>Back to Quizzes</Button>
        </div>
      </div>
    );
  }

  if (phase === 'warning') return <WarningScreen quiz={quiz} onAgree={handleAgree} />;
  if (displayQuestions.length === 0) return null;

  const currentQ = displayQuestions[currentIdx];
  const isMulti = currentQ.type === 'multi';
  const selectedOptions = answers[currentQ.id] || [];
  const answeredCount = displayQuestions.filter(q => (answers[q.id] || []).length > 0).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">L</div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{quiz.title}</p>
            <p className="text-[11px] text-muted-foreground">{answeredCount}/{displayQuestions.length} answered</p>
          </div>
        </div>

        <QuizTimer totalSeconds={quiz.timeLimitMinutes * 60} onExpire={handleTimerExpire} />

        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowSubmit(true)} disabled={isSubmitting}>
          <Send className="w-3.5 h-3.5" /> Submit
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Advanced quizzes + simple quizzes both get a nav panel */}
        <aside className="w-60 shrink-0 border-r border-border bg-secondary/20 p-4 overflow-y-auto hidden md:block">
          <QNav questions={displayQuestions} currentIdx={currentIdx} answers={answers} onJump={setCurrentIdx} />
        </aside>

        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
            {/* Question Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Question {currentIdx + 1} of {displayQuestions.length}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  isMulti ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {isMulti ? 'Select all that apply' : 'Single answer'}
                </span>
                <span className="ml-auto text-xs font-bold text-muted-foreground">{currentQ.points} pts</span>
              </div>
              <p className="text-lg font-semibold leading-relaxed">{currentQ.text}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-secondary rounded-full mb-6">
              <div className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((currentIdx + 1) / displayQuestions.length) * 100}%` }} />
            </div>

            {/* Options */}
            <div className="space-y-3 flex-1">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOptions.includes(opt.id);
                return (
                  <button key={opt.id} onClick={() => handleSelect(currentQ.id, opt.id, isMulti)}
                    disabled={isSubmitting}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50'
                    }`}>
                    <div className={`w-6 h-6 ${isMulti ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-primary border-primary text-white' : 'border-border group-hover:border-primary/50'
                    }`}>
                      {isSelected && (isMulti ? <Check className="w-3.5 h-3.5" /> : <div className="w-2.5 h-2.5 rounded-full bg-white" />)}
                    </div>
                    <span className="text-sm font-medium leading-snug flex-1">{opt.text}</span>
                    <span className="text-xs font-bold text-muted-foreground/40 shrink-0">{String.fromCharCode(65 + i)}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                disabled={currentIdx === 0} className="gap-1.5">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground font-medium">{currentIdx + 1} / {displayQuestions.length}</span>
              {currentIdx < displayQuestions.length - 1 ? (
                <Button variant="outline" size="sm" onClick={() => setCurrentIdx(i => i + 1)} className="gap-1.5">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" className="gap-1.5" onClick={() => setShowSubmit(true)} disabled={isSubmitting}>
                  <Send className="w-3.5 h-3.5" /> Submit Quiz
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>

      <SubmitDialog
        open={showSubmit}
        questions={displayQuestions}
        answers={answers}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowSubmit(false)}
      />

      {showTabWarning && (
        <TabWarning count={tabWarnings} onDismiss={() => setShowTabWarning(false)} />
      )}
    </div>
  );
}
