import { useStore, ClassSession } from "@/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { CalendarClock, Link2, Sparkles, Video } from "lucide-react"
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
      const platformSlug = platform === 'Google Meet' ? 'meet.google' : platform === 'Teams' ? 'teams.microsoft' : 'zoom'
      const link = `https://${platformSlug}.com/nexus-${Math.random().toString(36).substring(7)}`
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
    <div className="space-y-6">
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

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Main form card */}
        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted border-b border-border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <CalendarClock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Session Configuration</CardTitle>
                <CardDescription className="text-xs mt-0.5">Set up the timeline and parameters for the live class.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-8">
            {/* Course selector — full width */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Select Target Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="h-12 bg-muted/50 border-border w-full">
                  {courseId ? (
                    <span className="truncate text-sm font-medium">
                      {courses.find(c => c.id === courseId)?.title}
                      <span className="text-muted-foreground ml-2 text-xs">({courses.find(c => c.id === courseId)?.code})</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Choose a course for this class</span>
                  )}
                </SelectTrigger>
                <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id} className="py-2.5">
                      <span className="font-semibold">{course.title}</span>
                      <span className="text-muted-foreground ml-2 text-xs">({course.code})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date + Time in 2 columns */}
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

            {/* Duration — narrower, on its own row */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Class Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-12 bg-muted/50 border-border w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-[12rem]">
                  <SelectItem value="30">30 Minutes</SelectItem>
                  <SelectItem value="45">45 Minutes</SelectItem>
                  <SelectItem value="60">1 Hour</SelectItem>
                  <SelectItem value="90">1.5 Hours</SelectItem>
                  <SelectItem value="120">2 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Platform — full width so names fit */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Delivery Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-12 bg-muted/50 border-border w-full">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Video className={`w-4 h-4 shrink-0 ${platform === 'Google Meet' ? 'text-green-600' : 'text-blue-600'}`} />
                    {platform === 'Google Meet' ? 'Google Meet' : platform === 'Teams' ? 'Microsoft Teams' : 'Zoom'}
                  </span>
                </SelectTrigger>
                <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="Google Meet" className="py-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-green-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Google Meet</p>
                        <p className="text-xs text-muted-foreground">Auto-generate Meet link</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Teams" className="py-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Microsoft Teams</p>
                        <p className="text-xs text-muted-foreground">Create Teams meeting</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Zoom" className="py-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Zoom</p>
                        <p className="text-xs text-muted-foreground">Generate Zoom meeting link</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t border-border">
              {!generatedLink ? (
                <Button
                  onClick={handleGenerate}
                  className="w-full h-14 text-sm font-bold tracking-wide gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl shadow-lg shadow-primary/20"
                  disabled={isGenerating}
                >
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
                    <AlertDescription>
                      <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-green-100 shadow-sm gap-3 group">
                        <span className="truncate font-mono text-xs text-foreground/80">{generatedLink}</span>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 text-[10px] font-bold uppercase shrink-0 bg-green-100 text-green-700 hover:bg-green-200"
                          onClick={() => { navigator.clipboard.writeText(generatedLink); toast.success("Link copied!"); }}
                        >
                          Copy
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                  <Button onClick={() => setGeneratedLink("")} variant="outline" className="w-full h-10 border-border bg-transparent text-xs font-semibold">
                    Schedule Another Session
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar info card */}
        <div className="space-y-4">
          <Card className="bg-[#0F172A] text-white border-0 shadow-xl relative overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="w-28 h-28" />
            </div>
            <CardHeader className="relative z-10 pb-2 pt-7 px-7">
              <CardTitle className="text-xl font-bold italic">Smart Automation</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-5 pb-7 px-7">
              <p className="text-sm text-white/80 leading-relaxed">
                When you generate a link, our engine automatically updates student dashboards, sends calendar invites, and initializes the attendance tracker.
              </p>
              <div className="space-y-2.5">
                {[
                  'Dashboard Sync Active',
                  'Calendar API Connected',
                  'Attendance Tracker Ready',
                  'Student Notifications Enabled',
                ].map(label => (
                  <div key={label} className="flex items-center gap-2.5 text-[11px] uppercase font-bold tracking-wider text-white/60">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                    {label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scheduled sessions list */}
          <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted border-b border-border p-4">
              <CardTitle className="text-sm font-bold">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {useStore.getState().classes
                .filter(c => new Date(c.date) > new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(cls => {
                  const course = useStore.getState().courses.find(c => c.id === cls.courseId)
                  return (
                    <div key={cls.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0 text-center">
                        <span className="text-[9px] font-bold uppercase leading-none">{new Date(cls.date).toLocaleDateString('en', { month: 'short' })}</span>
                        <span className="text-sm font-black leading-none">{new Date(cls.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{cls.title}</p>
                        <p className="text-[10px] text-muted-foreground">{course?.code} · {new Date(cls.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0">{cls.platform === 'Google Meet' ? 'Meet' : cls.platform}</span>
                    </div>
                  )
                })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
