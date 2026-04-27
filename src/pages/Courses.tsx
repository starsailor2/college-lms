import { useStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, FileText, PlusCircle, ArrowRight, Video, FileCheck, Layers, BookOpen, Megaphone, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function Courses() {
  const { user, courses, classes, assignments, announcements, createAnnouncement } = useStore()
  const isProf = user?.role === 'professor'
  const navigate = useNavigate()

  const [annTitle, setAnnTitle] = useState("")
  const [annContent, setAnnContent] = useState("")
  const [annDialogCourseId, setAnnDialogCourseId] = useState<string | null>(null)

  const handleCreateAnnouncement = (courseId: string) => {
    if (!annTitle.trim() || !annContent.trim()) return
    createAnnouncement({
      id: Math.random().toString(),
      courseId,
      title: annTitle,
      content: annContent,
      date: new Date().toISOString(),
      authorName: user?.name || 'Instructor'
    })
    setAnnTitle("")
    setAnnContent("")
    setAnnDialogCourseId(null)
    toast.success("Announcement posted successfully")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Courses</h1>
          <p className="text-muted-foreground mt-1 text-sm">{isProf ? 'Manage the courses you teach.' : 'Courses you are currently enrolled in.'}</p>
        </div>
        {isProf && (
          <Button className="shrink-0 gap-2 font-bold tracking-wide text-xs h-10 px-6 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B]">
            <PlusCircle className="h-4 w-4" />
            Create Course
          </Button>
        )}
      </div>

      <div className="grid gap-8">
        {courses.map((course) => {
          const courseClasses = classes.filter(c => c.courseId === course.id);
          const upcomingClass = courseClasses.find(c => new Date(c.date) > new Date());
          const courseAssignments = assignments.filter(a => a.courseId === course.id);
          const courseAnnouncements = announcements?.filter(a => a.courseId === course.id) || [];

          return (
            <Card key={course.id} className="overflow-hidden border-border transition-all shadow-sm rounded-2xl flex flex-col md:flex-row">
              {/* Sidebar/Context area for the course card */}
              <div className="w-full md:w-80 bg-muted/30 border-r border-border p-6 flex flex-col justify-between shrink-0">
                 <div>
                   <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary border-0 font-bold uppercase tracking-wider text-[10px]">
                     {course.code}
                   </Badge>
                   <CardTitle className="text-xl leading-tight mb-2 truncate" title={course.title}>{course.title}</CardTitle>
                   <p className="text-sm text-muted-foreground mb-6">
                      {isProf ? (
                         <span className="flex items-center gap-1.5 font-medium"><Users className="w-3.5 h-3.5"/> {course.studentsCount} Enrolled</span>
                      ) : (
                         <span className="truncate text-xs">Instructor: Prof. {course.professorId === 'prof1' ? 'Alan Turing' : 'Unknown'}</span>
                      )}
                   </p>
                 </div>
                 
                 <div className="space-y-3 pb-2 pt-4 border-t border-border/50">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Overall Progress</p>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-semibold text-foreground whitespace-nowrap">{course.progress || 0}% Completion</span>
                    </div>
                    <Progress value={course.progress || 0} className="h-1.5" />
                 </div>
              </div>

              {/* Main functional area with tabs */}
              <div className="flex-1 p-0 flex flex-col">
                 <Tabs defaultValue="live" className="w-full h-full flex flex-col">
                   <div className="px-6 border-b border-border bg-white">
                      <TabsList className="bg-transparent h-14 p-0 space-x-6 justify-start w-full">
                        <TabsTrigger value="live" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 text-sm font-semibold tracking-wide flex gap-2 data-[state=active]:text-foreground text-muted-foreground">
                           <Video className="w-4 h-4"/> Live Sessions
                        </TabsTrigger>
                        <TabsTrigger value="assignments" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 text-sm font-semibold tracking-wide flex gap-2 data-[state=active]:text-foreground text-muted-foreground">
                           <FileCheck className="w-4 h-4"/> Assignments
                           <Badge className="ml-1 h-5 w-5 p-0 flex justify-center items-center rounded-full bg-secondary text-secondary-foreground text-[10px]">{courseAssignments.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="materials" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 text-sm font-semibold tracking-wide flex gap-2 data-[state=active]:text-foreground text-muted-foreground hidden sm:flex">
                           <Layers className="w-4 h-4"/> Materials
                        </TabsTrigger>
                        <TabsTrigger value="announcements" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 text-sm font-semibold tracking-wide flex gap-2 data-[state=active]:text-foreground text-muted-foreground">
                           <Megaphone className="w-4 h-4"/> Announcements
                           {courseAnnouncements.length > 0 && <Badge className="ml-1 h-5 w-5 p-0 flex justify-center items-center rounded-full bg-secondary text-secondary-foreground text-[10px]">{courseAnnouncements.length}</Badge>}
                        </TabsTrigger>
                      </TabsList>
                   </div>

                   <div className="p-6 flex-1 bg-white">
                      <TabsContent value="live" className="mt-0 h-full">
                        <div className="space-y-4">
                           {upcomingClass ? (
                              <div className="border border-primary/20 bg-primary/5 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                 <div>
                                    <div className="flex items-center gap-2 mb-2">
                                       <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Next Session Scheduled</span>
                                    </div>
                                    <h4 className="font-semibold text-lg">{upcomingClass.title}</h4>
                                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                       <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {new Date(upcomingClass.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                       <span className="flex items-center gap-1.5 px-2 bg-white rounded border border-border text-xs font-semibold">{upcomingClass.platform}</span>
                                    </div>
                                 </div>
                                 <Button asChild className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 shadow-sm gap-2 uppercase text-xs tracking-wider font-bold h-10 px-6">
                                    <a href={upcomingClass.link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full h-full">
                                       {isProf ? 'Start Class' : 'Join Live Class'}
                                       <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                                    </a>
                                 </Button>
                              </div>
                           ) : (
                              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                                 <Video className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                                 <p className="text-sm font-medium">No upcoming sessions</p>
                                 <p className="text-xs mt-1">Check back later for newly scheduled live classes.</p>
                              </div>
                           )}

                           {courseClasses.length > (upcomingClass ? 1 : 0) && (
                              <div className="mt-6">
                                <h5 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Past Classes</h5>
                                <div className="space-y-2">
                                   {courseClasses.filter(c => c !== upcomingClass).slice(0, 2).map(pastClass => (
                                      <div key={pastClass.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 text-sm">
                                         <div className="flex gap-3 items-center">
                                            <div className="w-8 h-8 rounded bg-muted flex flex-col items-center justify-center text-muted-foreground">
                                               <span className="text-[10px] font-bold leading-none">{new Date(pastClass.date).getDate()}</span>
                                            </div>
                                            <span className="font-medium">{pastClass.title}</span>
                                         </div>
                                         <span className="text-muted-foreground text-xs">{new Date(pastClass.date).toLocaleDateString()}</span>
                                      </div>
                                   ))}
                                </div>
                              </div>
                           )}
                        </div>
                      </TabsContent>

                      <TabsContent value="assignments" className="mt-0">
                         {courseAssignments.length > 0 ? (
                           <div className="space-y-3">
                              {courseAssignments.map(asgn => (
                                 <div key={asgn.id} className="flex flex-col sm:flex-row justify-between p-4 border border-border rounded-xl gap-4 group hover:border-primary/30 transition-colors">
                                    <div>
                                       <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{asgn.title}</h4>
                                          {asgn.status === 'graded' ? (
                                             <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-5 px-1.5 text-[9px] uppercase tracking-wider font-bold">Graded: {asgn.marks}/100</Badge>
                                          ) : asgn.status === 'submitted' ? (
                                             <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-5 px-1.5 text-[9px] uppercase tracking-wider font-bold">Submitted</Badge>
                                          ) : (
                                             <Badge variant="secondary" className="bg-orange-100 text-orange-700 h-5 px-1.5 text-[9px] uppercase tracking-wider font-bold border-0">Pending</Badge>
                                          )}
                                       </div>
                                       <p className="text-sm text-muted-foreground line-clamp-1">{asgn.description}</p>
                                       <div className="text-[10px] text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
                                          <Clock className="w-3 h-3"/> Due: {new Date(asgn.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                       </div>
                                    </div>
                                    <div className="shrink-0 flex items-center">
                                       <Button variant="outline" size="sm" className="w-full sm:w-auto h-8 text-xs font-semibold uppercase tracking-wider" onClick={() => navigate('/assignments/' + asgn.id)}>
                                          {isProf ? 'Review' : 'View Details'}
                                       </Button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                         ) : (
                           <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                             <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                             <p className="text-sm font-medium">No assignments posted</p>
                           </div>
                         )}
                      </TabsContent>

                      <TabsContent value="materials" className="mt-0 hidden sm:block">
                         <div className="grid grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                               <div key={i} className="p-4 rounded-xl border border-border flex items-start gap-3 hover:bg-muted/20 cursor-pointer">
                                  <div className="w-10 h-10 rounded bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                     <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                     <h5 className="font-semibold text-sm mb-0.5 mt-0.5 leading-tight">Syllabus & Guidelines {i}</h5>
                                     <p className="text-[10px] text-muted-foreground uppercase tracking-widest">PDF Document</p>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </TabsContent>

                      <TabsContent value="announcements" className="mt-0">
                         {isProf && (
                            <div className="mb-4">
                               <Dialog open={annDialogCourseId === course.id} onOpenChange={(val) => {
                                 if(!val) setAnnDialogCourseId(null)
                               }}>
                                  <DialogTrigger asChild>
                                    <Button onClick={() => setAnnDialogCourseId(course.id)} className="w-full sm:w-auto bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold uppercase tracking-wider text-xs h-10 px-6">
                                      <Megaphone className="w-4 h-4 mr-2" /> Post Announcement
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Post Class Announcement</DialogTitle>
                                      <DialogDescription>Share updates, reminders, or important information with the class.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Title</label>
                                        <Input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="e.g. Midterm Grades Posted" className="font-bold border-border" />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Message</label>
                                        <Textarea value={annContent} onChange={e => setAnnContent(e.target.value)} placeholder="Write your announcement here..." className="min-h-[120px] border-border resize-none" />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={() => handleCreateAnnouncement(course.id)} className="w-full font-bold uppercase tracking-wider text-xs bg-[#0F172A] hover:bg-[#1E293B]"><Send className="w-4 h-4 mr-2"/> Broadcast Now</Button>
                                    </DialogFooter>
                                  </DialogContent>
                               </Dialog>
                            </div>
                         )}

                         {courseAnnouncements.length > 0 ? (
                            <div className="space-y-4">
                               {courseAnnouncements.map(ann => (
                                  <div key={ann.id} className="p-5 border border-border rounded-xl bg-white shadow-sm">
                                     <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-base">{ann.title}</h4>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5"><Clock className="w-3 h-3"/> {new Date(ann.date).toLocaleDateString()}</span>
                                     </div>
                                     <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                                     <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                           {ann.authorName.charAt(0)}
                                        </div>
                                        <span className="text-xs font-semibold">{ann.authorName}</span>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         ) : (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                               <Megaphone className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                               <p className="text-sm font-medium">No announcements yet</p>
                               <p className="text-xs mt-1">Updates and important information will appear here.</p>
                            </div>
                         )}
                       </TabsContent>
                   </div>
                 </Tabs>
              </div>
            </Card>
          )
        })}
        {courses.length === 0 && (
           <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-muted/10">
             <BookOpen className="w-12 h-12 mb-4 text-muted-foreground/30" />
             <h3 className="font-semibold text-lg text-foreground">No active courses</h3>
             <p className="text-sm mt-1 max-w-sm">You haven't been assigned or enrolled in any specific courses yet for this term.</p>
           </div>
        )}
      </div>
    </div>
  )
}
