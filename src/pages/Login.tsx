import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/store"
import { Navigate, useNavigate } from "react-router-dom"
import { GraduationCap, BookOpen } from "lucide-react"

export function Login() {
  const { login, user } = useStore()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = (role: 'student' | 'professor') => {
    login(role)
    navigate('/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] p-4 relative overflow-hidden font-sans">
      <div className="absolute -top-[500px] -right-[200px] w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute -bottom-[500px] -left-[200px] w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <Card className="w-full max-w-[420px] shadow-2xl shadow-primary/5 border-border rounded-2xl relative z-10 bg-white">
        <CardHeader className="space-y-3 text-center pb-8 pt-10">
          <div className="flex justify-center mb-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg border border-border relative overflow-hidden">
              <img src="/iith-logo.png" alt="IIT Hyderabad" className="h-16 w-16 object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#0F172A]">IITH LMS</CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-widest pt-1">
            Hybrid Intelligent Learning Platform
          </CardDescription>
        </CardHeader>

        <div className="px-8 pb-10 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center mb-5">
            Select your portal to continue
          </p>

          <button
            onClick={() => handleLogin('student')}
            className="w-full flex items-center gap-4 rounded-xl border-2 border-border p-5 transition-all cursor-pointer hover:border-primary hover:bg-primary/5 group text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Student Portal</p>
              <p className="text-xs text-muted-foreground mt-0.5">Access courses, assignments & grades</p>
            </div>
          </button>

          <button
            onClick={() => handleLogin('professor')}
            className="w-full flex items-center gap-4 rounded-xl border-2 border-border p-5 transition-all cursor-pointer hover:border-primary hover:bg-primary/5 group text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Professor Portal</p>
              <p className="text-xs text-muted-foreground mt-0.5">Manage classes, quizzes & attendance</p>
            </div>
          </button>
        </div>
      </Card>

      <p className="fixed bottom-6 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Powered by Smart-Sync Engine v2.4</p>
    </div>
  )
}
