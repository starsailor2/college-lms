import { useStore, ClassSession } from "@/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { CalendarClock, Link2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ScheduleClass() {
  const { user, courses, scheduleClass } = useStore()
  const isProf = user?.role === 'professor'

  const [courseId, setCourseId] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [platform, setPlatform] = useState("Google Meet")
  const [duration, setDuration] = useState("60")
  const [generatedLink, setGeneratedLink] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isProf) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md w-full border-dashed border-2 bg-muted/30">
           <CardContent className="flex flex-col flex-1 items-center justify-center p-6 text-center">
             <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <CalendarClock className="w-6 h-6 text-muted-foreground" />
             </div>
             <p className="text-sm font-semibold text-foreground">Access Restricted</p>
             <p className="text-xs text-muted-foreground mt-1">You do not have permission to schedule classes.</p>
           </CardContent>
        </Card>
      </div>
    )
  }

  const handleGenerate = () => {
    if (!courseId || !date || !time) {
      toast.error("Please fill in all required fields.")
      return
    }
    
    setIsGenerating(true)
    setTimeout(() => {
      const link = `https://${platform.toLowerCase().replace(' ', '')}.com/nexus-${Math.random().toString(36).substring(7)}`
      setGeneratedLink(link)
      setIsGenerating(false)
      
      const selectedCourse = courses.find(c => c.id === courseId)
      
      const newClass: ClassSession = {
        id: Math.random().toString(36).substring(7),
        courseId,
        title: selectedCourse ? selectedCourse.title : "Live Class",
        date: new Date(`${date}T${time}`).toISOString(),
        platform: platform as any,
        link
      }
      
      scheduleClass(newClass)
      toast.success("Meeting link generated and class scheduled!")
    }, 1200)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Live Class</h1>
          <p className="text-muted-foreground text-sm mt-1">Automate meeting creation and intelligently notify enrolled students.</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-fit">
           <Sparkles className="w-3.5 h-3.5" />
           Integration Active
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">
        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted border-b border-border p-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                 <CalendarClock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Session Configuration</CardTitle>
                <CardDescription className="text-xs">Set up the timeline and parameters for the live class.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Select Target Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="h-12 bg-muted/50 border-border">
                  <SelectValue placeholder="Choose a course for this class" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.title} ({course.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Class Date</Label>
                <Input type="date" className="h-12 bg-muted/50 border-border" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Start Time</Label>
                <Input type="time" className="h-12 bg-muted/50 border-border" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Class Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="h-12 bg-muted/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="45">45 Minutes</SelectItem>
                    <SelectItem value="60">1 Hour</SelectItem>
                    <SelectItem value="90">1.5 Hours</SelectItem>
                    <SelectItem value="120">2 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Delivery Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="h-12 bg-muted/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Meet">Google Meet Integration</SelectItem>
                    <SelectItem value="Teams">Microsoft Teams Meeting</SelectItem>
                    <SelectItem value="Zoom">Zoom Pro Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-6">
              {!generatedLink ? (
                <Button onClick={handleGenerate} className="w-full h-12 text-sm font-bold tracking-wide gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl shadow-lg shadow-primary/20" disabled={isGenerating}>
                  {isGenerating ? "Synthesizing Secure Link..." : (
                    <>
                      <Sparkles className="h-4 w-4 text-primary" />
                      Generate Class Link & Notify
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <Alert className="bg-green-50 border-green-200 shadow-sm rounded-xl py-4">
                      <Link2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <AlertTitle className="text-green-800 font-bold mb-2">Automated Link Generated</AlertTitle>
                      <AlertDescription className="text-sm mt-1">
                        <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-green-100 shadow-sm group">
                          <span className="truncate font-mono text-xs text-foreground/80">{generatedLink}</span>
                          <Button size="sm" variant="secondary" className="h-7 text-[10px] font-bold uppercase shrink-0 opacity-80 group-hover:opacity-100 transition-opacity bg-green-100 text-green-700 hover:bg-green-200" onClick={() => {
                              navigator.clipboard.writeText(generatedLink);
                              toast.success("Link copied to clipboard!");
                          }}>Copy</Button>
                        </div>
                      </AlertDescription>
                  </Alert>
                  <Button onClick={() => setGeneratedLink("")} variant="outline" className="w-full h-10 border-border bg-transparent text-xs font-semibold">Schedule Another Session</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-[#0F172A] text-white border-0 shadow-xl relative overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Sparkles className="w-24 h-24" />
            </div>
            <CardHeader className="relative z-10 pb-2">
               <CardTitle className="text-lg font-bold italic">Smart Automation</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
               <p className="text-xs text-white/80 leading-relaxed">
                 When you generate a link, our engine automatically updates student dashboards, sends calendar invites, and initializes the attendance tracker.
               </p>
               <div className="space-y-2 mt-4">
                 <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div> Dashboard Sync Active
                 </div>
                 <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div> Calendar API Connected
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
