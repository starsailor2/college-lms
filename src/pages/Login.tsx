import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useStore, Role } from "@/store"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles } from "lucide-react"

export function Login() {
  const [role, setRole] = useState<Role>('student')
  const [email, setEmail] = useState('')
  const { login } = useStore()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
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
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 px-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Identity Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@university.edu" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 h-12 text-sm px-4 border-border focus-visible:ring-[#0F172A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Access Code</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                defaultValue="password123"
                className="bg-secondary/50 h-12 text-lg tracking-widest px-4 border-border focus-visible:ring-[#0F172A]"
              />
            </div>
            <div className="space-y-3 pt-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Authentication Role</Label>
              <RadioGroup defaultValue="student" onValueChange={(val) => setRole(val as Role)} className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-center rounded-xl border-2 border-border p-4 transition-all cursor-pointer hover:bg-secondary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 relative text-foreground has-[[data-state=checked]]:text-primary">
                  <RadioGroupItem value="student" id="r1" className="sr-only" />
                  <Label htmlFor="r1" className="cursor-pointer font-bold text-xs uppercase tracking-wider text-center w-full after:absolute after:inset-0">Student</Label>
                </div>
                <div className="flex items-center justify-center rounded-xl border-2 border-border p-4 transition-all cursor-pointer hover:bg-secondary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 relative text-foreground has-[[data-state=checked]]:text-primary">
                  <RadioGroupItem value="professor" id="r2" className="sr-only" />
                  <Label htmlFor="r2" className="cursor-pointer font-bold text-xs uppercase tracking-wider text-center w-full after:absolute after:inset-0">Professor</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="pb-10 pt-4 px-8">
            <Button type="submit" className="w-full text-xs uppercase tracking-widest font-bold h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all">
              Initialize Session
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <p className="fixed bottom-6 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Powered by Smart-Sync Engine v2.4</p>
    </div>
  )
}