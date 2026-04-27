import { useStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, Users, Clock, Loader2, ArrowRight, Sparkles, Video, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function Dashboard() {
  const { user, courses, classes, assignments } = useStore()
  const isProf = user?.role === 'professor'

  if (!user) return null

  const upcomingClasses = classes.filter(c => new Date(c.date) > new Date())
  const todayClasses = upcomingClasses.slice(0, 4)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground">Here is an overview of your {isProf ? 'teaching schedule' : 'learning progress'} today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-[#64748B] text-xs font-medium uppercase tracking-tight">Total Courses</CardTitle>
            <span className="bg-green-50 text-green-600 text-[10px] px-1.5 py-0.5 rounded font-bold">+12%</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{courses.length}</div>
            <p className="text-[10px] text-[#94A3B8] mt-1">Active enrollments</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-[#64748B] text-xs font-medium uppercase tracking-tight">Upcoming Classes</CardTitle>
            <span className="bg-orange-50 text-orange-600 text-[10px] px-1.5 py-0.5 rounded font-bold">Urgent</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{todayClasses.length}</div>
            <p className="text-[10px] text-[#94A3B8] mt-1">Scheduled for today</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-[#64748B] text-xs font-medium uppercase tracking-tight">Pending Assignments</CardTitle>
            <span className="text-[#22C55E] flex items-center gap-1"><Sparkles className="w-3 h-3" /></span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {assignments.filter(a => isProf ? a.status === 'submitted' : a.status === 'pending').length}
            </div>
            <p className="text-[10px] text-[#94A3B8] mt-1">Smart-Automation Priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="border-border shadow-sm flex flex-col md:col-span-3">
          <CardHeader className="bg-muted border-b border-border p-5 flex flex-row items-center justify-between rounded-t-2xl">
            <div className="flex flex-col gap-1">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" /> Live Sessions
               </CardTitle>
               <CardDescription className="text-xs">Your upcoming live classes and meetings.</CardDescription>
            </div>
            <span className="text-[10px] font-bold text-primary-foreground bg-[#0F172A] px-2 py-1 rounded tracking-wide uppercase">Powered By Smart-Sync</span>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 pt-6 px-0 overflow-hidden rounded-b-2xl">
            {todayClasses.length === 0 ? (
              <div className="text-sm text-muted-foreground p-8 text-center border border-dashed rounded-lg bg-secondary/50 mx-6">
                No live classes scheduled for today.
              </div>
            ) : (
              <div className="space-y-0">
                {todayClasses.map((cls, index) => {
                  const course = courses.find(c => c.id === cls.courseId)
                  
                  // Mock live status for the first item
                  const isLive = index === 0 && new Date(cls.date).getTime() - new Date().getTime() < 3600000;
                  
                  return (
                    <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 md:px-6 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 ring-1 ring-primary/20">
                        <span className="text-[10px] font-bold uppercase">{new Date(cls.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-base font-black leading-none">{new Date(cls.date).getDate()}</span>
                      </div>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-bold text-foreground truncate">{cls.title}</p>
                           {isLive && (
                              <Badge variant="destructive" className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-wider animate-pulse flex shrink-0 items-center gap-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Live
                              </Badge>
                           )}
                           {!isLive && (
                             <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 flex shrink-0">
                               Upcoming
                             </Badge>
                           )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center flex-wrap gap-x-3 gap-y-1">
                          <span className="font-medium text-foreground/80">{course?.code}</span>
                          <span className="flex items-center gap-1 opacity-80">
                            <Clock className="w-3 h-3" />
                            {new Date(cls.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0">
                        <Button 
                          asChild 
                          size={isLive ? "default" : "sm"} 
                          variant={isLive ? "default" : "outline"}
                          className={`gap-2 w-full sm:w-auto ${isLive ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md' : 'text-xs font-semibold'}`}
                        >
                          <a href={cls.link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full h-full">
                            {isProf ? 'Start Session' : 'Join Class'}
                            {isLive ? <PlayCircle className="w-4 h-4 shrink-0" /> : <ArrowRight className="w-3 h-3 shrink-0" />}
                          </a>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-[#0F172A] shadow-lg flex flex-col md:col-span-2 bg-[#0F172A] text-white overflow-hidden relative rounded-2xl">
          <CardHeader className="z-10 relative pb-4">
            <CardTitle className="text-lg font-bold italic">Student Progress</CardTitle>
            <CardDescription className="text-white/70 text-xs mt-1">Intelligently tracked learning flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col z-10 relative pt-2">
             {courses.slice(0, 4).map(course => (
              <div key={course.id} className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-white truncate flex-1 pr-4">{course.title}</span>
                  <span className="text-primary font-mono text-xs">{course.progress || 0}%</span>
                </div>
                <Progress value={course.progress || 0} className="h-1.5 bg-white/10 [&>div]:bg-primary" />
              </div>
             ))}
             
             <div className="mt-auto pt-6">
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold tracking-wide text-xs">
                   View Full Analytics
                </Button>
             </div>
          </CardContent>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 blur-[64px] rounded-full z-0 pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-orange-500/20 blur-[32px] rounded-full z-0 pointer-events-none"></div>
        </Card>
      </div>
    </div>
  )
}
