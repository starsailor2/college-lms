import { useStore, Assignment } from "@/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"
import { GraduationCap, Award, FileText, Settings2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Grades() {
  const { user, assignments, courses, gradeAssignment } = useStore()
  const isProf = user?.role === 'professor'

  const displayRows: any[] = []
  courses.forEach(course => {
    let courseAssignments = assignments.filter(a => a.courseId === course.id)
    if (isProf) {
      courseAssignments = courseAssignments.filter(a => a.status !== 'pending')
    }
    
    if (courseAssignments.length === 0) {
      displayRows.push({
        isPlaceholder: true,
        id: `placeholder-${course.id}`,
        title: 'No assessments available',
        courseId: course.id,
        status: 'ungraded',
        marks: null,
        feedback: ''
      })
    } else {
      courseAssignments.forEach(a => {
        displayRows.push({
          isPlaceholder: false,
          ...a
        })
      })
    }
    })


  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Grades & Feedback</h1>
        <p className="text-muted-foreground">{isProf ? 'Grade assignments and provide feedback.' : 'View your academic performance.'}</p>
      </div>

      <Card className="border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between bg-muted sm:px-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-sm">
                <GraduationCap className="h-5 w-5" />
             </div>
             <div>
               <CardTitle className="font-bold text-base">Academic Records</CardTitle>
               <CardDescription className="text-xs">Comprehensive overview of assessment scores.</CardDescription>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary bg-[#0F172A] px-2 py-1 rounded tracking-wide uppercase hidden sm:block">Powered By Smart-Sync</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted border-b border-border">
              <TableRow className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted">
                <TableHead className="px-6 py-3">Assessment Title</TableHead>
                <TableHead className="px-6 py-3 hidden md:table-cell">Course</TableHead>
                {isProf && <TableHead className="px-6 py-3">Status</TableHead>}
                <TableHead className="px-6 py-3">Score</TableHead>
                <TableHead className="px-6 py-3 hidden sm:table-cell">Feedback Notes</TableHead>
                {isProf && <TableHead className="px-6 py-3 text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {displayRows.map(asgn => {
                const course = courses.find(c => c.id === asgn.courseId)
                return (
                  <TableRow key={asgn.id} className="text-sm hover:bg-muted/30 transition-colors border-0">
                    <TableCell className="px-6 py-4 font-semibold text-foreground flex items-center gap-2">
                       {asgn.isPlaceholder ? (
                         <span className="text-muted-foreground italic text-xs font-normal">No assessments initialized</span>
                       ) : (
                         <>
                           <FileText className="w-4 h-4 text-muted-foreground/50" />
                           {asgn.title}
                         </>
                       )}
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden md:table-cell">
                       <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-bold text-[10px] border border-border">
                          {course?.code}
                       </span>
                    </TableCell>
                    {isProf && (
                      <TableCell className="px-6 py-4">
                        {asgn.isPlaceholder ? (
                          <span className="text-muted-foreground italic text-[10px] uppercase">N/A</span>
                        ) : asgn.status === 'graded' ? (
                          <span className="px-2 py-1 rounded bg-green-50 text-green-700 font-bold text-[10px] uppercase tracking-wider border border-green-200">
                             Graded
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-orange-50 text-orange-700 font-bold text-[10px] uppercase tracking-wider border border-orange-200">
                             Needs Review
                          </span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="px-6 py-4">
                      {asgn.status === 'graded' ? (
                        <div className="flex items-center gap-1.5 font-bold">
                           <Award className="w-4 h-4 text-primary" />
                           <span className="text-base leading-none">{asgn.marks}</span>
                           <span className="text-muted-foreground font-normal text-[10px] uppercase">/ 100</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs font-medium">
                          {isProf && asgn.status === 'submitted' ? 'Needs Review' : 'Ungraded'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden sm:table-cell">
                       {asgn.isPlaceholder ? (
                          <span className="text-muted-foreground/50 italic text-xs">-</span>
                       ) : asgn.feedback ? (
                          <p className="truncate max-w-[200px] text-xs italic text-muted-foreground border-l-2 border-primary/30 pl-2">"{asgn.feedback}"</p>
                       ) : (
                          <span className="text-muted-foreground/50 italic text-xs">No feedback</span>
                       )}
                    </TableCell>
                    {isProf && (
                      <TableCell className="px-6 py-4 text-right">
                        {!asgn.isPlaceholder && (
                          <Button 
                            variant={asgn.status === 'graded' ? 'ghost' : 'default'} 
                            size="sm" 
                            className={`h-8 px-3 text-[10px] font-bold uppercase tracking-wider ${asgn.status === 'graded' ? '' : 'bg-primary text-primary-foreground gap-1.5'}`}
                            onClick={() => navigate(`/assignments/${asgn.id}`)}
                          >
                            {asgn.status !== 'graded' && <Settings2 className="w-3 h-3" />}
                            {asgn.status === 'graded' ? 'Edit' : 'Evaluate'}
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {displayRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isProf ? 6 : 5} className="h-32 text-center border-0">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                       <Award className="w-8 h-8 opacity-20 mb-2" />
                       <p className="text-sm font-semibold">No grading records found.</p>
                       <p className="text-xs opacity-70 mt-1">Check back later for newly submitted assessments.</p>
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