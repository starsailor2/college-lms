import { useStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"
import { GraduationCap, Award, FileText, Settings2, ClipboardList, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Progress } from "@/components/ui/progress"

export function Grades() {
  const { user, assignments, courses, submissions, assignmentAttempts, quizAttempts, quizzes, gradeSubmission } = useStore()
  const isProf = user?.role === 'professor'
  const navigate = useNavigate()
  const [gradeId, setGradeId] = useState<string | null>(null)
  const [marks, setMarks] = useState('')
  const [feedback, setFeedback] = useState('')

  if (isProf) {
    // Professor view: all PDF submissions + MCQ attempts, joined with assignment/course info
    const pdfRows = submissions.map(sub => {
      const asgn = assignments.find(a => a.id === sub.assignmentId)
      const course = courses.find(c => c.id === asgn?.courseId)
      return { type: 'pdf' as const, sub, asgn, course }
    }).filter(r => r.asgn)

    const mcqRows = assignmentAttempts
      .filter(at => at.status === 'submitted')
      .map(at => {
        const asgn = assignments.find(a => a.id === at.assignmentId)
        const course = courses.find(c => c.id === asgn?.courseId)
        return { type: 'mcq' as const, at, asgn, course }
      }).filter(r => r.asgn)

    const submissionToGrade = submissions.find(s => s.id === gradeId)

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Grades & Feedback</h1>
          <p className="text-muted-foreground">Review submissions, assign marks, and provide feedback to students.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Submissions', value: pdfRows.length + mcqRows.length, color: 'text-primary bg-primary/10' },
            { label: 'Needs Grading', value: pdfRows.filter(r => r.sub.status !== 'graded').length, color: 'text-amber-600 bg-amber-50' },
            { label: 'Graded', value: pdfRows.filter(r => r.sub.status === 'graded').length, color: 'text-green-600 bg-green-50' },
            { label: 'Auto-graded MCQ', value: mcqRows.length, color: 'text-blue-600 bg-blue-50' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="border-border shadow-sm">
              <CardContent className="p-5">
                <p className="text-2xl font-bold">{value}</p>
                <p className={`text-[11px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded w-fit ${color}`}>{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PDF Submissions */}
        <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between bg-muted sm:px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#0F172A] text-white flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-bold text-base">PDF Submissions</CardTitle>
                <CardDescription className="text-xs">Manual grading required for file-based assignments.</CardDescription>
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary bg-[#0F172A] px-2 py-1 rounded tracking-wide uppercase hidden sm:block">Powered By Smart-Sync</span>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted border-b border-border">
                <TableRow className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted">
                  <TableHead className="px-6 py-3">Student</TableHead>
                  <TableHead className="px-6 py-3">Assignment</TableHead>
                  <TableHead className="px-6 py-3 hidden md:table-cell">Course</TableHead>
                  <TableHead className="px-6 py-3">Status</TableHead>
                  <TableHead className="px-6 py-3">Score</TableHead>
                  <TableHead className="px-6 py-3 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {pdfRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">No PDF submissions yet.</TableCell>
                  </TableRow>
                ) : pdfRows.map(({ sub, asgn, course }) => (
                  <TableRow key={sub.id} className="text-sm hover:bg-muted/30 transition-colors border-0">
                    <TableCell className="px-6 py-4 font-semibold">{sub.studentName}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                        <span className="truncate max-w-[160px]">{asgn?.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden md:table-cell">
                      <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-bold text-[10px] border border-border">{course?.code}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {sub.status === 'graded' ? (
                        <span className="px-2 py-1 rounded bg-green-50 text-green-700 font-bold text-[10px] uppercase border border-green-200">Graded</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 font-bold text-[10px] uppercase border border-amber-200">Needs Review</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {sub.status === 'graded' && sub.marks != null ? (
                        <div className="flex items-center gap-1.5 font-bold">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="text-base">{sub.marks}</span>
                          <span className="text-muted-foreground text-[10px]">/ 100</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Ungraded</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button
                        variant={sub.status === 'graded' ? 'ghost' : 'default'}
                        size="sm"
                        className={`h-8 px-3 text-[10px] font-bold uppercase tracking-wider ${sub.status !== 'graded' ? 'bg-primary text-primary-foreground gap-1.5' : ''}`}
                        onClick={() => { setGradeId(sub.id); setMarks(sub.marks?.toString() ?? ''); setFeedback(sub.feedback ?? ''); }}
                      >
                        <Settings2 className="w-3 h-3 mr-1" />
                        {sub.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* MCQ Auto-graded */}
        <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="p-5 border-b border-border bg-muted sm:px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#0F172A] text-white flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-bold text-base">MCQ Auto-Graded Results</CardTitle>
                <CardDescription className="text-xs">Automatically scored — no manual action needed.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted border-b border-border">
                <TableRow className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted">
                  <TableHead className="px-6 py-3">Student</TableHead>
                  <TableHead className="px-6 py-3">Assignment</TableHead>
                  <TableHead className="px-6 py-3 hidden md:table-cell">Course</TableHead>
                  <TableHead className="px-6 py-3">Score</TableHead>
                  <TableHead className="px-6 py-3">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {mcqRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">No MCQ submissions yet.</TableCell>
                  </TableRow>
                ) : mcqRows.map(({ at, asgn, course }) => {
                  const pct = at.totalPoints ? Math.round((at.score! / at.totalPoints) * 100) : 0
                  return (
                    <TableRow key={at.id} className="text-sm hover:bg-muted/30 transition-colors border-0">
                      <TableCell className="px-6 py-4 font-semibold">{at.studentName}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                          <span className="truncate max-w-[160px]">{asgn?.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 hidden md:table-cell">
                        <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-bold text-[10px] border border-border">{course?.code}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Award className="w-4 h-4 text-primary" />
                          <span>{at.score}/{at.totalPoints}</span>
                          <span className="text-muted-foreground text-[10px]">({pct}%)</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`px-2 py-1 rounded font-bold text-[10px] uppercase border ${pct >= 60 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {pct >= 60 ? 'Pass' : 'Fail'}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Grade dialog */}
        <Dialog open={!!gradeId} onOpenChange={o => { if (!o) setGradeId(null) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
              <DialogDescription>Enter score out of 100 and optional feedback for {submissionToGrade?.studentName}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Score (out of 100)</label>
                <Input type="number" min={0} max={100} value={marks} onChange={e => setMarks(e.target.value)} placeholder="e.g. 85" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Feedback (optional)</label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground resize-none"
                  placeholder="Write your feedback here..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setGradeId(null)}>Cancel</Button>
              <Button className="bg-[#0F172A] hover:bg-[#1E293B]" onClick={() => {
                const score = parseInt(marks)
                if (isNaN(score) || score < 0 || score > 100) { toast.error('Enter a valid score between 0 and 100'); return; }
                gradeSubmission(gradeId!, score, feedback.trim() || undefined)
                toast.success('Grade saved successfully')
                setGradeId(null)
              }}>Save Grade</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ── Student view ──────────────────────────────────────────────────────────────
  const myRows = assignments.map(a => {
    const isMCQ = !!a.questions?.length
    const attempt = isMCQ ? assignmentAttempts.find(at => at.assignmentId === a.id && at.studentId === user?.id && at.status === 'submitted') : null
    const submission = !isMCQ ? submissions.find(s => s.assignmentId === a.id && s.studentId === user?.id) : null
    const course = courses.find(c => c.id === a.courseId)
    const pct = attempt?.totalPoints ? Math.round((attempt.score! / attempt.totalPoints) * 100) : null
    const isGraded = isMCQ ? !!attempt : submission?.status === 'graded'
    return { a, isMCQ, attempt, submission, course, pct, isGraded }
  })

  const gradedCount = myRows.filter(r => r.isGraded).length
  const totalScore = myRows.reduce((sum, r) => {
    if (r.isMCQ && r.pct != null) return sum + r.pct
    if (!r.isMCQ && r.submission?.marks != null) return sum + r.submission.marks
    return sum
  }, 0)
  const avgScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Grades & Feedback</h1>
        <p className="text-muted-foreground">Your academic performance across all courses.</p>
      </div>

      {/* Student summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assignments', value: myRows.length, color: 'text-primary bg-primary/10' },
          { label: 'Completed', value: myRows.filter(r => r.isGraded || r.submission?.status === 'submitted').length, color: 'text-green-600 bg-green-50' },
          { label: 'Graded', value: gradedCount, color: 'text-blue-600 bg-blue-50' },
          { label: 'Avg Score', value: avgScore != null ? `${avgScore}%` : '—', color: 'text-amber-600 bg-amber-50' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-border shadow-sm">
            <CardContent className="p-5">
              <p className="text-2xl font-bold">{value}</p>
              <p className={`text-[11px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded w-fit ${color}`}>{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between bg-muted sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#0F172A] text-white flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-bold text-base">Academic Records</CardTitle>
              <CardDescription className="text-xs">All assignments and your scores.</CardDescription>
            </div>
          </div>
          <span className="text-[10px] font-bold text-primary bg-[#0F172A] px-2 py-1 rounded tracking-wide uppercase hidden sm:block">Powered By Smart-Sync</span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted border-b border-border">
              <TableRow className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted">
                <TableHead className="px-6 py-3">Assessment</TableHead>
                <TableHead className="px-6 py-3 hidden md:table-cell">Course</TableHead>
                <TableHead className="px-6 py-3">Type</TableHead>
                <TableHead className="px-6 py-3">Score</TableHead>
                <TableHead className="px-6 py-3 hidden sm:table-cell">Feedback</TableHead>
                <TableHead className="px-6 py-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {myRows.map(({ a, isMCQ, attempt, submission, course, pct, isGraded }) => (
                <TableRow key={a.id} className="text-sm hover:bg-muted/30 transition-colors border-0">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {isMCQ ? <ClipboardList className="w-4 h-4 text-muted-foreground/50 shrink-0" /> : <FileText className="w-4 h-4 text-muted-foreground/50 shrink-0" />}
                      <span className="font-semibold">{a.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden md:table-cell">
                    <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-bold text-[10px] border border-border">{course?.code}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase ${isMCQ ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                      {isMCQ ? '📝 MCQ' : '📎 PDF'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {isMCQ && attempt ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Award className="w-4 h-4 text-primary" />
                          <span>{attempt.score}/{attempt.totalPoints}</span>
                          <span className="text-muted-foreground text-[10px]">({pct}%)</span>
                        </div>
                        <Progress value={pct ?? 0} className="h-1 w-20" />
                      </div>
                    ) : !isMCQ && submission?.status === 'graded' && submission.marks != null ? (
                      <div className="flex items-center gap-1.5 font-bold">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-base">{submission.marks}</span>
                        <span className="text-muted-foreground text-[10px]">/ 100</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">
                        {submission?.status === 'submitted' ? 'Awaiting grade' : 'Not submitted'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden sm:table-cell">
                    {submission?.feedback ? (
                      <p className="truncate max-w-[200px] text-xs italic text-muted-foreground border-l-2 border-primary/30 pl-2">"{submission.feedback}"</p>
                    ) : isMCQ && attempt ? (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Auto-graded</span>
                    ) : (
                      <span className="text-muted-foreground/50 italic text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {isGraded ? (
                      <span className="px-2 py-1 rounded bg-green-50 text-green-700 font-bold text-[10px] uppercase border border-green-200">
                        {isMCQ ? 'Auto-graded' : 'Graded'}
                      </span>
                    ) : submission?.status === 'submitted' ? (
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-bold text-[10px] uppercase border border-blue-200">Submitted</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-secondary text-muted-foreground font-bold text-[10px] uppercase border border-border">
                        {new Date(a.deadline) < new Date() ? 'Overdue' : 'Pending'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {myRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center border-0">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Award className="w-8 h-8 opacity-20 mb-2" />
                      <p className="text-sm font-semibold">No grading records found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
