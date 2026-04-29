import { useStore, scoreAttempt } from '@/store';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  CheckCircle2, XCircle, ArrowLeft, Trophy, Clock, BarChart2,
  ChevronDown, ChevronUp, Users, BookOpen, Award, Target, Sparkles,
  ShieldCheck, Filter
} from 'lucide-react';
import { useState } from 'react';

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ pct, score, total }: { pct: number; score: number; total: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const isPassing = pct >= 60;
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-border" />
        <circle cx="60" cy="60" r={r} fill="none"
          stroke={isPassing ? '#22C55E' : '#EF4444'} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease-in-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black leading-none">{Math.round(pct)}%</span>
        <span className="text-xs text-muted-foreground font-medium mt-1">{score}/{total} pts</span>
      </div>
    </div>
  );
}

// ─── Detailed Question Review ─────────────────────────────────────────────────
function QuestionReview({ quiz, answers }: { quiz: any; answers: Record<string, string[]> }) {
  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" /> Detailed Review
      </h2>
      {quiz.questions.map((q: any, idx: number) => {
        const chosen = answers[q.id] || [];
        const correct = q.correctOptionIds;
        const isCorrect = chosen.length === correct.length && chosen.every((id: string) => correct.includes(id));

        return (
          <Card key={q.id} className={`border-2 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
            <CardHeader className="pb-2 flex-row items-start gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Q{idx + 1} · {q.type === 'multi' ? 'Multi-select' : 'MCQ'} · {q.points} pts
                  </span>
                  <span className={`text-xs font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                    {isCorrect ? `+${q.points}` : '0'} pts
                  </span>
                </div>
                <p className="text-sm font-semibold mt-1 leading-snug">{q.text}</p>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {q.options.map((opt: any) => {
                const wasChosen = chosen.includes(opt.id);
                const isCorrectOpt = correct.includes(opt.id);
                let cls = 'border-border bg-secondary/30 text-muted-foreground';
                if (isCorrectOpt) cls = 'border-green-400 bg-green-50 text-green-800 font-semibold';
                if (wasChosen && !isCorrectOpt) cls = 'border-red-400 bg-red-50 text-red-800 font-semibold';

                return (
                  <div key={opt.id} className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm ${cls}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                      isCorrectOpt ? 'border-green-500 bg-green-500' : wasChosen ? 'border-red-500 bg-red-500' : 'border-border'
                    }`}>
                      {isCorrectOpt && <CheckCircle2 className="w-3 h-3 text-white" />}
                      {wasChosen && !isCorrectOpt && <XCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={wasChosen && !isCorrectOpt ? 'line-through opacity-80' : ''}>{opt.text}</span>
                    {wasChosen && !isCorrectOpt && <span className="ml-auto text-xs text-red-500 font-bold shrink-0">Your answer</span>}
                    {isCorrectOpt && <span className="ml-auto text-xs text-green-600 font-bold shrink-0">Correct</span>}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Quiz Results Page ────────────────────────────────────────────────────────
export function QuizResults() {
  const { quizId, attemptId } = useParams<{ quizId: string; attemptId?: string }>();
  const { user, quizzes, quizAttempts, courses } = useStore();
  const navigate = useNavigate();
  const isProf = user?.role === 'professor';

  const quiz = quizzes.find(q => q.id === quizId);
  const course = courses.find(c => c.id === quiz?.courseId);

  // All submitted attempts for this quiz
  const allAttempts = quizAttempts.filter(a => a.quizId === quizId && a.status === 'submitted');

  // The specific attempt to review (student)
  const reviewAttempt = attemptId
    ? quizAttempts.find(a => a.id === attemptId)
    : !isProf
      ? allAttempts.find(a => a.studentId === user!.id)
      : null;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'attempted' | 'not_attempted'>('all');

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Quiz not found.
      </div>
    );
  }

  // ── Student Result View ───────────────────────────────────────────────────
  if (!isProf && reviewAttempt) {
    const { score, totalPoints } = scoreAttempt(quiz, reviewAttempt.answers);
    const pct = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const isPassing = pct >= 60;
    const duration = reviewAttempt.submittedAt && reviewAttempt.startedAt
      ? Math.round((new Date(reviewAttempt.submittedAt).getTime() - new Date(reviewAttempt.startedAt).getTime()) / 1000 / 60)
      : 0;
    const canShowDetails = quiz.showResultsAfter === 'immediately' || new Date(quiz.endTime) < new Date();

    return (
      <div className="min-h-screen bg-background">
        {/* Result Hero */}
        <div className={`py-10 px-4 border-b border-border ${isPassing ? 'bg-green-50' : 'bg-red-50'}`}>
          <Button variant="ghost" size="sm" className="mb-4 gap-1.5" onClick={() => navigate('/quizzes')}>
            <ArrowLeft className="w-4 h-4" /> Back to Quizzes
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <Badge className={`text-sm font-bold px-4 py-1 ${isPassing ? 'bg-green-500 hover:bg-green-500 text-white' : 'bg-red-500 hover:bg-red-500 text-white'}`}>
                {isPassing ? '🎉 Passed' : '❌ Failed'}
              </Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 gap-1 text-xs font-bold">
                <Sparkles className="w-3 h-3" /> Auto-graded
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> {course?.title}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Score Card */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ScoreRing pct={pct} score={score} total={totalPoints} />
                <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                  {[
                    { icon: Trophy, label: 'Score', value: `${score}/${totalPoints}`, color: 'text-primary' },
                    { icon: Target, label: 'Accuracy', value: `${Math.round(pct)}%`, color: isPassing ? 'text-green-600' : 'text-red-600' },
                    { icon: Clock, label: 'Time Taken', value: `${duration} min`, color: 'text-blue-600' },
                    { icon: ShieldCheck, label: 'Grading', value: 'Auto', color: 'text-purple-600' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-secondary rounded-xl p-3 text-center">
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                      <p className="text-lg font-bold leading-tight">{value}</p>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Review */}
          {canShowDetails ? (
            <QuestionReview quiz={quiz} answers={reviewAttempt.answers} />
          ) : (
            <Card className="border-border">
              <CardContent className="p-6 text-center text-muted-foreground space-y-2">
                <Clock className="w-8 h-8 mx-auto opacity-30" />
                <p className="font-semibold text-sm">Detailed review will be available after the quiz closes.</p>
                <p className="text-xs">{new Date(quiz.endTime).toLocaleString()}</p>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/quizzes')}>
            <ArrowLeft className="w-4 h-4" /> Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  // ── Professor: All Responses ──────────────────────────────────────────────
  if (isProf) {
    const totalAttempts = allAttempts.length;
    const avgScore = totalAttempts > 0
      ? Math.round(allAttempts.reduce((sum, a) => sum + (a.score! / a.totalPoints!) * 100, 0) / totalAttempts)
      : 0;
    const passCount = allAttempts.filter(a => (a.score! / a.totalPoints!) >= 0.6).length;

    // Build rows: attempted + placeholder for not-attempted (mock student list)
    // Since we have a mock app, we'll just show attempted rows + a "not attempted" placeholder
    const attemptedStudentIds = new Set(allAttempts.map(a => a.studentId));
    // Mock: all submissions from quiz attempts to simulate student roster
    const notAttemptedMock = totalAttempts === 0 ? [
      { studentName: 'Alex Carter', studentId: 'stu1' },
      { studentName: 'Sarah Jenkins', studentId: 'stu2' },
    ] : [];

    const filteredAttempts = filter === 'not_attempted' ? [] : allAttempts;
    const showNotAttempted = filter !== 'attempted';

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5 shrink-0" onClick={() => navigate('/quizzes')}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{quiz.title}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> {course?.title} · Student Responses
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Responses', value: totalAttempts, color: 'text-primary bg-primary/10' },
            { icon: BarChart2, label: 'Avg Score', value: `${avgScore}%`, color: 'text-blue-600 bg-blue-50' },
            { icon: Award, label: 'Passed', value: passCount, color: 'text-green-600 bg-green-50' },
            { icon: XCircle, label: 'Failed', value: totalAttempts - passCount, color: 'text-red-500 bg-red-50' },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="border-border shadow-sm">
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

        {/* Responses Table */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/50 border-b border-border px-5 py-4 flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Attempt Records
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Auto-graded. Click a row to expand answers.</CardDescription>
            </div>
            {/* Filter */}
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-1">
              <Filter className="w-3.5 h-3.5 text-muted-foreground ml-1" />
              {(['all', 'attempted', 'not_attempted'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                    filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {f === 'all' ? 'All' : f === 'attempted' ? 'Attempted' : 'Not Attempted'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-5 py-2.5 bg-muted border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="col-span-4">Student</span>
              <span className="col-span-2 text-center">Status</span>
              <span className="col-span-2 text-center">Score</span>
              <span className="col-span-3">Submitted At</span>
              <span className="col-span-1 text-center">Details</span>
            </div>

            {filteredAttempts.length === 0 && (filter === 'attempted' || (filter === 'all' && totalAttempts === 0)) ? (
              <div className="py-12 text-center text-muted-foreground text-sm space-y-1">
                <Users className="w-8 h-8 mx-auto opacity-20 mb-2" />
                <p className="font-semibold">No attempts yet</p>
                <p className="text-xs opacity-70">Students will appear here once they submit.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {/* Attempted rows */}
                {filteredAttempts.map(att => {
                  const p = att.totalPoints! > 0 ? Math.round((att.score! / att.totalPoints!) * 100) : 0;
                  const isPassing = p >= 60;
                  const isExpanded = expandedId === att.id;

                  return (
                    <div key={att.id}>
                      <div
                        className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-secondary/30 cursor-pointer transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : att.id)}
                      >
                        <div className="col-span-4 flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                            {att.studentName.charAt(0)}
                          </div>
                          <span className="font-semibold text-sm truncate">{att.studentName}</span>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Submitted</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className={`font-bold text-sm ${isPassing ? 'text-green-600' : 'text-red-500'}`}>
                            {att.score}/{att.totalPoints}
                          </span>
                          <span className={`ml-1 text-[10px] font-bold ${isPassing ? 'text-green-600' : 'text-red-500'}`}>
                            ({p}%)
                          </span>
                        </div>
                        <div className="col-span-3 text-xs text-muted-foreground">
                          {att.submittedAt ? new Date(att.submittedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                        <div className="col-span-1 flex justify-center text-muted-foreground">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Expanded answer review */}
                      {isExpanded && (
                        <div className="px-5 pb-4 space-y-2 bg-secondary/10 border-t border-border">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-3 mb-2">
                            Answer Breakdown
                          </p>
                          {quiz.questions.map((q, idx) => {
                            const chosen = att.answers[q.id] || [];
                            const correct = q.correctOptionIds;
                            const isCorrect = chosen.length === correct.length && chosen.every(id => correct.includes(id));
                            const chosenTexts = q.options.filter(o => chosen.includes(o.id)).map(o => o.text);
                            const correctTexts = q.options.filter(o => correct.includes(o.id)).map(o => o.text);

                            return (
                              <div key={q.id} className={`p-3 rounded-xl border text-sm ${
                                isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                              }`}>
                                <div className="flex items-start gap-2">
                                  {isCorrect
                                    ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                    : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium leading-snug">Q{idx + 1}: {q.text}</p>
                                    <p className="text-xs mt-1">
                                      <span className="text-muted-foreground">Answered: </span>
                                      <span className={isCorrect ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
                                        {chosenTexts.length > 0 ? chosenTexts.join(', ') : 'No answer'}
                                      </span>
                                    </p>
                                    {!isCorrect && (
                                      <p className="text-xs mt-0.5">
                                        <span className="text-muted-foreground">Correct: </span>
                                        <span className="text-green-700 font-semibold">{correctTexts.join(', ')}</span>
                                      </p>
                                    )}
                                  </div>
                                  <span className={`text-xs font-bold shrink-0 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                    {isCorrect ? `+${q.points}` : '0'}/{q.points}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Not attempted placeholders */}
                {showNotAttempted && notAttemptedMock.map(s => (
                  <div key={s.studentId} className="grid grid-cols-12 items-center px-5 py-3.5 opacity-60">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold shrink-0">
                        {s.studentName.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm">{s.studentName}</span>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">Not Attempted</span>
                    </div>
                    <div className="col-span-2 text-center text-muted-foreground text-xs">—</div>
                    <div className="col-span-3 text-xs text-muted-foreground">—</div>
                    <div className="col-span-1" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback: student with no attempt
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-muted-foreground">
      <Trophy className="w-12 h-12 opacity-20" />
      <p className="font-semibold text-foreground">No submission found</p>
      <Button variant="outline" onClick={() => navigate('/quizzes')}>Back to Quizzes</Button>
    </div>
  );
}
