import { useStore, scoreAnswers } from '@/store';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock, BookOpen, Award, Check, ArrowLeft, Sparkles, AlertTriangle, Send, Lock } from 'lucide-react';
import { toast } from 'sonner';

function ScoreRing({ pct, score, total }: { pct: number; score: number; total: number }) {
  const r = 54, circ = 2 * Math.PI * r, dash = (pct / 100) * circ, pass = pct >= 60;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-border" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={pass ? '#22C55E' : '#EF4444'} strokeWidth="10" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black">{Math.round(pct)}%</span>
        <span className="text-xs text-muted-foreground">{score}/{total} pts</span>
      </div>
    </div>
  );
}

export function AssignmentTake() {
  const { id } = useParams<{ id: string }>();
  const { user, assignments, assignmentAttempts, startAssignmentAttempt, saveAssignmentAnswer, submitAssignmentAttempt } = useStore();
  const navigate = useNavigate();

  const assignment = assignments.find(a => a.id === id);
  const existingAttempt = assignmentAttempts.find(a => a.assignmentId === id && a.studentId === user?.id);

  const [activeTab, setActiveTab] = useState(existingAttempt?.status === 'submitted' ? 'results' : 'overview');
  const [attemptId, setAttemptId] = useState<string | null>(existingAttempt?.id ?? null);
  const [answers, setAnswers] = useState<Record<string, string[]>>(existingAttempt?.answers ?? {});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!assignment || !assignment.questions?.length) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Assignment not found or is a PDF assignment.</div>;
  }

  const questions = assignment.questions;
  const isSubmitted = existingAttempt?.status === 'submitted';
  const isOverdue = new Date(assignment.deadline) < new Date();
  const answeredCount = questions.filter(q => (answers[q.id] || []).length > 0).length;
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  const handleSelect = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    let aid = attemptId;
    if (!aid) {
      const attempt = startAssignmentAttempt(assignment.id);
      aid = attempt.id;
      setAttemptId(aid);
    }
    const selected = [optionId];
    setAnswers(prev => ({ ...prev, [questionId]: selected }));
    saveAssignmentAnswer(aid, questionId, selected);
  };

  const handleSubmit = useCallback(() => {
    if (!attemptId) { toast.error('Answer at least one question first'); return; }
    setIsSubmitting(true);
    submitAssignmentAttempt(attemptId);
    toast.success('Assignment submitted and auto-graded!');
    setActiveTab('results');
    setShowConfirm(false);
    setIsSubmitting(false);
  }, [attemptId, submitAssignmentAttempt]);

  const finalAttempt = assignmentAttempts.find(a => a.id === attemptId) ?? existingAttempt;
  const { score = 0, totalPoints: scoredTotal = totalPoints } = finalAttempt && isSubmitted ? { score: finalAttempt.score!, totalPoints: finalAttempt.totalPoints! } : { score: 0, totalPoints };
  const pct = scoredTotal > 0 ? (score / scoredTotal) * 100 : 0;
  const isPassing = pct >= 60;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate('/assignments')}><ArrowLeft className="w-4 h-4" />Assignments</Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{assignment.title}</h1>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px] font-bold">{assignment.weightage ?? 10}% of grade</Badge>
            {isSubmitted && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">✓ Submitted</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />Due: {new Date(assignment.deadline).toLocaleString()}
            {isOverdue && !isSubmitted && <span className="text-red-500 font-semibold ml-1">(Overdue)</span>}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-secondary border border-border h-10">
          <TabsTrigger value="overview" className="text-xs font-semibold">Overview</TabsTrigger>
          <TabsTrigger value="questions" className="text-xs font-semibold" disabled={isOverdue && !isSubmitted && !attemptId}>Questions</TabsTrigger>
          <TabsTrigger value="submit" className="text-xs font-semibold" disabled={isSubmitted || (isOverdue && !attemptId)}>Submit</TabsTrigger>
          <TabsTrigger value="results" className="text-xs font-semibold" disabled={!isSubmitted}>Results</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, label: 'Questions', value: questions.length, color: 'text-amber-600 bg-amber-50' },
              { icon: Award, label: 'Total Points', value: totalPoints, color: 'text-blue-600 bg-blue-50' },
              { icon: Clock, label: 'No Timer', value: 'Flexible', color: 'text-green-600 bg-green-50' },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label} className="border-border shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
                  <div><p className="text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Instructions</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-foreground/80 leading-relaxed">{assignment.description}</p></CardContent>
          </Card>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-800">Low-weight, auto-graded assignment</p>
              <p className="text-xs text-amber-700 mt-0.5">Contributes {assignment.weightage ?? 10}% to your final grade. No timer — complete at your own pace. MCQ answers are auto-graded on submission.</p>
            </div>
          </div>
          {!isSubmitted && !isOverdue && (
            <Button className="gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => setActiveTab('questions')}>
              {attemptId ? '▶ Continue' : '▶ Start Assignment'}
            </Button>
          )}
          {isSubmitted && <Button variant="outline" className="gap-2" onClick={() => setActiveTab('results')}>View Results →</Button>}
        </TabsContent>

        {/* ── Questions ── */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">{answeredCount}/{questions.length} answered</p>
            <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
            </div>
          </div>
          {questions.map((q, i) => {
            const selected = answers[q.id] || [];
            return (
              <Card key={q.id} className={`border-2 transition-all ${selected.length > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-border'}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Q{i + 1} · MCQ</span>
                      <CardTitle className="text-sm font-semibold mt-1 leading-snug">{q.text}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-muted-foreground">{q.points} pts</span>
                      {selected.length > 0 && <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSel = selected.includes(opt.id);
                    return (
                      <button key={opt.id} onClick={() => handleSelect(q.id, opt.id)} disabled={isSubmitted}
                        className={`w-full text-left p-3 rounded-xl border-2 flex items-center gap-3 transition-all group ${isSel ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-border hover:border-amber-300 hover:bg-secondary/50'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'bg-amber-500 border-amber-500' : 'border-border group-hover:border-amber-400'}`}>
                          {isSel && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm font-medium flex-1">{opt.text}</span>
                        <span className="text-xs text-muted-foreground/40">{String.fromCharCode(65 + oi)}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
          {!isSubmitted && (
            <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => setActiveTab('submit')}>
              <Send className="w-4 h-4" />Review & Submit →
            </Button>
          )}
        </TabsContent>

        {/* ── Submit ── */}
        <TabsContent value="submit" className="space-y-4 max-w-lg">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Submission Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-secondary rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-600">{answeredCount}</p><p className="text-xs text-muted-foreground">Answered</p></div>
                <div className="bg-secondary rounded-xl p-3 text-center"><p className="text-2xl font-bold text-amber-600">{questions.length - answeredCount}</p><p className="text-xs text-muted-foreground">Unanswered</p></div>
              </div>
              {questions.length - answeredCount > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{questions.length - answeredCount} unanswered question{questions.length - answeredCount > 1 ? 's' : ''}. Unanswered questions score 0 marks.</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground border-t border-border pt-3">This assignment contributes <strong>{assignment.weightage ?? 10}%</strong> to your final grade. Results are auto-graded on submission.</p>
            </CardContent>
          </Card>
          {!showConfirm ? (
            <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-700 h-11" onClick={() => setShowConfirm(true)} disabled={answeredCount === 0}>
              <Send className="w-4 h-4" />Submit Assignment
            </Button>
          ) : (
            <div className="p-4 border-2 border-amber-400 rounded-xl space-y-3 bg-amber-50">
              <p className="font-bold text-sm text-amber-800">Confirm submission? This cannot be undone.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Go Back</Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleSubmit} disabled={isSubmitting}><CheckCircle2 className="w-4 h-4 mr-2" />Confirm & Submit</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Results ── */}
        <TabsContent value="results" className="space-y-4">
          {!isSubmitted && !finalAttempt ? (
            <div className="py-16 text-center text-muted-foreground space-y-2"><Lock className="w-8 h-8 mx-auto opacity-20" /><p className="font-semibold text-sm">Submit the assignment to see results.</p></div>
          ) : (
            <>
              <Card className={`border-2 ${isPassing ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <ScoreRing pct={pct} score={score} total={scoredTotal} />
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`text-sm px-3 py-1 ${isPassing ? 'bg-green-500 hover:bg-green-500 text-white' : 'bg-red-500 hover:bg-red-500 text-white'}`}>{isPassing ? '🎉 Passed' : '❌ Failed'}</Badge>
                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 gap-1 text-xs"><Sparkles className="w-3 h-3" />Auto-graded</Badge>
                      </div>
                      <p className="text-sm text-foreground/70">This assignment contributes <strong>{assignment.weightage ?? 10}%</strong> to your final course grade.</p>
                      <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
                        <div className={`h-full rounded-full transition-all ${isPassing ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h2 className="font-bold text-base">Question Review</h2>
                {questions.map((q, i) => {
                  const chosen = (finalAttempt?.answers ?? answers)[q.id] || [];
                  const isCorrect = chosen.length === q.correctOptionIds.length && chosen.every(id => q.correctOptionIds.includes(id));
                  return (
                    <Card key={q.id} className={`border-2 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                      <CardHeader className="pb-2 flex-row items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between gap-2 text-xs text-muted-foreground"><span>Q{i + 1} · {q.points} pts</span><span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>{isCorrect ? `+${q.points}` : '0'} pts</span></div>
                          <p className="text-sm font-semibold mt-0.5">{q.text}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-1.5">
                        {q.options.map(opt => {
                          const wasChosen = chosen.includes(opt.id);
                          const isCorrectOpt = q.correctOptionIds.includes(opt.id);
                          let cls = 'border-border bg-secondary/30 text-muted-foreground';
                          if (isCorrectOpt) cls = 'border-green-400 bg-green-50 text-green-800 font-semibold';
                          else if (wasChosen) cls = 'border-red-400 bg-red-50 text-red-800 font-semibold';
                          return (
                            <div key={opt.id} className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm ${cls}`}>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isCorrectOpt ? 'border-green-500 bg-green-500' : wasChosen ? 'border-red-500 bg-red-500' : 'border-border'}`}>
                                {isCorrectOpt && <CheckCircle2 className="w-3 h-3 text-white" />}
                                {wasChosen && !isCorrectOpt && <XCircle className="w-3 h-3 text-white" />}
                              </div>
                              <span className={wasChosen && !isCorrectOpt ? 'line-through opacity-80' : ''}>{opt.text}</span>
                              {isCorrectOpt && <span className="ml-auto text-xs font-bold text-green-600">Correct</span>}
                              {wasChosen && !isCorrectOpt && <span className="ml-auto text-xs font-bold text-red-500">Your answer</span>}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
