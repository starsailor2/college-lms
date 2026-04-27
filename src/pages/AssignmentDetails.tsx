import { useParams, useNavigate } from "react-router-dom"
import { useStore, Submission } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowLeft, UploadCloud, CheckCircle2, AlertCircle, GraduationCap, Paperclip } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useRef } from "react"

export function AssignmentDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, assignments, courses, submissions, submitAssignment, gradeSubmission } = useStore()
  
  const assignment = assignments.find(a => a.id === id)
  const course = courses.find(c => c.id === assignment?.courseId)
  
  const [gradeOpen, setGradeOpen] = useState(false)
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null)
  const [marks, setMarks] = useState("")
  const [feedback, setFeedback] = useState("")

  const [submissionFileName, setSubmissionFileName] = useState("")
  const [submissionFileUrl, setSubmissionFileUrl] = useState("")
  const studentFileInputRef = useRef<HTMLInputElement>(null)

  if (!assignment) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Assignment not found</h2>
        <Button onClick={() => navigate('/assignments')} className="mt-4">Go Back</Button>
      </div>
    )
  }

  const isProf = user?.role === 'professor'
  const assignmentSubmissions = submissions.filter(s => s.assignmentId === id)
  
  let studentSubmission = null
  if (!isProf) {
    studentSubmission = assignmentSubmissions.find(s => s.studentId === user?.id)
  }

  const handleOpenGrade = (submission: Submission) => {
    setGradingSubmission(submission)
    setMarks(submission.marks?.toString() || "")
    setFeedback(submission.feedback || "")
    setGradeOpen(true)
  }

  const handleGrade = () => {
    if (!marks || isNaN(Number(marks))) {
      toast.error("Please enter a valid number for marks")
      return
    }
    if (gradingSubmission) {
      gradeSubmission(gradingSubmission.id, Number(marks), feedback)
      setGradeOpen(false)
      toast.success("Submission graded successfully")
    }
  }

  const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSubmissionFileName(file.name)
      setSubmissionFileUrl(`https://mock-storage.lms.com/submissions/${file.name}`)
      toast.success(`Attached ${file.name}`)
    }
  }

  const handleSubmit = () => {
    toast.success("Validating submission...")
    setTimeout(() => {
      submitAssignment(assignment.id, submissionFileUrl, submissionFileName)
      toast.success("Assignment submitted successfully!")
    }, 1000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted': return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Submitted</Badge>
      case 'graded': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Graded</Badge>
      default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"><AlertCircle className="w-3 h-3 mr-1"/> Pending</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Button variant="ghost" onClick={() => navigate('/assignments')} className="mb-4 pl-0 gap-2 hover:bg-transparent text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
        <p className="text-muted-foreground mt-1">{course?.title} • Due {new Date(assignment.deadline).toLocaleString()}</p>
      </div>

      <div className={isProf ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
        <div className={isProf ? "space-y-6" : "lg:col-span-2 space-y-6"}>
          <Card className="border-border">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="text-lg">Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {assignment.description}
              </div>
              {assignment.attachmentName && (
                <div className="mt-8 p-4 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{assignment.attachmentName}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Attached Document</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={assignment.attachmentUrl} target="_blank" rel="noreferrer">Download</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isProf && (
            <Card className="border-border">
              <CardHeader className="border-b border-border bg-muted/20 pb-4">
                <CardTitle className="text-lg">Student Submissions ({assignmentSubmissions.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-0">
                {assignmentSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No submissions yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {assignmentSubmissions.map((sub) => (
                      <div key={sub.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                        <div>
                          <p className="font-semibold text-sm">{sub.studentName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Submitted: {new Date(sub.submittedAt || '').toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {sub.submittedFileName && (
                            <Button size="sm" asChild className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20 border-0 shadow-none">
                              <a href={sub.submittedFileUrl} target="_blank" rel="noreferrer" className="flex items-center whitespace-nowrap">
                                <Paperclip className="w-3.5 h-3.5 mr-1.5" /> View
                              </a>
                            </Button>
                          )}
                          {getStatusBadge(sub.status)}
                          {sub.status === 'graded' ? (
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-green-700">{sub.marks}/100</span>
                              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleOpenGrade(sub)}>
                                Edit Grade
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20 border-0 shadow-none" onClick={() => handleOpenGrade(sub)}>
                              <GraduationCap className="w-3.5 h-3.5 mr-1.5"/> Grade
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {!isProf && (
            <Card className="border-border sticky top-6">
              <CardHeader className="border-b border-border bg-muted/20 pb-4">
                <CardTitle className="text-lg">Your Submission</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(studentSubmission ? studentSubmission.status : 'pending')}
                </div>
                
                {studentSubmission?.status === 'graded' && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-green-800 tracking-wider">Score</span>
                      <span className="font-black text-green-700 text-lg">{studentSubmission.marks}/100</span>
                    </div>
                    <div className="border-t border-green-200/50 pt-2 mt-2">
                      <span className="text-xs font-bold uppercase text-green-800 tracking-wider block mb-1">Feedback</span>
                      <p className="text-sm text-green-700 italic">"{studentSubmission.feedback}"</p>
                    </div>
                  </div>
                )}

                {(!studentSubmission || studentSubmission.status === 'pending') && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" onClick={() => studentFileInputRef.current?.click()} className="w-full justify-start text-muted-foreground font-normal bg-muted/50 border-dashed border-2 h-20 hover:bg-muted/80">
                        <Paperclip className="h-4 w-4 mr-2" />
                        {submissionFileName ? <span className="text-foreground font-medium">{submissionFileName}</span> : "Click to upload submission file (PDF, ZIP, etc)"}
                      </Button>
                      <input type="file" ref={studentFileInputRef} className="hidden" onChange={handleStudentFileChange} />
                      {submissionFileName && (
                        <Button variant="ghost" size="sm" className="text-destructive h-6 self-end px-2" onClick={() => { setSubmissionFileName(""); setSubmissionFileUrl(""); }}>
                          Remove
                        </Button>
                      )}
                    </div>
                    <Button onClick={handleSubmit} className="w-full gap-2 h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white">
                      <UploadCloud className="h-4 w-4" />
                      Submit Assignment
                    </Button>
                  </div>
                )}

                {studentSubmission && studentSubmission.status !== 'pending' && studentSubmission.submittedFileName && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Submitted File</p>
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                      <a href={studentSubmission.submittedFileUrl} target="_blank" rel="noreferrer"><Paperclip className="w-4 h-4 mr-2" /> {studentSubmission.submittedFileName}</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Grade Dialog */}
      <Dialog open={gradeOpen} onOpenChange={setGradeOpen}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Grade Submission</DialogTitle>
               <DialogDescription>Evaluate {gradingSubmission?.studentName}'s work and provide feedback.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                  <Label>Score (out of 100)</Label>
                  <Input type="number" min="0" max="100" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="e.g. 95" />
               </div>
               <div className="space-y-2">
                  <Label>Feedback</Label>
                  <textarea 
                     className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                     placeholder="Great work on..."
                     value={feedback}
                     onChange={(e) => setFeedback(e.target.value)}
                  />
               </div>
            </div>
            <DialogFooter>
               <Button onClick={handleGrade} className="w-full">Submit Grade</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
