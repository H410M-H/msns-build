"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  BookPlus,
  Loader2,
  Search,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// Simplified schema for single subject creation
const formSchema = z.object({
  subjectName: z
    .string()
    .min(2, "Subject name must be at least 2 characters")
    .max(50, "Subject name too long"),
  book: z
    .string()
    .max(100, "Book reference too long")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(500, "Description too long")
    .optional()
    .or(z.literal("")),
});

type SubjectFormValues = z.infer<typeof formSchema>;

// Edit form schema (same as create)
const editFormSchema = formSchema;

type EditFormValues = SubjectFormValues;

// Subject type based on our API
type Subject = {
  subjectId: string;
  subjectName: string;
  book?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Books data
const BOOKS = [
  { isbn: "9780190707583", title: "NEW COUNTDOWN 3E STARTER SNC" },
  { isbn: "9780190708221", title: "New Oxford Modern English Pre-Primer PCTB" },
  { isbn: "9789697340378", title: "UKGKI: KALIAN (PRE-NURSERY) PCTB" },
  { isbn: "9780199067404", title: "URDU KHUSHKHATI SILSILA: INTRO PRE - NUR" },
  { isbn: "9780190705244", title: "MLT: WORLD AROUND ME PRE-NURSERY SNC" },
  { isbn: "9780190707590", title: "NEW COUNTDOWN 3E PRIMER A SNC" },
  { isbn: "9780190707651", title: "NEW OXFORD MODERN ENG PRIMER A DCTE/NCC" },
  { isbn: "9780190708665", title: "UKGKI: GULAB (NURSERY) DCTE/NCC" },
  { isbn: "9780199067411", title: "URDU KHUSHKHATI SILSILA:BK 1 NURSERY REV" },
  { isbn: "9780190705251", title: "MLT: WORLD AROUND ME NURSERY SNC" },
  { isbn: "9780190707606", title: "NEW COUNTDOWN 3E PRIMER B SNC" },
  { isbn: "9780190707668", title: "NEW OXFORD MODERN ENG PRIMER B DCTE/NCC" },
  { isbn: "9780190704339", title: "UKGKI: CHAMBELI (KG) SNC" },
  { isbn: "9780199067428", title: "URDU KHUSHKHATI SILSILA:BK 2 KG REV" },
  { isbn: "9780190705268", title: "MLT: WORLD AROUND ME KINDERGARTEN SNC" },
  { isbn: "9780190707262", title: "MERI DUNIYA 1" },
  { isbn: "9780190706463", title: "SALAM ISLAMIYAT (KI) BOOK 1 DCTE/NCC" },
  { isbn: "9780190706807", title: " NEW COUNTDOWN 3E BOOK 1 SNC" },
  { isbn: "9780190706852", title: "NEW OXFORD MODERN ENGLISH BOOK 1 SNC" },
  {
    isbn: "9780198418092",
    title: "Oxford International Primary History Book 1",
  },
  { isbn: "9780190704346", title: "UKGKI: MOTIA (CLASS 1) SNC" },
  { isbn: "9780190708566", title: "NARDBAN-E-URDU WORKBOOK 1 (SRM)" },
  { isbn: "9780190707279", title: "MERI DUNIYA 2" },
  {
    isbn: "9780198418108",
    title: "Oxford International Primary History Book 2",
  },
  { isbn: "9780190706814", title: "NEW COUNTDOWN 3E BOOK 2 SNC" },
  { isbn: "9780190706470", title: "SALAM ISLAMIYAT (KI) BOOK 2 DCTE/NCC" },
  { isbn: "9780190706869", title: "NEW OXFORD MODERN ENGLISH BOOK 2 SNC" },
  { isbn: "9780190704353", title: "UKGKI: GAINDA (CLASS 2) SNC" },
  { isbn: "9780190708573", title: "NARDBAN-E-URDU WORKBOOK 2 (SRM)" },
  { isbn: "9780190707286", title: "MERI DUNIYA 3" },
  {
    isbn: "9780198418115",
    title: "Oxford International Primary History Book 3",
  },
  { isbn: "9780190706821", title: "NEW COUNTDOWN 3E BOOK 3 SNC" },
  { isbn: "9780190706487", title: "SALAM ISLAMIYAT (KI) BOOK 3 DCTE/NCC" },
  { isbn: "9780190706876", title: "NEW OXFORD MODERN ENGLISH BOOK 3 SNC" },
  { isbn: "9789697340422", title: "UKGKI: SADABAHAR (CLASS 3) PCTB" },
  { isbn: "9780190708580", title: "NARDBAN-E-URDU WORKBOOK 3 (SRM)" },
  { isbn: "9780190706357", title: "PAKISTAN AUR HAMARI DUNYA BOOK 4" },
  { isbn: "9780190700744", title: "THE GRAMMAR TREE BOOK 4 2E" },
  { isbn: "9780190706838", title: "NEW COUNTDOWN 3E BOOK 4 SNC" },
  { isbn: "9780190706494", title: "SALAM ISLAMIYAT (KI) BOOK 4 DCTE/NCC" },
  { isbn: "9780190706883", title: "NEW OXFORD MODERN ENGLISH BOOK 4 SNC" },
  { isbn: "9780190704377", title: "UKGKI: NARGIS (CLASS 4) SNC" },
  { isbn: "9780190707163", title: "The Science Factor Book 4" },
  { isbn: "9780190708597", title: "NARDBAN-E-URDU WORKBOOK 4 (SRM)" },
  { isbn: "9780190706364", title: "PAKISTAN AUR HAMARI DUNYA BOOK 5" },
  { isbn: "9780190700751", title: "THE GRAMMAR TREE BOOK 5 2E" },
  { isbn: "9780190706845", title: "NEW COUNTDOWN 3E BOOK 5 SNC" },
  { isbn: "9780190706500", title: "SALAM ISLAMIYAT (KI) BOOK 5 DCTE/NCC" },
  { isbn: "9780190706890", title: "NEW OXFORD MODERN ENGLISH BOOK 5 SNC" },
  { isbn: "9789697340446", title: "UKGKI: GUL-E-LALA (CLASS 5) PCTB" },
  { isbn: "9780190708603", title: "NARDBAN-E-URDU WORKBOOK 5 (SRM)" },
  { isbn: "9780190700096", title: "New Oxford Primary Science Book 5" },
  { isbn: "9780190700768", title: "THE GRAMMAR TREE BOOK 6 2E" },
  { isbn: "9789697342655", title: "New Countdown Book 6 3rd Edition" },
  {
    isbn: "9789697342983",
    title: "New Oxford Modern English Book 6 3rd Edition",
  },
  {
    isbn: "9789697342808",
    title: "Urdu Ka Guldasta (Khususi Isha'at): Champa Student's Book (SNC)",
  },
  { isbn: "9780190708610", title: "Nardban-e-Urdu Workbook 6" },
  { isbn: "9780190707361", title: "NEW AMAZING SCIENCE BOOK 6" },
  {
    isbn: "9780190703448",
    title: "Secondary History for Pakistan for Grade 6",
  },
  {
    isbn: "9789697343164",
    title: "Secondary Geography for Pakistan for Grade 6",
  },
  { isbn: "9780190700775", title: "THE GRAMMAR TREE BOOK 7 2E" },
  { isbn: "9789697342662", title: "NEW COUNTDOWN 3E BOOK 7 SNC" },
  {
    isbn: "9789697342990",
    title: "New Oxford Modern English Book 7 3rd Edition",
  },
  { isbn: "9789697342815", title: "UKGKI: SOORAJMUKHI (CLASS 7)" },
  { isbn: "9780190708627", title: "NARDBAN-E-URDU WORKBOOK 7 (SRM)" },
  { isbn: "9780190707378", title: "NEW AMAZING SCIENCE BOOK 7" },
  {
    isbn: "9780190703455",
    title: "Secondary History for Pakistan for Grade 7",
  },
  {
    isbn: "9789697343171",
    title: "Secondary Geography for Pakistan for Grade 7",
  },
];

// Edit Dialog Component
function SubjectEditDialog({
  subject,
  onSubjectUpdated,
}: {
  subject: Subject;
  onSubjectUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      subjectName: subject.subjectName,
      book: subject.book ?? "",
      description: subject.description ?? "",
    },
  });

  // Safe API hook with fallback
  const updateSubject = api.subject.updateSubject?.useMutation?.({
    onSuccess: () => {
      toast({
        title: "✅ Subject Updated!",
        description: `${form.getValues("subjectName")} has been updated successfully.`,
        className:
          "bg-gradient-to-r from-green-500 to-emerald-500 text-foreground border-none",
      });
      void utils.subject.getAllSubjects.invalidate();
      onSubjectUpdated();
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        className:
          "bg-gradient-to-r from-red-500 to-orange-500 text-foreground border-none",
      });
    },
  }) || {
    mutate: () => {
      console.warn("Update subject mutation not available");
      toast({
        title: "Feature Not Available",
        description:
          "Subject update is currently unavailable. Please try again later.",
        className:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-foreground border-none",
      });
    },
    isPending: false,
  };

  const onSubmit = (values: EditFormValues) => {
    updateSubject.mutate({
      subjectId: subject.subjectId,
      ...values,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-blue-50 hover:text-blue-600"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Edit Subject</DialogTitle>
        <DialogDescription className="sr-only">
          Edit subject details including name, reference book, and description
        </DialogDescription>
        <div className="p-6">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-800">
            <Edit className="mr-2 h-5 w-5 text-blue-500" />
            Edit Subject
          </h3>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subjectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="book"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Book</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select a book" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        <SelectItem value="no-book">
                          No book selected
                        </SelectItem>
                        {BOOKS.map((book) => (
                          <SelectItem key={book.isbn} value={book.isbn}>
                            {book.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="resize-none rounded-xl"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={updateSubject.isPending}
                >
                  {updateSubject.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Update Subject
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Delete Dialog Component
function SubjectDeleteDialog({
  subject,
  onSubjectDeleted,
}: {
  subject: Subject;
  onSubjectDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  // Safe API hook with fallback
  const deleteSubject = api.subject.deleteSubject?.useMutation?.({
    onSuccess: () => {
      toast({
        title: "🗑️ Subject Deleted!",
        description: `${subject.subjectName} has been permanently removed.`,
        className:
          "bg-gradient-to-r from-red-500 to-orange-500 text-foreground border-none",
      });
      void utils.subject.getAllSubjects.invalidate();
      onSubjectDeleted();
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        className:
          "bg-gradient-to-r from-red-500 to-orange-500 text-foreground border-none",
      });
    },
  }) || {
    mutate: () => {
      console.warn("Delete subject mutation not available");
      toast({
        title: "Feature Not Available",
        description:
          "Subject deletion is currently unavailable. Please try again later.",
        className:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-foreground border-none",
      });
    },
    isPending: false,
  };

  const handleDelete = () => {
    deleteSubject.mutate({ subjectId: subject.subjectId });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Subject</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong>{subject.subjectName}</strong>? This action cannot be undone
            and will permanently remove the subject from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteSubject.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSubject.isPending}
            >
              {deleteSubject.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Subject"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SubjectCreationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectName: "",
      book: "",
      description: "",
    },
  });

  const utils = api.useUtils();

  // Safe API hooks with fallbacks
  const createSubject = api.subject.createSubject?.useMutation?.() || {
    mutateAsync: async () => {
      console.warn("Create subject mutation not available");
      throw new Error("Subject creation is currently unavailable");
    },
    isPending: false,
  };

  const { data: subjects = [], isLoading: loadingSubjects } =
    api.subject.getAllSubjects?.useQuery?.() || {
      data: [],
      isLoading: false,
    };

  // Search filtered subjects
  const filteredSubjects = subjects.filter((subject) => {
    const query = searchQuery.toLowerCase();
    return (
      subject.subjectName.toLowerCase().includes(query) ||
      (subject.book?.toLowerCase().includes(query) ?? false) ||
      (subject.description?.toLowerCase().includes(query) ?? false)
    );
  });

  const onSubmit = async (values: SubjectFormValues) => {
    try {
      await createSubject.mutateAsync({
        subjectName: values.subjectName,
        book: values.book === "no-book" ? undefined : values.book,
        description: values.description ?? undefined,
      });

      toast({
        title: "✅ Subject Created!",
        description: `${values.subjectName} has been successfully added to the database.`,
        className:
          "bg-gradient-to-r from-green-500 to-emerald-500 text-foreground border-none",
      });

      await utils.subject.getAllSubjects.invalidate();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        className:
          "bg-gradient-to-r from-red-500 to-orange-500 text-foreground border-none",
      });
    }
  };

  const handleSubjectUpdated = () => {
    void utils.subject.getAllSubjects.invalidate();
  };

  const handleSubjectDeleted = () => {
    void utils.subject.getAllSubjects.invalidate();
  };

  const isPending = createSubject.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setTimeout(() => form.reset(), 300);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:shadow-md"
        >
          <BookPlus className="mr-2 h-4 w-4 text-blue-500" />
          Manage Subjects
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-hidden overflow-y-auto rounded-[32px] border-border bg-slate-50/50 p-0 shadow-2xl backdrop-blur-3xl sm:max-w-4xl">
        <DialogTitle className="sr-only">
          Create and Manage Subjects
        </DialogTitle>
        <DialogDescription className="sr-only">
          Create new subjects and manage existing subjects in the system
        </DialogDescription>

        <div className="relative p-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <BookPlus className="h-6 w-6 text-foreground" />
            </div>
            <h2 className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-xl font-bold text-transparent">
              Manage Subjects
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create new subjects and manage existing ones
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Create Subject Form */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-800">
                <BookPlus className="mr-2 h-5 w-5 text-blue-500" />
                Create New Subject
              </h3>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Subject Name */}
                  <FormField
                    control={form.control}
                    name="subjectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ml-1 flex items-center justify-between font-semibold text-slate-700">
                          Subject Name
                          <span className="text-xs font-normal text-muted-foreground">
                            Required
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-slate-200 bg-slate-50 transition-all duration-300 focus:bg-white"
                            placeholder="e.g., Mathematics, Physics, Biology"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Book Reference - Now a Select */}
                  <FormField
                    control={form.control}
                    name="book"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ml-1 flex items-center justify-between font-semibold text-slate-700">
                          Reference Book
                          <span className="text-xs font-normal text-muted-foreground">
                            Optional
                          </span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white">
                              <SelectValue placeholder="Select a book from the list" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="no-book">
                              No book selected
                            </SelectItem>
                            {BOOKS.map((book) => (
                              <SelectItem key={book.isbn} value={book.isbn}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {book.title}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ISBN: {book.isbn}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ml-1 flex items-center justify-between font-semibold text-slate-700">
                          Description
                          <span className="text-xs font-normal text-muted-foreground">
                            {field.value?.length ?? 0}/500
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="resize-none rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                            placeholder="Describe the subject content, learning objectives, or curriculum details..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className={cn(
                      "h-12 w-full rounded-xl text-lg font-bold shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0",
                      "bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-200 hover:shadow-blue-300",
                      "disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Subject...
                      </>
                    ) : (
                      "Create Subject"
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>

            {/* Subjects List */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center text-lg font-semibold text-slate-800">
                  <Eye className="mr-2 h-5 w-5 text-green-500" />
                  Existing Subjects ({filteredSubjects.length})
                </h3>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-48 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-4"
                  />
                </div>
              </div>

              {/* Subjects List */}
              <div className="max-h-[300px] space-y-3 overflow-y-auto">
                {loadingSubjects ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredSubjects.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    {searchQuery
                      ? "No subjects found matching your search."
                      : "No subjects created yet."}
                  </div>
                ) : (
                  filteredSubjects.map((subject) => (
                    <div
                      key={subject.subjectId}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-800">
                            {subject.subjectName}
                          </h4>
                          {subject.book && subject.book !== "no-book" && (
                            <p className="mt-1 text-xs text-slate-600">
                              <span className="font-medium">Book:</span>{" "}
                              {BOOKS.find((b) => b.isbn === subject.book)
                                ?.title ?? subject.book}
                            </p>
                          )}
                          {subject.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {subject.description}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            Created:{" "}
                            {new Date(subject.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-3 flex items-center space-x-1">
                          <SubjectEditDialog
                            subject={subject}
                            onSubjectUpdated={handleSubjectUpdated}
                          />
                          <SubjectDeleteDialog
                            subject={subject}
                            onSubjectDeleted={handleSubjectDeleted}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Help Text */}
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="text-center text-xs text-blue-700">
                  Subjects created here will be available for assignment to
                  classes and teachers
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
