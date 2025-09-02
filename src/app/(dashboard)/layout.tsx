import EventsCalendar from '~/components/blocks/academic-calender/events-calender'
import { PageHeader } from '~/components/blocks/nav/PageHeader'
import AdminCards from '~/components/cards/AdminCard'
import { StatsCards } from '~/components/cards/StatCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import EventsTable from '~/components/tables/EventsTable'
import { auth } from '~/server/auth'
import { db } from '~/server/db'
import ProfileCard from '~/components/cards/ProfileCard'
import { Menu, Calendar, User, BookOpen, GraduationCap, Shield, Bell, Sparkles, ChevronRight, Activity, Star, Trophy, Clock } from 'lucide-react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'
import { AppSidebar } from '~/components/blocks/sidebar/app-sidebar'

export default async function AdminDashboard() {
  const session = await auth()
  
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      accountType: true,
    }
  })

  if (!user) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-600">We couldn&apos;t find your profile information.</p>
        </div>
      </div>
    )
  }

  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard", current: true },
  ]

  const isAdmin = user.accountType === 'ADMIN' || user.accountType === 'PRINCIPAL' || user.accountType === 'HEAD'
  const isTeacher = user.accountType === 'TEACHER' || user.accountType === 'FACULTY'
  const isStudent = user.accountType === 'STUDENT'

  // Role-based colors and icons
  const getRoleTheme = () => {
    if (isAdmin) return { 
      gradient: 'from-purple-500 to-indigo-600', 
      bg: 'from-purple-50 to-indigo-100',
      icon: Shield,
      badge: 'Administrator'
    }
    if (isTeacher) return { 
      gradient: 'from-blue-500 to-cyan-600', 
      bg: 'from-blue-50 to-cyan-100',
      icon: GraduationCap,
      badge: 'Educator'
    }
    return { 
      gradient: 'from-green-500 to-emerald-600', 
      bg: 'from-green-50 to-emerald-100',
      icon: BookOpen,
      badge: 'Student'
    }
  }

  const roleTheme = getRoleTheme()
  const RoleIcon = roleTheme.icon

  return (
    <SidebarProvider>
      <div className={`min-h-screen w-screen gradient-to-br ${roleTheme.bg} relative overflow-hidden`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-pulse"></div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-bounce opacity-30" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 right-1/3 w-4 h-4 bg-cyan-400 rounded-full animate-bounce opacity-50" style={{animationDelay: '2s'}}></div>

        <div className="relative z-10">
          
          <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <SidebarInset>
            <AppSidebar />

            {/* Sidebar Trigger */}
            <div className="mb-6">
              <SidebarTrigger className="bg-white/80 hover:bg-white border border-white/40 shadow-lg hover:shadow-xl rounded-xl p-3 transform hover:scale-105 transition-all duration-200">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
                        <PageHeader breadcrumbs={breadcrumbs} />
            </div>

            {/* Hero Welcome Section */}
            <div className="mb-12">
              <div className="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/40 p-8 lg:p-12">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl"></div>
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className={`p-4 bg-gradient-to-br ${roleTheme.gradient} rounded-2xl shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300`}>
                        <RoleIcon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                        {roleTheme.badge}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                          Welcome back,
                        </h1>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                          <Star className="w-4 h-4 text-yellow-400" />
                        </div>
                      </div>
                      
                      <h2 className={`text-2xl lg:text-3xl font-bold bg-gradient-to-r ${roleTheme.gradient} bg-clip-text text-transparent`}>
                        {user.username}!
                      </h2>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Active Session • {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Calendar Button */}
                  <div className="relative group">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="lg"
                          className="relative bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 px-6 py-3 rounded-2xl font-semibold group"
                        >
                          <Calendar className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                          View Calendar
                          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl h-[90vh] bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
                        <DialogHeader className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                          <DialogTitle className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Calendar className="w-7 h-7 text-white" />
                            </div>
                            Academic Calendar
                          </DialogTitle>
                        </DialogHeader>
                        <div className="p-8 overflow-y-auto">
                          <EventsCalendar />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
                  <p className="text-gray-600">Manage your personal information and settings</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-3xl blur-xl transform scale-95 group-hover:scale-100 transition-all duration-500"></div>
                <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/40 transform hover:shadow-3xl hover:-translate-y-1 transition-all duration-500">
                  <ProfileCard />
                </div>
              </div>
            </section>

            {/* Stats Overview */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className={`p-3 bg-gradient-to-br ${roleTheme.gradient} rounded-2xl shadow-xl transform -rotate-1 hover:rotate-0 transition-transform duration-300`}>
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isStudent ? 'Your Academic Overview' : 'Institutional Overview'}
                  </h2>
                  <p className="text-gray-600">Real-time performance metrics</p>
                </div>
                
                <div className="hidden lg:flex items-center gap-2 ml-auto">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Live Data</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${roleTheme.bg.replace('from-', 'from-').replace('to-', 'to-')}/30 rounded-3xl blur-xl transform scale-95 group-hover:scale-100 transition-all duration-500`}></div>
                <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
                  <StatsCards />
                </div>
              </div>
            </section>

            {/* Admin Quick Actions */}
            {isAdmin && (
              <section className="mb-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-400 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-800">Quick Management</h2>
                    <p className="text-gray-600">Administrative tools and controls</p>
                  </div>
                  
                  <div className="hidden lg:flex items-center gap-2 ml-auto">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-gray-500">Admin Access</span>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-3xl blur-xl transform scale-95 group-hover:scale-100 transition-all duration-500"></div>
                  <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40">
                    <AdminCards />
                  </div>
                </div>
              </section>
            )}

            {/* Events Section */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isStudent ? 'Your Upcoming Events' : (isTeacher ? 'Teaching Events' : 'All Events')}
                  </h2>
                  <p className="text-gray-600">Stay updated with latest activities</p>
                </div>
                
                <div className="hidden lg:flex items-center gap-2 ml-auto">
                  <Bell className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-sm text-gray-500">Auto-refresh enabled</span>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/25 to-blue-200/25 rounded-3xl blur-xl transform scale-95 group-hover:scale-100 transition-all duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-4 border-b border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-700 font-medium">Live Event Feed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Updated just now</span>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <EventsTable />
                  </div>
                </div>
              </div>
            </section>

            {/* Role-specific sections */}
            {isStudent && (
              <section className="mb-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-800">Your Courses</h2>
                    <p className="text-gray-600">Track your academic progress</p>
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Course Information Coming Soon</h3>
                    <p className="text-gray-600">Your enrolled courses will appear here</p>
                  </div>
                </div>
              </section>
            )}

            {isTeacher && (
              <section className="mb-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-800">Your Classes</h2>
                    <p className="text-gray-600">Manage your teaching schedule</p>
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Class Management Coming Soon</h3>
                    <p className="text-gray-600">Your teaching assignments will appear here</p>
                  </div>
                </div>
              </section>
            )}
</SidebarInset>

            {/* Footer spacing */}
            <div className="h-20"></div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}