import { useStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, CheckCircle, XCircle, Users, Activity, Settings2 } from "lucide-react"
import { toast } from "sonner"

export function Attendance() {
  const { user, attendance, courses, isAttendanceApproved, approveAllAttendance } = useStore()
  const isProf = user?.role === 'professor'

  // If student, filter by student ID, else show all
  const filteredAttendance = isProf ? attendance : attendance.filter(a => a.studentId === user?.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
        <p className="text-muted-foreground">{isProf ? 'Review automatically generated attendance logs.' : 'Your class attendance history.'}</p>
      </div>

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between bg-muted sm:px-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Users className="h-5 w-5" />
             </div>
             <div>
               <CardTitle className="font-bold text-base">Real-time Attendance</CardTitle>
               <CardDescription className="text-xs">Automatically tracked via connection metrics.</CardDescription>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary bg-[#0F172A] px-2 py-1 rounded tracking-wide uppercase hidden sm:block">Powered By Smart-Sync</span>
            {isProf && <Button variant="outline" size="sm" className="bg-background text-[10px] font-bold uppercase tracking-wider h-8">Export CSV</Button>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted border-b border-border">
              <TableRow className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted">
                {isProf && <TableHead className="px-6 py-3">Student Name</TableHead>}
                <TableHead className="px-6 py-3">Course</TableHead>
                <TableHead className="px-6 py-3">Date</TableHead>
                <TableHead className="px-6 py-3">Duration</TableHead>
                <TableHead className="px-6 py-3">Status</TableHead>
                {isProf && <TableHead className="px-6 py-3 text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredAttendance.map(record => {
                const course = courses.find(c => c.id === record.courseId)
                return (
                  <TableRow key={record.id} className="text-sm hover:bg-muted/30 transition-colors border-0">
                    {isProf && (
                      <TableCell className="px-6 py-4 font-semibold text-foreground">
                        <div className="flex flex-col">
                           <span>{record.studentName}</span>
                           <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{record.joinTime} - {record.leaveTime}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="px-6 py-4">
                       <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-bold text-[10px] border border-border">
                          {course?.code}
                       </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs font-medium">
                       {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono text-xs">{record.duration}</TableCell>
                    <TableCell className="px-6 py-4">
                      {record.status === 'Present' ? (
                        <span className="px-2 py-1 rounded bg-green-50 text-green-700 font-bold text-[10px] uppercase tracking-wider border border-green-200 inline-flex items-center gap-1">
                           <CheckCircle className="w-3 h-3" />
                           Present
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-red-50 text-red-700 font-bold text-[10px] uppercase tracking-wider border border-red-200 inline-flex items-center gap-1">
                           <XCircle className="w-3 h-3" />
                           Absent
                        </span>
                      )}
                    </TableCell>
                    {isProf && (
                      <TableCell className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                           <Settings2 className="w-3 h-3 mr-1" />
                           Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {filteredAttendance.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={isProf ? 6 : 5} className="h-32 text-center border-0">
                       <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Activity className="w-8 h-8 opacity-20 mb-2" />
                          <p className="text-sm font-semibold">No attendance records found.</p>
                          <p className="text-xs opacity-70 mt-1">Check back later for newly recorded sessions.</p>
                       </div>
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {isProf && (
           <div className="p-4 border-t border-border flex justify-between items-center bg-muted/50">
             <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
               <Sparkles className="w-3 h-3 text-primary" />
               Attendance auto-marked via platform API
             </div>
             <Button 
               variant={isAttendanceApproved ? "outline" : "default"} 
               size="sm" 
               disabled={isAttendanceApproved}
               className={`h-8 text-[10px] font-bold uppercase tracking-widest ${isAttendanceApproved ? 'text-green-600 border-green-200 bg-green-50' : 'bg-[#0F172A] text-white hover:bg-[#1E293B]'}`}
               onClick={() => {
                 approveAllAttendance();
                 toast.success("Attendance marked as final");
               }}
             >
                {isAttendanceApproved ? <><CheckCircle className="w-3 h-3 mr-2"/> Attendance Approved</> : "Approve All Records"}
             </Button>
           </div>
        )}
      </Card>
    </div>
  )
}