"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { BookPlus, Link2, ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { toast } from "~/hooks/use-toast"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

// --- Schemas (Kept the same, just organized) ---
const formSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    subjectName: z.string().min(2, "Name too short").max(50),
    book: z.string().max(100).optional().or(z.literal("")),
    description: z.string().max(500).optional().or(z.literal("")),
  }),
  z.object({
    mode: z.literal("assign"),
    subjectId: z.string().min(1, "Subject required"),
    employeeId: z.string().min(1, "Teacher required"),
    sessionId: z.string().min(1, "Session required"),
  }),
])

type SubjectFormValues = z.infer<typeof formSchema>

// --- Animated Components ---

const ModeCard = ({ 
  title, 
  icon: Icon, 
  description, 
  gradient, 
  onClick 
}: { 
  title: string, 
  icon: React.ElementType, 
  description: string, 
  gradient: string, 
  onClick: () => void 
}) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "relative overflow-hidden rounded-3xl p-6 text-left h-full w-full",
      "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]",
      "transition-shadow duration-300 border border-white/20",
      gradient
    )}
  >
    <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
    <div className="relative z-10 flex flex-col h-full justify-between text-white">
      <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-white/80 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.button>
)

export function SubjectCreationDialog({ classId, open, onOpenChange }: { classId: string, open: boolean, onOpenChange: (o: boolean) => void }) {
  const [step, setStep] = useState<"select" | "create" | "assign">("select")
  
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { mode: "create" }, // Default, will be overridden by step
  })

  const utils = api.useUtils()

  // API Hooks
  const { data: subjects, isLoading: loadingSubjects } = api.subject.getAllSubjects.useQuery(undefined, { enabled: step === "assign" && open })
  const { data: teachers, isLoading: loadingTeachers } = api.employee.getEmployeesByDesignation.useQuery({ designation: "TEACHER" }, { enabled: step === "assign" && open })
  const { data: sessions, isLoading: loadingSessions } = api.session.getSessions.useQuery(undefined, { enabled: step === "assign" && open })

  const createSubject = api.subject.createSubject.useMutation()
  const assignSubject = api.subject.assignSubjectToClass.useMutation()

  const handleModeSelect = (mode: "create" | "assign") => {
    if (mode === "create") {
      form.reset({ mode: "create", subjectName: "", book: "", description: "" })
    } else {
      form.reset({ mode: "assign", subjectId: "", employeeId: "", sessionId: "" })
    }
    setStep(mode)
  }

  const onSubmit = async (values: SubjectFormValues) => {
    try {
      if (values.mode === "create") {
        await createSubject.mutateAsync({
          subjectName: values.subjectName,
          book: values.book ?? undefined,
          description: values.description ?? undefined,
        })
        toast({ 
          title: "✨ Subject Forged!", 
          description: "New curriculum has been added to the database.",
          className: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-none"
        })
        await utils.subject.getAllSubjects.invalidate()
      } else {
        await assignSubject.mutateAsync({
          classId,
          subjectId: values.subjectId,
          employeeId: values.employeeId,
          sessionId: values.sessionId,
        })
        toast({ 
          title: "🔗 Connection Established", 
          description: "Subject has been successfully mapped to this class.",
          className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none"
        })
        await utils.subject.getSubjectsByClass.invalidate({ classId })
      }
      onOpenChange(false)
      setTimeout(() => setStep("select"), 300) // Reset after close
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message })
    }
  }

  const isPending = createSubject.isPending || assignSubject.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v)
      if (!v) setTimeout(() => setStep("select"), 300)
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm hover:shadow-md transition-all duration-300 font-semibold"
        >
          <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
          Manage Subjects
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-slate-50/50 backdrop-blur-3xl border-white/40 shadow-2xl rounded-[32px]">
        <div className="p-6 relative">
          
          {/* Header Area */}
          <div className="mb-6 flex items-center justify-between">
            {step !== "select" ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setStep("select")}
                className="rounded-full hover:bg-slate-200/50 -ml-2"
              >
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </Button>
            ) : <div className="w-9" />} {/* Spacer */}
            
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
              {step === "select" ? "Subject Command" : step === "create" ? "New Subject" : "Assign Subject"}
            </h2>
            <div className="w-9" /> {/* Spacer */}
          </div>

          <AnimatePresence mode="wait">
            {step === "select" ? (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[300px]"
              >
                <ModeCard 
                  title="Create New" 
                  description="Register a completely new subject into the global database."
                  icon={BookPlus}
                  gradient="bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500"
                  onClick={() => handleModeSelect("create")}
                />
                <ModeCard 
                  title="Assign to Class" 
                  description="Link an existing subject and teacher to this specific class."
                  icon={Link2}
                  gradient="bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500"
                  onClick={() => handleModeSelect("assign")}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    
                    {step === "create" && (
                      <>
                        <FormField
                          control={form.control}
                          name="subjectName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-500 font-semibold ml-1">Subject Title</FormLabel>
                              <FormControl>
                                <Input {...field} className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all duration-300 h-11" placeholder="e.g. Quantum Physics" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <div className="grid grid-cols-1 gap-4">
                            <FormField
                              control={form.control}
                              name="book"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-500 font-semibold ml-1">Reference Book</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white h-11" placeholder="Author / Publisher" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                        </div>
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-500 font-semibold ml-1">Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white resize-none" placeholder="What will students learn?" rows={3} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {step === "assign" && (
                      <>
                        <FormField
                          control={form.control}
                          name="subjectId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-500 font-semibold ml-1">Select Subject</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={loadingSubjects}>
                                <FormControl>
                                  <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-200">
                                    <SelectValue placeholder={loadingSubjects ? "Loading..." : "Choose Subject"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl">
                                  {subjects?.map(s => <SelectItem key={s.subjectId} value={s.subjectId}>{s.subjectName}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="employeeId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-500 font-semibold ml-1">Teacher</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value} disabled={loadingTeachers}>
                                    <FormControl>
                                      <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-200">
                                        <SelectValue placeholder={loadingTeachers ? "..." : "Teacher"} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                      {teachers?.map(t => <SelectItem key={t.employeeId} value={t.employeeId}>{t.employeeName}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="sessionId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-500 font-semibold ml-1">Session</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value} disabled={loadingSessions}>
                                    <FormControl>
                                      <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-200">
                                        <SelectValue placeholder={loadingSessions ? "..." : "Year"} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                      {sessions?.map(s => <SelectItem key={s.sessionId} value={s.sessionId}>{s.sessionName}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                      </>
                    )}

                    <Button 
                      type="submit" 
                      className={cn(
                        "w-full h-12 rounded-xl text-lg font-bold shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0",
                        step === "create" 
                          ? "bg-gradient-to-r from-rose-500 to-fuchsia-600 shadow-rose-200 hover:shadow-rose-300"
                          : "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-200 hover:shadow-cyan-300"
                      )}
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="animate-spin mr-2" /> : (step === "create" ? "Create Subject" : "Assign to Class")}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}