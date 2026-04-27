import { useStore, Assignment } from "@/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, UploadCloud, CheckCircle2, AlertCircle, Paperclip, Edit, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function Assignments() {
  const { user, assignments, courses, submissions, createAssignment, editAssignment, submitAssignment } = useStore()
  const isProf = user?.role === 'professor'
  const navigate = useNavigate()
  
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [courseId, setCourseId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [attachmentName, setAttachmentName] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenCreate = () => {
    setEditingId(null)
    setCourseId("")
    setTitle("")
    setDescription("")
    setDeadline("")
    setAttachmentName("")
    setAttachmentUrl("")
    setOpen(true)
  }

  const handleOpenEdit = (assignment: Assignment) => {
    setEditingId(assignment.id)
    setCourseId(assignment.courseId)
    setTitle(assignment.title)
    setDescription(assignment.description)
    
    const d = new Date(assignment.deadline)
    const formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    
    setDeadline(formattedDate)
    setAttachmentName(assignment.attachmentName || "")
    setAttachmentUrl(assignment.attachmentUrl || "")
    setOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setAttachmentName(file.name)
      setAttachmentUrl(`https://mock-storage.lms.com/files/${file.name}`)
      toast.success(`Attached ${file.name}`)
    }
  }

  const handleSave = () => {
    if (!courseId || !title || !description || !deadline) {
      toast.error("Please fill in all required fields")
      return
    }
    
    if (editingId) {
      editAssignment(editingId, {
        courseId,
        title,
        description,
        deadline: new Date(deadline).toISOString(),
        attachmentName,
        attachmentUrl
      })
      toast.success("Assignment updated.")
    } else {
      createAssignment({
        id: Math.random().toString(),
        courseId,
        title,
        description,
        deadline: new Date(deadline).toISOString(),
        attachmentName,
        attachmentUrl
      })
      toast.success("Assignment created and distributed.")
    }
    setOpen(false)
  }

  const handleSubmit = (id: string) => {
    toast.success("Validating submission...")
    setTimeout(() => {
      submitAssignment(id)
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">{isProf ? 'Manage course assignments and tasks.' : 'Track your pending and completed assignments.'}</p>
        </div>
        {isProf && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 gap-2" onClick={handleOpenCreate}>
                <PlusCircle className="h-4 w-4" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
                <DialogDescription>{editingId ? "Update assignment details." : "Distribute a new assignment to your students instantly."}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Midterm Essay" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Provide details..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attachment (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()} className="w-full justify-start text-muted-foreground font-normal">
                      <Paperclip className="h-4 w-4 mr-2" />
                      {attachmentName || "Upload PDF or Question Paper"}
                    </Button>
                    {attachmentName && (
                      <Button variant="ghost" className="text-destructive px-2" onClick={() => { setAttachmentName(""); setAttachmentUrl(""); }}>
                        Remove
                      </Button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave}>{editingId ? "Save Changes" : "Distribute"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {assignments.map(assignment => {
          const course = courses.find(c => c.id === assignment.courseId)
          
          let studentStatus = 'pending'
          let studentScore = null
          let studentFeedback = null
          
          if (!isProf) {
            const submission = submissions.find(s => s.assignmentId === assignment.id && s.studentId === user?.id)
            if (submission) {
              studentStatus = submission.status
              studentScore = submission.marks
              studentFeedback = submission.feedback
            }
          }
          
          const profSubmissions = submissions.filter(s => s.assignmentId === assignment.id)

          return (
            <Card key={assignment.id} className="border-border group transition-all hover:border-primary/20 hover:shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                     <CardTitle className="text-xl">{assignment.title}</CardTitle>
                     {assignment.attachmentName && (
                        <Badge variant="secondary" className="bg-muted text-[10px] font-mono"><Paperclip className="w-3 h-3 mr-1"/> Attachment</Badge>
                     )}
                  </div>
                  <CardDescription className="mt-1">{course?.title} • Due {new Date(assignment.deadline).toLocaleString()}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {isProf ? (
                     <Badge variant="outline" className="bg-muted">{profSubmissions.length} Submissions</Badge>
                  ) : (
                     getStatusBadge(studentStatus)
                  )}
                  {isProf && (
                     <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleOpenEdit(assignment)}>
                           <Edit className="w-3 h-3 mr-1"/> Edit
                        </Button>
                     </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 line-clamp-2">{assignment.description}</p>
                
                <div className="mt-4">
                  <Button variant="link" className="px-0 h-auto font-bold text-primary gap-1" onClick={() => navigate(`/assignments/${assignment.id}`)}>
                    View Full Details <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>

                {!isProf && studentStatus === 'graded' && (
                  <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-100 flex items-center justify-between">
                     <span className="font-bold text-green-800 text-sm">Score: {studentScore}/100</span>
                     <span className="text-sm text-green-700 italic font-medium">"{studentFeedback}"</span>
                  </div>
                )}
              </CardContent>
              {(!isProf && studentStatus === 'pending') && (
                <CardFooter className="bg-secondary/20 pt-4 pb-4 flex justify-end">
                  <Button onClick={() => handleSubmit(assignment.id)} variant="default" className="gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white">
                    <UploadCloud className="h-4 w-4" />
                    Quick Submit
                  </Button>
                </CardFooter>
              )}
            </Card>
          )
        })}
        {assignments.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
            No assignments found.
          </div>
        )}
      </div>
    </div>
  )
}
