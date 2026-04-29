import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboard, BookOpen, CalendarPlus, ClipboardList, UserCheck, GraduationCap, LogOut, Video, ClipboardCheck } from "lucide-react"
import { useStore } from "@/store"
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function AppLayout() {
  const { user, logout } = useStore()
  const navigate = useNavigate()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const profLinks = [
    { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Courses", url: "/courses", icon: BookOpen },
    { title: "Class Setup", url: "/schedule", icon: Video },
    { title: "Assessments", url: "/assignments", icon: ClipboardList },
    { title: "Quizzes", url: "/quizzes", icon: ClipboardCheck },
    { title: "Attendance", url: "/attendance", icon: UserCheck },
    { title: "Gradebook", url: "/grades", icon: GraduationCap },
  ]

  const studentLinks = [
    { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
    { title: "Courses", url: "/courses", icon: BookOpen },
    { title: "Assignments", url: "/assignments", icon: ClipboardList },
    { title: "Quizzes", url: "/quizzes", icon: ClipboardCheck },
    { title: "Attendance", url: "/attendance", icon: UserCheck },
    { title: "Grades", url: "/grades", icon: GraduationCap },
  ]

  const links = user.role === 'professor' ? profLinks : studentLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar className="border-r border-border bg-sidebar font-sans">
          <SidebarHeader className="p-6 pb-8">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-border shrink-0">
                <img src="/iith-logo.png" alt="IITH" className="h-9 w-9 object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">IITH LMS</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {links.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center w-full gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                              : "text-muted-foreground hover:bg-secondary cursor-pointer font-medium hover:text-foreground"
                          }`
                        }
                      >
                        <item.icon className="h-[18px] w-[18px] stroke-[2.5px] shrink-0" />
                        <span className="text-sm tracking-wide truncate">{item.title}</span>
                      </NavLink>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-6 border-t border-border">
            <div className="bg-secondary rounded-xl p-4 border border-border mb-6 shadow-sm">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1 leading-none">Current Role</p>
              <p className="text-sm font-bold text-foreground leading-tight">{user.role === 'professor' ? 'Professor Portal' : 'Student Portal'}</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border bg-secondary">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="font-bold">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-bold leading-tight truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground font-medium truncate">{user.email}</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-red-50 group font-semibold text-xs tracking-wide h-9 rounded-lg" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4 stroke-[2.5px] group-hover:stroke-destructive transition-colors" />
                Sign out
              </Button>
            </div>
          </div>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 w-full bg-background overflow-hidden relative">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-8 sticky top-0 z-10 transition-colors shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-mx-2 opacity-70 hover:opacity-100" />
              <h1 className="text-lg font-semibold hidden md:block">Active Workspace</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider hidden md:block">v2.4 Stable</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">System Active</span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
             <div className="mx-auto w-full max-w-6xl">
                <Outlet />
             </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}